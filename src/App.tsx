import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Plus, CheckSquare, Calendar, Folder, Users, 
  Settings, Bell, Search, Sparkles, X, 
  Mic, MicOff, Volume2, ArrowUp, Loader2, 
  MessageSquare, FileText, Lock, Globe, Image as ImageIcon,
  MoreHorizontal, ChevronDown, ListTodo, Presentation, PlayCircle,
  Video, Clock, FileWarning, ArrowRight, History, User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { HuggingFaceLogo } from './components/Logo';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  actions?: { type: string; text?: string; emoji?: string }[];
}

interface Topic {
  _id: string;
  topic_id: string;
  title: string;
  created_at: string;
}

interface UserData {
  id: string;
  telegram_id: string;
  username: string;
  name: string;
  photoUrl?: string;
  hfApiKey?: string;
}


const InputAccessory = ({ onUpload }: { onUpload: (file: File) => void }) => {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <AnimatePresence>
        {open && (
           <motion.div 
             initial={{opacity: 0, scale: 0.9, y: 10}} 
             animate={{opacity: 1, scale: 1, y: 0}} 
             exit={{opacity: 0, scale: 0.9, y: 10}} 
             transition={{ duration: 0.15 }}
             className="absolute bottom-full left-0 mb-3 bg-white border border-neutral-200 shadow-xl rounded-2xl flex items-center gap-1 p-1.5 z-50 overflow-hidden"
           >
             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 active:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 whitespace-nowrap transition-colors">
               <Folder className="w-4 h-4 text-amber-500" /> Upload File
             </button>
             <button onClick={() => setOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl ml-1 transition-colors">
               <X className="w-4 h-4" />
             </button>
           </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setOpen(!open)} 
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.08)]",
          open 
            ? "bg-neutral-800 text-white rotate-45" 
            : "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 hover:scale-105 active:scale-95"
        )}
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [authApiKey, setAuthApiKey] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string>('');
  
  const [attachment, setAttachment] = useState<{name: string, type: string, data: string} | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check if the user is already stored from OIDC flow redirect
    const savedUserStr = localStorage.getItem('hfapi_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        setUser(u);
        loadTopics(u.telegram_id || u.id);
        return;
      } catch (e) {
        localStorage.removeItem('hfapi_user');
      }
    }

    // Telegram Mini App auto-login
    const tgApp = (window as any).Telegram?.WebApp;
    if (tgApp && tgApp.initData) {
      setAuthLoading(true);
      fetch('/api/web/telegram-miniapp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tgApp.initData })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
           setUser(data.user);
           localStorage.setItem('hfapi_user', JSON.stringify(data.user));
           loadTopics(data.user.telegram_id || data.user.id);
        }
      })
      .catch(err => console.error('MiniApp login failed:', err))
      .finally(() => setAuthLoading(false));
    } else {
      // Auto login as anonymous user for web
      const randomId = `anon_${Math.random().toString(36).substring(2, 9)}`;
      const anonUser = { id: randomId, telegram_id: randomId, name: 'Guest User' };
      setUser(anonUser);
      localStorage.setItem('hfapi_user', JSON.stringify(anonUser));
      loadTopics(randomId);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const loadTopics = async (userId: string) => {
    try {
      const res = await fetch(`/api/web/topics/${userId}`);
      const data = await res.json();
      if (data.success) setTopics(data.topics);
    } catch (e) {
      console.error("Failed to load topics", e);
    }
  };

  const loadHistory = async (topicId: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/web/history/${user.telegram_id}/${topicId}`);
      const data = await res.json();
      if (data.success) {
        setMessages((data.history || []).map((m: any, i: number) => ({
          id: `hist_${i}`,
          role: m.role,
          content: m.content
        })));
        setCurrentTopicId(topicId);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setTopics([]);
    setAuthApiKey('');
    localStorage.removeItem('hfapi_user');
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentTopicId(`topic_${Date.now()}`);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || !user || !user.hfApiKey) return;

    let displayContent = input.trim();
    if (attachment) {
      displayContent = `[Attached: ${attachment.name}]\n` + displayContent;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: displayContent };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentAttachment = attachment;
    setAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);
    setStatusMessage('🤔 Thinking...');

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input.trim() || "What is in this file?",  
          history,  
          hfApiKey: user.hfApiKey, 
          userName: user.name, 
          userId: user.telegram_id, 
          topicId: currentTopicId || `topic_${Date.now()}`,
          attachment: currentAttachment
        })
      });

      if (res.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (reader) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';
          
          for (const part of parts) {
            if (part.startsWith('data: ')) {
              try {
                const data = JSON.parse(part.slice(6));
                if (data.type === 'status') {
                  setStatusMessage(data.status);
                } else if (data.type === 'done') {
                  const result = data.result;
                  const images = result.actions?.filter((a: any) => a.type === 'image').map((a: any) => a.url) || [];
                  const otherActions = result.actions?.filter((a: any) => a.type !== 'image') || [];
                  
                  setMessages(prev => [...prev, { 
                    id: Date.now().toString(), role: 'assistant', content: result.response,
                    images: images.length > 0 ? images : undefined, actions: otherActions.length > 0 ? otherActions : undefined
                  }]);
                  
                  if (messages.length === 1) loadTopics(user.telegram_id);
                }
              } catch (e) {}
            }
          }
        }
      } else {
        const data = await res.json();
        
        if (data.error) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `❌ Error: ${data.error}` }]);
        } else {
          const images = data.actions?.filter((a: any) => a.type === 'image').map((a: any) => a.url) || [];
          const otherActions = data.actions?.filter((a: any) => a.type !== 'image') || [];
          
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), role: 'assistant', content: data.response,
            images: images.length > 0 ? images : undefined, actions: otherActions.length > 0 ? otherActions : undefined
          }]);
          
          if (messages.length === 1) loadTopics(user.telegram_id);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: '❌ Connection error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---------------- AUTH SCREEN ----------------
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
         <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // ---------------- API KEY PROMPT SCREEN ----------------
  if (!user.hfApiKey) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-neutral-100 overflow-hidden relative p-8"
        >
          <div className="text-center mb-6">
             <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold font-display text-neutral-800 mb-2">API Key Required</h2>
             <p className="text-neutral-500 text-sm">Please provide your Hugging Face API key to continue using the AI features. You only need to do this once.</p>
          </div>
          
          <div className="space-y-4">
             <div>
               <input 
                 type="password" value={authApiKey}
                 onChange={e => setAuthApiKey(e.target.value)}
                 placeholder="hf_..."
                 className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
               />
             </div>
             {authError && (
               <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 font-medium">
                 {authError}
               </div>
             )}
             <button 
               onClick={async () => {
                 if (!authApiKey.trim()) return;
                 setAuthLoading(true);
                 setAuthError('');
                 try {
                   const res = await fetch('/api/web/update-api-key', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ telegramId: user.telegram_id, apiKey: authApiKey.trim() })
                   });
                   const data = await res.json();
                   if (data.success) {
                     setUser(data.user);
                     localStorage.setItem('hfapi_user', JSON.stringify(data.user));
                   } else {
                     setAuthError(data.error || 'Failed to update API key');
                   }
                 } catch(e: any) {
                   setAuthError(e.message || 'Network error');
                 } finally {
                   setAuthLoading(false);
                 }
               }}
               disabled={authLoading || !authApiKey.trim()}
               className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
             >
               {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save API Key & Continue'}
             </button>
             <button onClick={handleLogout} className="w-full py-2 text-neutral-500 hover:text-neutral-800 text-sm font-medium transition-colors">
               Cancel and Logout
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------------- MAIN APP UI ----------------
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      setAttachment({ name: file.name, type: file.type || 'application/octet-stream', data });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-[100dvh] bg-[#F7F7F9] text-neutral-900 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed md:hidden inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Exact style from video */}
      <motion.div 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#F7F7F9] flex flex-col transition-transform duration-300 ease-out h-[100dvh] shrink-0 border-r border-neutral-200/50",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        )}
      >
        {/* User Profile Header */}
        <div className="p-5 pb-3">
           <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-neutral-200 shadow-sm flex items-center justify-center">
                   {user.photoUrl ? <img src={user.photoUrl} alt="User" /> : <span className="font-bold text-neutral-600">{(user.name||'U').charAt(0).toUpperCase()}</span>}
                </div>
                <span className="font-semibold text-neutral-800 text-[15px]">{user.name || 'User'}</span>
              </div>
              <button className="text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"><Bell className="w-4 h-4" /></button>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-neutral-400 p-1"><X className="w-5 h-5" /></button>
           </div>
        </div>

        {/* Primary Nav */}
        <div className="px-3 py-2 space-y-0.5">
           <button onClick={startNewChat} className="w-full flex items-center justify-between px-3 py-2.5 bg-white text-neutral-900 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-neutral-200/60 font-medium text-sm transition-all group">
             <div className="flex items-center gap-3"><Home className="w-[18px] h-[18px] text-neutral-500" /> Home</div>
           </button>
           <button onClick={startNewChat} className="w-full flex items-center justify-between px-3 py-2.5 text-neutral-600 hover:bg-black/5 rounded-xl font-medium text-sm transition-all group">
             <div className="flex items-center gap-3"><MessageSquare className="w-[18px] h-[18px] text-neutral-400" /> New Chat</div>
             <Plus className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
           </button>
        </div>

        {/* History Nav */}
        <div className="flex-1 overflow-y-auto px-3 mt-4 custom-scrollbar">
           {topics.length > 0 && (
             <div className="mb-4">
                 <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">Today</div>
                 {topics.slice(0, 5).map(topic => (
                    <button key={topic._id} onClick={() => loadHistory(topic.topic_id)} className="w-full text-left px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 truncate transition-colors font-medium">
                      {topic.title}
                    </button>
                 ))}
             </div>
           )}
        </div>

        {/* Settings */}
        <div className="p-4 mt-auto">
           <button onClick={handleLogout} className="flex items-center justify-between w-full px-3 py-2.5 text-neutral-500 hover:text-neutral-800 hover:bg-black/5 rounded-xl transition-colors font-medium text-sm">
              <div className="flex items-center gap-3"><Settings className="w-[18px] h-[18px]" /> Settings</div>
           </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full h-[100dvh] bg-white rounded-l-[1.5rem] md:rounded-l-[2rem] shadow-[-10px_0_30px_rgba(0,0,0,0.02)] border-l border-neutral-200/50 overflow-hidden">
        
        {/* Mobile Header (Shows when sidebar is closed on mobile) */}
        <header className="h-14 flex items-center justify-between px-4 shrink-0 md:hidden border-b border-neutral-100 bg-white z-20">
           <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
           </div>
           <HuggingFaceLogo className="w-6 h-6" />
           <div className="w-8"></div> {/* Spacer for center alignment */}
        </header>

        {/* Chat / Empty State Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 xl:px-24 pb-48 custom-scrollbar scroll-smooth relative z-10 w-full h-full">
           
          {messages.length === 0 ? (
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="w-full max-w-[800px] mx-auto pt-10 md:pt-20 pb-10 flex flex-col items-center justify-center text-center h-full">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                <HuggingFaceLogo className="w-10 h-10 drop-shadow-sm" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-neutral-800 mb-4 leading-tight">
                Welcome to your AI Agent
              </h1>
              <p className="text-lg text-neutral-500 font-medium max-w-lg mb-8">
                I can process documents, images, and text. Upload any file or ask a question to get started.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                <button onClick={() => setInput("What can you do?")} className="p-4 bg-white border border-neutral-200 rounded-2xl text-left hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><Sparkles className="w-4 h-4" /></div>
                    <h3 className="font-semibold text-neutral-800">Capabilities</h3>
                  </div>
                  <p className="text-sm text-neutral-500 font-medium">Ask about what this agent can help you with.</p>
                </button>
                <button onClick={() => setInput("Summarize my recent conversations.")} className="p-4 bg-white border border-neutral-200 rounded-2xl text-left hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform"><History className="w-4 h-4" /></div>
                    <h3 className="font-semibold text-neutral-800">Memory</h3>
                  </div>
                  <p className="text-sm text-neutral-500 font-medium">Access your personal conversation history and summaries.</p>
                </button>
              </div>
            </motion.div>
          ) : (
            // Active Chat State
            <div className="w-full max-w-4xl mx-auto space-y-8 pt-6 pb-20">
               {messages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={cn(
                      "flex gap-4 w-full",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white border border-neutral-200 shadow-sm flex items-center justify-center z-10 mt-1">
                      {msg.role === 'user' ? (
                        user?.photoUrl ? <img src={user.photoUrl} alt="User" /> : <User className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <HuggingFaceLogo className="w-5 h-5 drop-shadow-sm" />
                      )}
                    </div>
                
                    <div className={cn(
                      "flex flex-col max-w-[85%] md:max-w-[75%]",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-5 py-4 text-[15px] leading-relaxed shadow-[0_2px_10px_rgba(0,0,0,0.03)]",
                        msg.role === 'user' 
                          ? "bg-[#1A1A1D] text-white rounded-[1.5rem] rounded-tr-[4px]" 
                          : "bg-white text-neutral-800 rounded-[1.5rem] rounded-tl-[4px] border border-neutral-200/80"
                      )}>
                        
                         {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                          <div className="mb-4 space-y-2">
                             {msg.actions.map((action, i) => (
                               <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-600 shadow-sm mr-2">
                                 {action.type === 'message' && !action.url && (
                                   <span className="flex items-center gap-2">
                                     {action.text?.includes('Generating') ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
                                     {action.text}
                                   </span>
                                 )}
                                 {action.type === 'message' && action.url && (
                                   <a href={action.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                                     <Globe className="w-3.5 h-3.5" />
                                     {action.text}
                                   </a>
                                 )}
                               </div>
                             ))}
                          </div>
                        )}

                        <div className={cn(
                          "prose max-w-none font-medium text-[15px]",
                          msg.role === 'user' 
                            ? "prose-invert prose-p:leading-relaxed" 
                            : "prose-neutral prose-p:leading-relaxed prose-pre:bg-neutral-900 prose-pre:text-white prose-pre:rounded-2xl prose-a:text-blue-600"
                        )}>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-xl my-4 text-sm !bg-[#1E1E1E]"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.content || ''}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </motion.div>
               ))}
               
               {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center mt-1 z-10">
                      <HuggingFaceLogo className="w-5 h-5 opacity-80" />
                    </div>
                    <div className="bg-white border border-neutral-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-5 py-4 rounded-[1.5rem] rounded-tl-[4px] flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm font-medium text-neutral-600 animate-pulse">{statusMessage}</span>
                    </div>
                  </motion.div>
               )}
               <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Floating Input Area - Exactly matching the video */}
        <div className="absolute bottom-0 inset-x-0 pb-6 pt-12 px-4 w-full z-30 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none flex flex-col items-center justify-end">
          
          <div className="w-full max-w-[850px] pointer-events-auto bg-white rounded-full border border-neutral-200 shadow-[0_8px_30px_-5px_rgba(0,0,0,0.1)] p-2 flex items-center gap-3 transition-all focus-within:shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] focus-within:border-neutral-300">
            <InputAccessory onUpload={handleFileUpload} />
            {attachment && (
              <div className="absolute bottom-[110%] left-6 bg-white border border-neutral-200 shadow-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="max-w-[150px] truncate font-medium">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="ml-1 text-neutral-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask or search for anything. Use @ to tag a file or collection."
              className="flex-1 bg-transparent text-neutral-800 placeholder:text-neutral-400 focus:outline-none resize-none min-h-[26px] max-h-[150px] py-3 text-[15px] font-medium leading-relaxed"
              rows={1}
            />
            {input.trim() ? (
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 hover:bg-black transition-all shadow-[0_2px_8px_rgba(0,0,0,0.2)] active:scale-95 disabled:opacity-50"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center shrink-0">
                {/* Spacer when no input to keep layout stable */}
              </div>
            )}
          </div>

          <div className="mt-3 text-center text-[11px] font-bold text-neutral-400 tracking-widest pointer-events-auto uppercase mb-1 drop-shadow-sm">
            Made With Love By Aaditya Labs AI
          </div>
        </div>

      </div>
    </div>
  );
}
