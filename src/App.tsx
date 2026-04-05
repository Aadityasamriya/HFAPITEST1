import React, { useState, useEffect, useRef } from 'react';
import { Settings, Send, Bot, User, Image as ImageIcon, Search, Key, Plus, Menu, X, Sparkles, Loader2, MessageSquare, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  actions?: { type: string; text?: string; emoji?: string }[];
}

export default function App() {
  const [hfApiKey, setHfApiKey] = useState('');
  const [userName, setUserName] = useState('User');
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('hfApiKey');
    const savedName = localStorage.getItem('userName');
    if (savedKey) setHfApiKey(savedKey);
    if (savedName) setUserName(savedName);
    if (!savedKey) setShowSettings(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('hfApiKey', hfApiKey);
    localStorage.setItem('userName', userName);
    setShowSettings(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !hfApiKey) {
      if (!hfApiKey) setShowSettings(true);
      return;
    }

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
        body: JSON.stringify({ message: userMsg.content, history, hfApiKey, userName })
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

  const clearChat = () => {
    setMessages([]);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-gray-100 font-sans overflow-hidden selection:bg-purple-500/30">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 bg-[#0F0F11]/90 backdrop-blur-xl border-r border-white/5 flex flex-col",
              "md:relative md:translate-x-0"
            )}
          >
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Nexus AI
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-4 py-2">
              <button 
                onClick={clearChat} 
                className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 text-sm font-medium border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-white/5"
              >
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Recent</div>
                {messages.length > 0 ? (
                  <div className="group flex items-center justify-between px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                      <span className="truncate">{messages[0].content}</span>
                    </div>
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-600 italic">No history yet</div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-[#0F0F11]">
              <button 
                onClick={() => setShowSettings(true)} 
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10">
                    <User className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-gray-200">{userName}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Pro Max User</span>
                  </div>
                </div>
                <Settings className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative w-full z-10">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="font-semibold text-gray-200 tracking-tight">Nexus AI <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full ml-2 border border-purple-400/20">v3.1</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <span className="text-xs font-medium text-gray-300">System Online</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 pb-32">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-gray-900 to-black rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                    <Sparkles className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500" style={{ stroke: 'url(#gradient)' }} />
                    <svg width="0" height="0">
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop stopColor="#60A5FA" offset="0%" />
                        <stop stopColor="#A855F7" offset="100%" />
                      </linearGradient>
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                    Welcome back, {userName}
                  </h2>
                  <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                    Experience the next generation of AI. Generate images, search the web, and explore infinite possibilities.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mt-8">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInput("Generate a photorealistic image of a futuristic cyberpunk city at night")} 
                    className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-left transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <ImageIcon className="w-6 h-6 text-blue-400 mb-3" />
                    <div className="font-semibold text-gray-200 mb-1">Generate an image</div>
                    <div className="text-sm text-gray-500">Cyberpunk city at night</div>
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInput("Search the web for the latest breakthroughs in quantum computing")} 
                    className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-left transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Search className="w-6 h-6 text-purple-400 mb-3" />
                    <div className="font-semibold text-gray-200 mb-1">Search the web</div>
                    <div className="text-sm text-gray-500">Quantum computing news</div>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              messages.map((msg, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0.1 : 0 }}
                  key={msg.id} 
                  className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-purple-500/20 border border-white/10">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[85%] md:max-w-[80%] flex flex-col gap-3",
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn(
                      "px-6 py-4 rounded-3xl shadow-sm",
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm' 
                        : 'bg-[#18181B] text-gray-100 rounded-tl-sm border border-white/5 shadow-xl'
                    )}>
                      
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-col gap-2 mb-4">
                          {msg.actions.map((action, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={i} 
                              className="text-xs font-medium text-gray-400 flex items-center gap-2 bg-black/40 border border-white/5 w-fit px-3 py-2 rounded-xl"
                            >
                              {action.type === 'reaction' && <span className="flex items-center gap-2"><span className="text-base">{action.emoji}</span> Reacted</span>}
                              {action.type === 'message' && (
                                <span className="flex items-center gap-2">
                                  {action.text?.includes('Searching') || action.text?.includes('Generating') ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-blue-400" />
                                  )}
                                  {action.text}
                                </span>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                      
                      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>

                      {msg.images && msg.images.length > 0 && (
                        <div className="mt-5 grid gap-3">
                          {msg.images.map((img, i) => (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                              key={i} 
                              className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                            >
                              <img src={img} alt="Generated AI" className="w-full h-auto object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">AI Generated</span>
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
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 md:gap-6 justify-start"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-shrink-0 mt-1 border border-white/5">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
                <div className="bg-[#18181B] rounded-3xl rounded-tl-sm px-6 py-5 border border-white/5 flex items-center gap-3 shadow-xl">
                  <div className="flex gap-1.5">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-purple-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-pink-500 rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">Processing...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/95 to-transparent pt-20">
          <div className="max-w-4xl mx-auto relative">
            <div className="relative bg-[#18181B] border border-white/10 rounded-3xl shadow-2xl focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message Nexus AI..."
                className="w-full bg-transparent text-gray-100 placeholder-gray-500 px-6 py-5 pr-16 rounded-3xl resize-none focus:outline-none min-h-[60px] max-h-[200px] custom-scrollbar"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-2xl bg-white text-black disabled:bg-white/10 disabled:text-gray-500 hover:bg-gray-200 transition-colors shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-[11px] text-gray-500 font-medium">Nexus AI can make mistakes. Consider verifying important information.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="bg-[#18181B] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Settings className="w-6 h-6 text-purple-400" />
                  Configuration
                </h2>
                {localStorage.getItem('hfApiKey') && (
                  <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <form onSubmit={saveSettings} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1 flex items-center justify-between">
                    <span>Hugging Face API Key</span>
                    <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Get Token →</a>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={hfApiKey}
                      onChange={(e) => setHfApiKey(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm"
                      placeholder="hf_..."
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 ml-1 mt-2">Your key is stored securely in your browser's local storage.</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/25 mt-4"
                >
                  Save & Continue
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
