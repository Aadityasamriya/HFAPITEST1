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

// Subcomponents for Empty State Bento Box
const FileItem = ({ icon, title, bg, color, IconComponent }: any) => (
  <div className="flex items-center gap-3 py-1 group cursor-pointer">
    <div className={cn("w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold shrink-0", bg, color)}>
      {IconComponent ? <IconComponent className="w-3.5 h-3.5" /> : icon}
    </div>
    <span className="text-sm font-medium text-neutral-700 group-hover:text-black transition-colors truncate">{title}</span>
  </div>
);

const TaskItem = ({ title, time, isMeeting, status, badge, badgeColor, dotColor }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 border-b border-neutral-100 last:border-0 group cursor-pointer">
    <div className="flex items-center gap-3 min-w-0">
      <div className={cn("w-2 h-2 rounded-full shrink-0", dotColor || "bg-blue-500")}></div>
      <span className="text-sm font-medium text-neutral-800 truncate">{title}</span>
    </div>
    <div className="flex items-center gap-2 pl-5 sm:pl-0 shrink-0">
      {time && <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5" /> {time}</span>}
      {isMeeting && (
        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors hover:bg-blue-100">
          <Globe className="w-3.5 h-3.5" /> Join now
        </span>
      )}
      {status && (
        <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
          {status === 'In progress' ? <Loader2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 border-2 border-neutral-400 rounded-full" />}
          {status}
        </span>
      )}
      {badge && (
        <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5", badgeColor)}>
          {badge.includes('Urgent') && <FileWarning className="w-3 h-3" />}
          {badge.includes('tomorrow') && <ArrowRight className="w-3 h-3" />}
          {badge}
        </span>
      )}
    </div>
  </div>
);

const InputAccessory = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
           <motion.div 
             initial={{opacity: 0, scale: 0.9, y: 10}} 
             animate={{opacity: 1, scale: 1, y: 0}} 
             exit={{opacity: 0, scale: 0.9, y: 10}} 
             transition={{ duration: 0.15 }}
             className="absolute bottom-full left-0 mb-3 bg-white border border-neutral-200 shadow-xl rounded-2xl flex items-center gap-1 p-1.5 z-50 overflow-hidden"
           >
             <button onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 active:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 whitespace-nowrap transition-colors">
               <Sparkles className="w-4 h-4 text-purple-500" /> Select sources
             </button>
             <div className="w-px h-4 bg-neutral-200 mx-1"></div>
             <button onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 active:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 whitespace-nowrap transition-colors">
               <Folder className="w-4 h-4 text-amber-500" /> Upload Files
             </button>
             <div className="w-px h-4 bg-neutral-200 mx-1"></div>
             <button onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 active:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 whitespace-nowrap transition-colors">
               <Globe className="w-4 h-4 text-emerald-500" /> Search Web
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
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string>('');
  
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
      } catch (e) {
        localStorage.removeItem('hfapi_user');
      }
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
    if (!input.trim() || !user || !user.hfApiKey) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg.content,  history,  hfApiKey: user.hfApiKey, 
          userName: user.name, userId: user.telegram_id, topicId: currentTopicId || `topic_${Date.now()}`
        })
      });

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
      <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-neutral-100 overflow-hidden relative"
        >
          <div className="p-10 text-center w-full relative">
            <div className="mx-auto mb-8 relative flex justify-center items-center">
              <div className="relative w-24 h-24 bg-white rounded-full shadow-lg border border-neutral-100 p-2 flex items-center justify-center overflow-hidden">
                <HuggingFaceLogo className="w-16 h-16 drop-shadow-sm" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-neutral-800 mb-2">Hugging Face</h1>
            <p className="text-neutral-500 text-sm font-medium tracking-wide">Secure Login via Telegram OAuth2</p>
          </div>

          <div className="px-8 pb-10 flex flex-col items-center">
            <a 
              href="/api/web/telegram-oauth/login"
              className="w-full py-4 bg-[#2481cc] hover:bg-[#1d6ba8] text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.372 0 0 5.372 0 12C0 18.628 5.372 24 12 24C18.628 24 24 18.628 24 12C24 5.372 18.628 0 12 0ZM17.472 8.35L15.42 17.986C15.266 18.656 14.869 18.825 14.301 18.508L11.206 16.223L9.712 17.658C9.547 17.824 9.412 17.958 9.091 17.958L9.314 14.793L15.067 9.601C15.317 9.378 15.013 9.255 14.678 9.479L7.568 13.957L4.502 12.996C3.834 12.787 3.82 12.33 4.641 12.008L16.637 7.382C17.189 7.172 17.669 7.502 17.472 8.35Z" fill="currentColor"/>
              </svg>
              Login with Telegram
            </a>
            
            {authError && (
              <div className="p-4 mt-6 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 font-medium text-center w-full">
                {authError}
              </div>
            )}
            {authLoading && (
              <div className="mt-6 flex justify-center text-blue-500 w-full">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            <p className="mt-6 text-xs text-neutral-400 text-center px-4 leading-relaxed">
              Using the new official Telegram OpenID Connect (OIDC) authorization protocol.
            </p>
          </div>
        </motion.div>
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
           <button className="w-full flex items-center justify-between px-3 py-2.5 text-neutral-600 hover:bg-black/5 rounded-xl font-medium text-sm transition-all">
             <div className="flex items-center gap-3"><CheckSquare className="w-[18px] h-[18px] text-neutral-400" /> My Tasks</div>
           </button>
           <button className="w-full flex items-center justify-between px-3 py-2.5 text-neutral-600 hover:bg-black/5 rounded-xl font-medium text-sm transition-all">
             <div className="flex items-center gap-3"><Calendar className="w-[18px] h-[18px] text-neutral-400" /> My Meetings</div>
           </button>
           <button className="w-full flex items-center justify-between px-3 py-2.5 text-neutral-600 hover:bg-black/5 rounded-xl font-medium text-sm transition-all">
             <div className="flex items-center gap-3"><Folder className="w-[18px] h-[18px] text-neutral-400" /> Saved Files</div>
           </button>
           <button className="w-full flex items-center justify-between px-3 py-2.5 text-neutral-600 hover:bg-black/5 rounded-xl font-medium text-sm transition-all">
             <div className="flex items-center gap-3"><Users className="w-[18px] h-[18px] text-neutral-400" /> Shared with me</div>
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

        {/* Upgrade Card & Settings */}
        <div className="p-4 mt-auto">
           <div className="bg-white rounded-2xl p-4 border border-blue-100/50 shadow-sm text-center mb-4 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50 opacity-50"></div>
              <div className="relative z-10 font-sans">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-2 text-blue-600 border border-blue-100">
                   <HuggingFaceLogo className="w-5 h-5 drop-shadow-sm" />
                </div>
                <h4 className="font-bold text-neutral-800 text-[13px] mb-0.5">Only 5 AI reports left</h4>
                <p className="text-[11px] font-medium text-neutral-500 mb-3">Get deeper insights with Pro</p>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm active:scale-95">
                  Upgrade Now
                </button>
              </div>
           </div>
           
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
            // Bento Box Empty State -> EXACT Layout from Video
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="w-full max-w-[900px] mx-auto pt-10 md:pt-20 pb-10">
              <div className="mb-12 pl-2 text-center md:text-left">
                <h1 className="text-4xl md:text-[3.25rem] font-display font-medium tracking-tight text-neutral-800 mb-2 leading-tight">
                  Welcome, {user?.name ? user.name.split(' ')[0] : 'Sam'}! <span className="inline-block animate-wave text-[0.8em]">👋</span>
                </h1>
                <h2 className="text-2xl md:text-[2rem] font-display text-neutral-400 tracking-tight font-normal">
                  How can I help you today?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full">
                
                {/* Previously viewed files */}
                <div onClick={() => setInput("Summarize my recently viewed files.")} className="md:col-span-7 bg-[#F9FAFB] rounded-[2rem] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-neutral-200/50 hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 text-neutral-500 mb-6 font-semibold text-sm tracking-wide">
                    <History className="w-4 h-4" />
                    Previously viewed files
                  </div>
                  <div className="space-y-4">
                     <FileItem color="text-yellow-700" bg="bg-yellow-100" icon="M" title="Miro - Product Analytics and Statistics" />
                     <FileItem color="text-rose-700" bg="bg-rose-100" icon="F" title="Figma - UX Research" />
                     <FileItem color="text-red-700" bg="bg-red-100" icon="PDF" title="R2 Strategic Goals & Objectives.pdf" />
                  </div>
                </div>

                {/* Summarize your last meeting */}
                <div onClick={() => setInput("Summarize the UX Strategy Meet up from April 1st.")} className="md:col-span-5 bg-[#F9FAFB] rounded-[2rem] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-neutral-200/50 hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer flex flex-col group">
                  <div className="flex items-center gap-2 text-neutral-500 mb-6 font-semibold text-sm tracking-wide">
                    <Sparkles className="w-4 h-4" />
                    Summarize your last meeting
                  </div>
                  <div className="flex items-center gap-4 mt-auto shadow-sm bg-white p-3 rounded-2xl border border-neutral-100 group-hover:scale-[1.02] transition-transform">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                       <img src="https://images.unsplash.com/photo-1543269664-56d74c65a35?q=80&w=256&auto=format&fit=crop" alt="Meeting" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 text-[15px] mb-0.5">UX Strategy Meet up</h3>
                      <p className="text-xs font-medium text-neutral-500">1 Apr 2025, 14:00 pm</p>
                    </div>
                  </div>
                </div>

                {/* Suggested Task 1 & 2 */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div onClick={() => setInput("Conduct UX Research")} className="flex-1 bg-[#F9FAFB] rounded-[2rem] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-neutral-200/50 flex flex-col justify-center cursor-pointer hover:shadow-md hover:border-neutral-200 transition-all group min-h-[140px]">
                      <div className="text-[13px] font-semibold text-neutral-500 mb-3 flex items-center gap-2">
                         <div className="bg-white p-1 rounded-md shadow-sm border border-neutral-100"><FileText className="w-3.5 h-3.5" /></div> Suggested Task
                      </div>
                      <div className="text-[22px] font-display font-semibold text-neutral-800 tracking-tight group-hover:text-blue-600 transition-colors">Conduct UX Research</div>
                   </div>
                   
                   <div onClick={() => setInput("Write a prospect email")} className="flex-1 bg-[#F9FAFB] rounded-[2rem] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-neutral-200/50 flex flex-col justify-center cursor-pointer hover:shadow-md hover:border-neutral-200 transition-all group min-h-[140px]">
                      <div className="text-[13px] font-semibold text-neutral-500 mb-3 flex items-center gap-2">
                         <div className="bg-white p-1 rounded-md shadow-sm border border-neutral-100"><FileText className="w-3.5 h-3.5" /></div> Suggested Task
                      </div>
                      <div className="text-[22px] font-display font-semibold text-neutral-800 tracking-tight group-hover:text-blue-600 transition-colors">Write a prospect email</div>
                   </div>
                </div>

                {/* My Tasks */}
                <div className="md:col-span-12 bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-neutral-200/80">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 font-display font-semibold text-[17px] text-neutral-800">
                          <CheckSquare className="w-[18px] h-[18px] text-neutral-400" />
                          My Tasks <span className="bg-neutral-100 text-neutral-600 text-[11px] px-2 py-0.5 rounded-full font-bold ml-0.5">13</span>
                        </div>
                        <div className="hidden md:block h-5 w-px bg-neutral-200 mx-1"></div>
                        <div className="flex items-center gap-2 bg-[#F9FAFB] px-3 py-1.5 rounded-full text-sm text-neutral-500 border border-neutral-200 w-full md:w-auto focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                           <Search className="w-4 h-4 text-neutral-400" />
                           <input type="text" placeholder="Search for name..." className="bg-transparent outline-none w-full md:w-40 placeholder:text-neutral-400 font-medium" />
                        </div>
                        <button className="hidden md:flex w-8 h-8 rounded-full bg-[#F9FAFB] border border-neutral-200 items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)]"><Plus className="w-4 h-4" /></button>
                      </div>
                      <button className="flex items-center justify-center gap-2 bg-gradient-to-tr from-pink-50 to-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold hover:shadow-sm border border-purple-100 transition-all active:scale-95">
                        <Sparkles className="w-4 h-4" /> Prioritize Tasks
                      </button>
                   </div>
                   
                   <div className="space-y-1">
                      <TaskItem title="Design Meeting" time="2 pm" isMeeting badgeColor="text-rose-600 bg-rose-50 border-rose-100" dotColor="bg-rose-500" />
                      <TaskItem title="Refine UI components based on user feedback" status="In progress" badge="Urgent" badgeColor="text-rose-600 bg-rose-50 border border-rose-100" dotColor="bg-blue-500" />
                      <TaskItem title="Prepare a prototype for usability testing" badge="By today" badgeColor="text-rose-600 bg-rose-50 border border-rose-100" dotColor="bg-blue-500" />
                      <TaskItem title="Collaborate with developers on implementation detail" status="To do" badge="By tomorrow" badgeColor="text-emerald-700 bg-emerald-50 border border-emerald-100" dotColor="bg-neutral-300" />
                   </div>
                </div>

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
                               <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-600 shadow-sm">
                                 {action.type === 'message' && (
                                   <span className="flex items-center gap-2">
                                     {action.text?.includes('Generating') ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
                                     {action.text}
                                   </span>
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
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.content || ''}</ReactMarkdown>
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
                    <div className="bg-white border border-neutral-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-5 py-4 rounded-[1.5rem] rounded-tl-[4px] flex items-center gap-2">
                      <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
            <InputAccessory />
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
