import React, { useState, useEffect, useRef } from 'react';
import { Settings, Send, Bot, User, Image as ImageIcon, Search, Key, Plus, Menu, X, Sparkles, Loader2, MessageSquare, ChevronRight, LogOut, History, Mic, MicOff, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

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
  hfApiKey?: string;
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authApiKey, setAuthApiKey] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string>('');
  
  // Voice feature states
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const doAutoLogin = async (identifier: string) => {
    try {
      setAuthLoading(true);
      const res = await fetch('/api/web/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('hfapi_user', JSON.stringify(data.user));
        loadTopics(data.user.id);
        startNewChat();
      } else if (res.status === 404) {
        setNeedsApiKey(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Telegram Web App if available
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser && !user && !localStorage.getItem('hfapi_user')) {
        const id = tgUser.username || tgUser.id.toString();
        setAuthIdentifier(id);
        doAutoLogin(id);
      }
    }

    // Setup Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev ? prev + ' ' + transcript : transcript);
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  const toggleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    // Clean text to avoid reading markdown symbols out loud
    const cleanText = text.replace(/[*_#`[\]()]/g, '').replace(/<[^>]+>/g, '');
    const promptMatch = text.match(/\[(.*?)\]/g);
    // don't read system tags
    const finalUtterance = cleanText.replace(/SYSTEM_ERROR[^]*:?/g, 'System Error');
    
    const utterance = new SpeechSynthesisUtterance(finalUtterance);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    // Attempt to pick a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural')) || voices[0];
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };


  useEffect(() => {
    const savedUser = localStorage.getItem('hfapi_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadTopics(parsedUser.id);
      startNewChat();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadTopics = async (userId: string) => {
    try {
      const res = await fetch(`/api/web/topics/${userId}`);
      const data = await res.json();
      if (data.success) {
        setTopics(data.topics);
      }
    } catch (e) {
      console.error("Failed to load topics", e);
    }
  };

  const loadHistory = async (topicId: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/web/history/${user.id}/${topicId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.history.map((m: any, i: number) => ({
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (!needsApiKey) {
        // Try to login first
        const res = await fetch('/api/web/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: authIdentifier })
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
          localStorage.setItem('hfapi_user', JSON.stringify(data.user));
          loadTopics(data.user.id);
          startNewChat();
        } else if (res.status === 404) {
          // User not found, prompt for API key to register seamlessly
          setNeedsApiKey(true);
        } else {
          setAuthError(data.error || 'Authentication failed');
        }
      } else {
        // We need API key, so sign up / update
        const res = await fetch('/api/web/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: authIdentifier, apiKey: authApiKey })
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
          localStorage.setItem('hfapi_user', JSON.stringify(data.user));
          loadTopics(data.user.id);
          startNewChat();
        } else {
          setAuthError(data.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setTopics([]);
    setAuthIdentifier('');
    setAuthApiKey('');
    setNeedsApiKey(false);
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
          message: userMsg.content, 
          history, 
          hfApiKey: user.hfApiKey, 
          userName: user.name,
          userId: user.id,
          topicId: currentTopicId
        })
      });

      const data = await res.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `❌ Error: ${data.error}` }]);
      } else {
        const images = data.actions?.filter((a: any) => a.type === 'image').map((a: any) => a.url) || [];
        const otherActions = data.actions?.filter((a: any) => a.type !== 'image') || [];
        
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: data.response,
          images: images.length > 0 ? images : undefined,
          actions: otherActions.length > 0 ? otherActions : undefined
        }]);
        
        // Refresh topics if this was the first message
        if (messages.length === 0) {
          loadTopics(user.id);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col items-center justify-center p-4 font-sans selection:bg-purple-200">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden"
        >
          <div className="p-8 text-center bg-gradient-to-br from-purple-50 to-white border-b border-neutral-100">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative w-full h-full bg-white rounded-3xl shadow-xl border border-neutral-100 flex items-center justify-center overflow-hidden">
                <img src="https://storage.googleapis.com/aistudio-user-uploads-us-central1/2026/04/07/2k1245h21644.jpg" alt="HFAPI Logo" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mb-2">HFAPI</h1>
            <p className="text-neutral-500 text-sm font-medium tracking-wide uppercase">Advanced Intelligence</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Telegram Username or ID</label>
                <input 
                  type="text" 
                  value={authIdentifier}
                  onChange={e => {
                    setAuthIdentifier(e.target.value);
                    setNeedsApiKey(false);
                    setAuthError('');
                  }}
                  disabled={needsApiKey}
                  placeholder="@username or 123456789"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none disabled:opacity-60"
                  required
                />
              </div>

              <AnimatePresence>
                {needsApiKey && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div className="p-3 mb-4 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-100 flex items-start gap-2">
                      <span className="text-lg leading-none">ℹ️</span>
                      <p>Account not found. Please provide your API Key to register securely.</p>
                    </div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">API Key</label>
                    <input 
                      type="password" 
                      value={authApiKey}
                      onChange={e => setAuthApiKey(e.target.value)}
                      placeholder="hf_..."
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                      required={needsApiKey}
                    />
                    <p className="text-xs text-neutral-500 mt-2">Get your free key from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">Settings</a>.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {authError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                  {authError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (needsApiKey ? 'Register & Continue' : 'Continue to HFAPI')}
              </button>
              
              {needsApiKey && (
                <button 
                  type="button"
                  onClick={() => { setNeedsApiKey(false); setAuthApiKey(''); }}
                  className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  Try a different Username/ID
                </button>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-neutral-900 font-sans overflow-hidden selection:bg-purple-200">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-72 bg-neutral-50 border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg shadow-sm border border-neutral-200 flex items-center justify-center overflow-hidden">
              <img src="https://storage.googleapis.com/aistudio-user-uploads-us-central1/2026/04/07/2k1245h21644.jpg" alt="HFAPI" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold tracking-tight">HFAPI</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-neutral-500 hover:bg-neutral-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 pb-3">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-4 py-3 bg-white border border-neutral-200 hover:border-purple-300 hover:shadow-sm text-neutral-900 rounded-xl transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2 mt-4">History</div>
          {topics.length === 0 ? (
            <div className="px-3 text-sm text-neutral-400">No history yet.</div>
          ) : (
            topics.map(topic => (
              <button
                key={topic._id}
                onClick={() => loadHistory(topic.topic_id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                  currentTopicId === topic.topic_id ? "bg-purple-50 text-purple-700 font-medium" : "text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                <span className="truncate">{topic.title}</span>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-neutral-900 truncate">{user.name || 'User'}</div>
              <div className="text-xs text-neutral-500 truncate">@{user.username || user.telegram_id || user.id}</div>
            </div>
            <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative bg-white">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-neutral-800 md:hidden">HFAPI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-neutral-200">
              <Sparkles className="w-3 h-3" />
              Advanced Model
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center mt-20 md:mt-32">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-neutral-100 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10"></div>
                   <img src="https://storage.googleapis.com/aistudio-user-uploads-us-central1/2026/04/07/2k1245h21644.jpg" alt="HFAPI" className="w-full h-full object-cover relative z-10" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">How can I help you today?</h2>
                <p className="text-neutral-500 max-w-md text-lg">I am HFAPI, a highly capable AI assistant. I can help you write code, analyze data, and solve complex problems.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={cn(
                    "flex gap-4 md:gap-6",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm border overflow-hidden",
                    msg.role === 'user' 
                      ? "bg-neutral-900 border-neutral-800 text-white" 
                      : "bg-white border-neutral-200"
                  )}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <img src="https://storage.googleapis.com/aistudio-user-uploads-us-central1/2026/04/07/2k1245h21644.jpg" alt="HFAPI" className="w-full h-full object-cover" />}
                  </div>
                  
                  <div className={cn(
                    "flex flex-col max-w-[85%] md:max-w-[75%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-5 py-3.5 rounded-2xl",
                      msg.role === 'user' 
                        ? "bg-neutral-100 text-neutral-900 rounded-tr-sm" 
                        : "bg-white text-neutral-900 rounded-tl-sm border border-neutral-100 shadow-sm"
                    )}>
                      {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {msg.actions.map((action, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={i} 
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-600"
                            >
                              {action.type === 'reaction' && <span className="text-base">{action.emoji}</span>}
                              {action.type === 'message' && (
                                <span className="flex items-center gap-1.5">
                                  {action.text?.includes('Generating') || action.text?.includes('Searching') ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-neutral-400" />
                                  )}
                                  {action.text}
                                </span>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                      
                      <div className="prose prose-neutral prose-p:leading-relaxed prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-pre:border prose-pre:border-neutral-800 prose-pre:rounded-xl max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.content}</ReactMarkdown>
                      </div>
                      
                      {msg.role === 'assistant' && !msg.content.includes('[SYSTEM_ERROR') && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => toggleSpeak(msg.content, msg.id)}
                            className={cn(
                              "p-1.5 rounded-md flex items-center gap-1.5 text-xs transition-colors shadow-sm border",
                              speakingId === msg.id 
                                ? "bg-purple-100 text-purple-700 border-purple-200" 
                                : "bg-white text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 border-neutral-200"
                            )}
                            title={speakingId === msg.id ? "Stop reading" : "Read aloud"}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            {speakingId === msg.id ? 'Stop' : 'Listen'}
                          </button>
                        </div>
                      )}

                      {msg.images && msg.images.length > 0 && (
                        <div className="mt-4 grid gap-3">
                          {msg.images.map((img, i) => (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 }}
                              key={i} 
                              className="relative group rounded-xl overflow-hidden border border-neutral-200 shadow-sm"
                            >
                              <img src={img} alt="Generated AI" className="w-full h-auto object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <span className="text-xs font-medium text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">AI Generated</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 md:gap-6">
                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm overflow-hidden">
                  <img src="https://storage.googleapis.com/aistudio-user-uploads-us-central1/2026/04/07/2k1245h21644.jpg" alt="HFAPI" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white border border-neutral-100 shadow-sm px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-neutral-100">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-neutral-400">
              <button 
                onClick={toggleListen}
                className={cn(
                  "p-1.5 rounded-lg transition-colors border",
                  isListening 
                    ? "bg-red-50 text-red-500 border-red-200 animate-pulse" 
                    : "hover:bg-neutral-100 hover:text-neutral-600 border-transparent"
                )}
                title={isListening ? "Stop listening" : "Start speaking"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button className="p-1.5 hover:bg-neutral-100 hover:text-neutral-600 rounded-lg transition-colors border border-transparent" title="Search Web">
                <Search className="w-5 h-5" />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Message HFAPI..."}
              className="w-full bg-neutral-100 text-neutral-900 rounded-2xl pl-24 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white border border-transparent focus:border-purple-200 transition-all resize-none overflow-hidden min-h-[56px] max-h-[200px] shadow-sm"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-neutral-900 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-3 text-[11px] text-neutral-400 font-medium">
            HFAPI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
