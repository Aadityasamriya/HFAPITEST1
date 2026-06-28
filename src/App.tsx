import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Plus, CheckSquare, Calendar, Folder, Users, 
  Settings, Bell, Search, Sparkles, X, 
  Mic, MicOff, Volume2, ArrowUp, Loader2, 
  MessageSquare, FileText, Lock, Globe, Image as ImageIcon,
  MoreHorizontal, ChevronDown, ListTodo, Presentation, PlayCircle,
  Video, Clock, FileWarning, ArrowRight, History, User,
  CheckCircle2, Circle, UploadCloud
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
  actions?: { type: string; text?: string; emoji?: string; url?: string }[];
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
    <>
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      
      <AnimatePresence>
        {open && (
           <motion.div 
             initial={{opacity: 0}} 
             animate={{opacity: 1}} 
             exit={{opacity: 0}} 
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
             onClick={() => setOpen(false)}
           >
             <motion.div 
               initial={{scale: 0.95, opacity: 0}}
               animate={{scale: 1, opacity: 1}}
               exit={{scale: 0.95, opacity: 0}}
               onClick={(e) => e.stopPropagation()}
               className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]"
             >
               <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
                 <Search className="w-5 h-5 text-neutral-400" />
                 <input type="text" placeholder="Search for sources to chat with..." className="flex-1 bg-transparent border-none outline-none text-neutral-800 placeholder:text-neutral-400 text-lg" />
                 <button onClick={() => setOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 overflow-x-auto custom-scrollbar shrink-0">
                 <button className="px-4 py-1.5 bg-neutral-900 text-white rounded-full text-sm font-medium shrink-0 flex items-center gap-2">
                   <CheckSquare className="w-4 h-4" /> All
                 </button>
                 <button className="px-4 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-full text-sm font-medium shrink-0 flex items-center gap-2">
                   <FileText className="w-4 h-4" /> Documents
                 </button>
                 <button className="px-4 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-full text-sm font-medium shrink-0 flex items-center gap-2">
                   <Folder className="w-4 h-4" /> Reports
                 </button>
                 <button className="px-4 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-full text-sm font-medium shrink-0 flex items-center gap-2">
                   <ImageIcon className="w-4 h-4" /> Images
                 </button>
                 <button className="px-4 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-full text-sm font-medium shrink-0 flex items-center gap-2">
                   <Video className="w-4 h-4" /> Video
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfd]">
                 <div className="mb-6">
                   <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Documents (15)</div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <div onClick={() => fileInputRef.current?.click()} className="flex items-start gap-3 p-3 bg-white border border-neutral-200 rounded-2xl hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                       <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                         <span className="text-red-600 font-bold text-xs">PDF</span>
                       </div>
                       <div>
                         <h4 className="font-semibold text-neutral-800 text-sm">Upload new file...</h4>
                         <p className="text-xs text-neutral-500 mt-0.5">Click to browse local files</p>
                       </div>
                     </div>
                     <div className="flex items-start gap-3 p-3 bg-white border border-neutral-200 rounded-2xl cursor-pointer hover:border-blue-300 transition-all">
                       <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                         <span className="text-blue-600 font-bold text-xs">PDF</span>
                       </div>
                       <div>
                         <h4 className="font-semibold text-neutral-800 text-sm">google-certificate.pdf</h4>
                         <p className="text-xs text-neutral-500 mt-0.5">3.4 MB • 1d ago</p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setOpen(true)} 
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
      >
        <Plus className="w-5 h-5" />
      </button>
    </>
  )
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [needsWebLogin, setNeedsWebLogin] = useState(false);
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
  const [playingAudioMsgId, setPlayingAudioMsgId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const playTTS = async (messageId: string, text: string) => {
    if (playingAudioMsgId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudioMsgId(null);
      return;
    }

    try {
      setPlayingAudioMsgId(messageId);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, hfApiKey: user?.hfApiKey })
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.onended = () => {
        setPlayingAudioMsgId(null);
        URL.revokeObjectURL(url);
      };
      audioRef.current = audio;
      audio.play();
    } catch (e) {
      console.error(e);
      setPlayingAudioMsgId(null);
    }
  };

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
      // Do not auto-login on web. We will show a custom web login screen if user is null.
      // We set a flag to avoid showing the loading spinner infinitely.
      setNeedsWebLogin(true);
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

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && !attachment) || !user || !user.hfApiKey) return;

    let displayContent = textToSend.trim();
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
          message: textToSend.trim() || "What is in this file?",  
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
    if (needsWebLogin) {
      return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col md:flex-row font-sans">
          <div className="hidden md:flex flex-1 bg-[#1A1A1D] flex-col justify-between p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative z-10 flex items-center gap-3 text-white">
                <HuggingFaceLogo className="w-8 h-8" />
                <span className="text-2xl font-bold font-display">AadityaLabs</span>
             </div>
             <div className="relative z-10">
                <h1 className="text-5xl font-display font-bold text-white leading-tight mb-4">
                  The Ultimate<br />AI Manager
                </h1>
                <p className="text-xl text-neutral-400 max-w-md">Experience the most powerful frontier models integrated perfectly into one seamless workspace.</p>
             </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm"
            >
              <div className="flex items-center justify-center gap-3 text-[#1A1A1D] md:hidden mb-12">
                <HuggingFaceLogo className="w-8 h-8" />
                <span className="text-2xl font-bold font-display">AadityaLabs</span>
              </div>
              
              <div className="text-center mb-10">
                 <h2 className="text-3xl font-bold font-display text-neutral-900 mb-2">Welcome Back</h2>
                 <p className="text-neutral-500 font-medium">Continue to your personal workspace.</p>
              </div>
              
              <form className="space-y-5" onSubmit={async (e) => {
                e.preventDefault();
                const name = (e.target as any).name.value;
                const apiKey = (e.target as any).apiKey.value;
                if (!name || !apiKey) return;
                
                setAuthLoading(true);
                setAuthError('');
                const randomId = `web_${Math.random().toString(36).substring(2, 9)}`;
                
                try {
                  const res = await fetch('/api/web/update-api-key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegramId: randomId, apiKey, name })
                  });
                  const data = await res.json();
                  if (data.success) {
                    const newUser = { ...data.user, name, id: randomId, telegram_id: randomId };
                    setUser(newUser);
                    localStorage.setItem('hfapi_user', JSON.stringify(newUser));
                    loadTopics(randomId);
                  } else {
                    setAuthError(data.error || 'Failed to update API key');
                  }
                } catch(err: any) {
                  setAuthError(err.message || 'Network error');
                } finally {
                  setAuthLoading(false);
                }
              }}>
                 <div>
                   <label className="block text-sm font-semibold text-neutral-700 mb-2">Your Name</label>
                   <input 
                     name="name" type="text" placeholder="John Doe" required
                     className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium placeholder:font-normal"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-neutral-700 mb-2">Hugging Face API Key</label>
                   <input 
                     name="apiKey" type="password" placeholder="hf_..." required
                     className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium placeholder:font-normal"
                   />
                   <p className="text-xs text-neutral-400 mt-2 font-medium"><a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Get your API key here</a></p>
                 </div>
                 
                 {authError && (
                   <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 font-medium text-center">
                     {authError}
                   </div>
                 )}
                 
                 <button 
                   type="submit"
                   disabled={authLoading}
                   className="w-full py-3.5 bg-[#1A1A1D] hover:bg-black text-white font-semibold rounded-2xl shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
                 >
                   {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Workspace'}
                 </button>
              </form>
            </motion.div>
          </div>
        </div>
      );
    }

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
        <div className="p-5 pb-4">
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
        <div className="px-3 py-2 space-y-1">
           <button onClick={startNewChat} className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm transition-all group">
             <div className="flex items-center gap-3"><Home className="w-[18px] h-[18px] text-blue-600" /> Home</div>
           </button>
           <button onClick={startNewChat} className="w-full flex items-center justify-between px-3 py-2 text-neutral-500 hover:bg-black/5 hover:text-neutral-700 rounded-xl font-medium text-sm transition-all group">
             <div className="flex items-center gap-3"><MessageSquare className="w-[18px] h-[18px]" /> New Chat</div>
             <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
           </button>
           <button className="w-full flex items-center justify-between px-3 py-2 text-neutral-500 hover:bg-black/5 hover:text-neutral-700 rounded-xl font-medium text-sm transition-all group">
             <div className="flex items-center gap-3"><CheckSquare className="w-[18px] h-[18px]" /> My Tasks</div>
           </button>
           <button className="w-full flex items-center justify-between px-3 py-2 text-neutral-500 hover:bg-black/5 hover:text-neutral-700 rounded-xl font-medium text-sm transition-all group">
             <div className="flex items-center gap-3"><Calendar className="w-[18px] h-[18px]" /> My Meetings</div>
           </button>
           <button className="w-full flex items-center justify-between px-3 py-2 text-neutral-500 hover:bg-black/5 hover:text-neutral-700 rounded-xl font-medium text-sm transition-all group">
             <div className="flex items-center gap-3"><Folder className="w-[18px] h-[18px]" /> Saved Files</div>
           </button>
           <button className="w-full flex items-center justify-between px-3 py-2 text-neutral-500 hover:bg-black/5 hover:text-neutral-700 rounded-xl font-medium text-sm transition-all group">
             <div className="flex items-center gap-3"><Users className="w-[18px] h-[18px]" /> Shared with me</div>
           </button>
        </div>

        {/* History Nav */}
        <div className="flex-1 overflow-y-auto px-3 mt-6 custom-scrollbar space-y-6">
           {topics.length > 0 && (
             <div>
                 <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">Today</div>
                 {topics.slice(0, 3).map(topic => (
                    <button key={topic._id} onClick={() => loadHistory(topic.topic_id)} className="w-full text-left px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 truncate transition-colors font-medium">
                      {topic.title}
                    </button>
                 ))}
             </div>
           )}
           {topics.length > 3 && (
             <div>
                 <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">Yesterday</div>
                 {topics.slice(3, 8).map(topic => (
                    <button key={topic._id} onClick={() => loadHistory(topic.topic_id)} className="w-full text-left px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 truncate transition-colors font-medium">
                      {topic.title}
                    </button>
                 ))}
             </div>
           )}
        </div>

        {/* Upgrade Card */}
        <div className="px-4 py-2 mt-auto">
          <div className="bg-white border border-neutral-200/70 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-neutral-800">Only 5 AI reports left</span>
            </div>
            <p className="text-xs text-neutral-500 font-medium mb-3">Get deeper insights with Pro</p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="px-4 py-3 pb-6">
           <button onClick={handleLogout} className="flex items-center justify-between w-full px-2 py-2 text-neutral-500 hover:text-red-600 rounded-xl transition-colors font-medium text-sm">
              <div className="flex items-center gap-3"><Settings className="w-[18px] h-[18px]" /> Settings</div>
           </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full h-[100dvh] bg-white rounded-l-[1.5rem] md:rounded-l-[2rem] shadow-[-5px_0_15px_rgba(0,0,0,0.03)] border-l border-neutral-200/50 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="h-14 flex items-center justify-between px-4 shrink-0 md:hidden border-b border-neutral-100 bg-white z-20">
           <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
           </div>
           <HuggingFaceLogo className="w-6 h-6" />
           <div className="w-8"></div>
        </header>

        {/* Chat / Dashboard Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-24 pb-48 custom-scrollbar scroll-smooth relative z-10 w-full h-full bg-[#fcfcfd]">
           
          {messages.length === 0 ? (
            // Modern Dashboard Layout
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="w-full max-w-[900px] mx-auto pt-12 md:pt-20 pb-10 flex flex-col items-start h-full">
              
              <div className="mb-10 w-full">
                <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-neutral-800 mb-2 flex items-center gap-3">
                  <span className="relative inline-block">
                    <span className="relative z-10">Welcome, {user.name.split(' ')[0]}!</span>
                    <span className="absolute bottom-1 left-0 w-full h-5 bg-blue-100 -z-0 rounded-sm"></span>
                  </span>
                  👋
                </h1>
                <h2 className="text-3xl md:text-4xl text-neutral-400 font-medium font-display mt-2">
                  How can I help you today?
                </h2>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
                
                {/* Previously viewed files */}
                <div className="md:col-span-2 bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-4 text-neutral-500 font-medium text-sm">
                    <FileText className="w-4 h-4" /> Previously viewed files
                  </div>
                  <div className="space-y-3">
                    <button className="flex items-center gap-3 w-full p-2 hover:bg-neutral-50 rounded-xl transition-colors text-left group">
                      <div className="w-8 h-8 rounded bg-yellow-100 flex items-center justify-center shrink-0">
                        <span className="text-yellow-600 font-bold text-xs">M</span>
                      </div>
                      <span className="font-medium text-neutral-700 truncate group-hover:text-blue-600">Miro - Product Analytics and Statistics</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-2 hover:bg-neutral-50 rounded-xl transition-colors text-left group">
                      <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center shrink-0">
                        <span className="text-purple-600 font-bold text-xs">F</span>
                      </div>
                      <span className="font-medium text-neutral-700 truncate group-hover:text-blue-600">Figma - UX Research</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-2 hover:bg-neutral-50 rounded-xl transition-colors text-left group">
                      <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center shrink-0">
                        <span className="text-red-600 font-bold text-xs">P</span>
                      </div>
                      <span className="font-medium text-neutral-700 truncate group-hover:text-blue-600">R2 Strategic Goals & Objectives.pdf</span>
                    </button>
                  </div>
                </div>

                {/* Summarize meeting */}
                <div className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer" onClick={() => handleSend("Summarize my last meeting")}>
                  <div className="flex items-center gap-2 mb-4 text-neutral-500 font-medium text-sm">
                    <Sparkles className="w-4 h-4" /> Summarize your last meeting
                  </div>
                  <div className="flex gap-4 items-center mt-2">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 overflow-hidden shrink-0">
                      <img src="https://ui-avatars.com/api/?name=UX&background=random" alt="Meeting" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800 text-lg">UX Strategy Meet up</h3>
                      <p className="text-sm text-neutral-400 mt-1">1 Apr 2025, 14:00 pm</p>
                    </div>
                  </div>
                </div>

                {/* Suggested Tasks */}
                <button onClick={() => handleSend("Help me conduct UX Research")} className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col text-left hover:border-blue-200">
                  <div className="flex items-center gap-2 mb-2 text-neutral-400 font-medium text-sm">
                    <CheckSquare className="w-4 h-4" /> Suggested Task
                  </div>
                  <h3 className="font-semibold text-neutral-800 text-xl mt-1">Conduct UX Research</h3>
                </button>
                <button onClick={() => handleSend("Write a prospect email")} className="md:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col text-left hover:border-blue-200">
                  <div className="flex items-center gap-2 mb-2 text-neutral-400 font-medium text-sm">
                    <CheckSquare className="w-4 h-4" /> Suggested Task
                  </div>
                  <h3 className="font-semibold text-neutral-800 text-xl mt-1">Write a prospect email</h3>
                </button>

              </div>

              {/* Tasks List Section */}
              <div className="w-full mt-4">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-neutral-700" /> My Tasks
                      <span className="text-sm font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">13</span>
                    </h3>
                    <div className="hidden sm:flex items-center bg-white border border-neutral-200 rounded-full px-3 py-1.5 shadow-sm">
                      <Search className="w-4 h-4 text-neutral-400 mr-2" />
                      <input type="text" placeholder="Search for name..." className="bg-transparent text-sm focus:outline-none w-32 placeholder:text-neutral-400" />
                    </div>
                  </div>
                  <button onClick={() => handleSend("Prioritize my tasks")} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl text-sm font-semibold transition-colors border border-purple-100 shadow-sm">
                    <Sparkles className="w-4 h-4" /> Prioritize Tasks
                  </button>
                </div>

                <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl overflow-hidden p-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-2xl group transition-colors cursor-pointer">
                      <Circle className="w-5 h-5 text-neutral-300 group-hover:text-neutral-400" />
                      <span className="font-medium text-neutral-800 flex-1">Design Meeting</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 2 pm</span>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Join now</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-2xl group transition-colors cursor-pointer">
                      <Circle className="w-5 h-5 text-neutral-300 group-hover:text-neutral-400" />
                      <span className="font-medium text-neutral-800 flex-1">Refine UI components based on user feedback</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg flex items-center gap-1"><FileWarning className="w-3 h-3" /> Urgent</span>
                        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">By today</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-2xl group transition-colors cursor-pointer">
                      <Circle className="w-5 h-5 text-neutral-300 group-hover:text-neutral-400" />
                      <span className="font-medium text-neutral-800 flex-1">Prepare a prototype for usability testing</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1"><Loader2 className="w-3 h-3" /> In progress</span>
                        <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg">By tomorrow</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-2xl group transition-colors cursor-pointer">
                      <Circle className="w-5 h-5 text-neutral-300 group-hover:text-neutral-400" />
                      <span className="font-medium text-neutral-800 flex-1">Collaborate with developers on implementation detail</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">To do</span>
                        <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg">By tomorrow</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          ) : (
            // Active Chat State
            <div className="w-full max-w-4xl mx-auto space-y-8 pt-10 pb-20">
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
                        
                        {msg.role === 'assistant' && (
                          <div className="mt-3 flex items-center justify-end">
                            <button
                              onClick={() => playTTS(msg.id, msg.content)}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors flex items-center justify-center",
                                playingAudioMsgId === msg.id 
                                  ? "bg-blue-100 text-blue-600" 
                                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                              )}
                              title={playingAudioMsgId === msg.id ? "Stop reading" : "Read aloud"}
                            >
                              <Volume2 className={cn("w-4 h-4", playingAudioMsgId === msg.id && "animate-pulse")} />
                            </button>
                          </div>
                        )}
                        
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

        {/* Floating Input Area - Modern Pill Style */}
        <div className="absolute bottom-0 inset-x-0 pb-8 pt-12 px-4 w-full z-30 bg-gradient-to-t from-[#fcfcfd] via-[#fcfcfd]/90 to-transparent pointer-events-none flex flex-col items-center justify-end">
          
          <div className="w-full max-w-[850px] pointer-events-auto bg-white rounded-full border border-neutral-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-2 flex items-center gap-3 transition-all focus-within:shadow-[0_15px_50px_-10px_rgba(0,0,0,0.12)] focus-within:border-neutral-300">
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
            {input.trim() || attachment ? (
              <button
                onClick={() => handleSend()}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={toggleListening}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)] active:scale-95",
                  isListening ? "bg-red-500 text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                )}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
