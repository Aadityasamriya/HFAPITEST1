import React, { useState, useEffect, useRef } from 'react';
import { Settings, Send, Bot, User, Image as ImageIcon, Search, Key, Plus, Menu, X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
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

  const clearChat = () => {
    setMessages([]);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 font-bold text-xl">
            <Sparkles className="w-6 h-6 text-blue-400" />
            Hugging Face AI
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-3 py-2">
          <button onClick={clearChat} className="w-full flex items-center gap-2 px-3 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium border border-gray-700">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {/* Chat history list could go here */}
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 px-2">Today</div>
          {messages.length > 0 ? (
            <div className="px-2 py-2 text-sm text-gray-300 truncate hover:bg-gray-800 rounded-lg cursor-pointer">
              {messages[0].content}
            </div>
          ) : (
            <div className="px-2 py-2 text-sm text-gray-600 italic">No messages yet</div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium">
            <Settings className="w-5 h-5 text-gray-400" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative w-full">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-gray-200">Ultra Pro Max AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-400">Online</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  How can I help you today, {userName}?
                </h2>
                <p className="text-gray-400 max-w-md">
                  I am a frontier-level autonomous AI agent. I can search the web, generate breathtaking images, and write complex code.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                  <button onClick={() => setInput("Generate a photorealistic image of a futuristic city")} className="p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-left transition-colors">
                    <ImageIcon className="w-5 h-5 text-blue-400 mb-2" />
                    <div className="font-medium text-sm text-gray-200">Generate an image</div>
                    <div className="text-xs text-gray-500">of a futuristic city</div>
                  </button>
                  <button onClick={() => setInput("Search the web for the latest AI news")} className="p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-left transition-colors">
                    <Search className="w-5 h-5 text-purple-400 mb-2" />
                    <div className="font-medium text-sm text-gray-200">Search the web</div>
                    <div className="text-xs text-gray-500">for the latest AI news</div>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3' : 'bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 border border-gray-700'}`}>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-col gap-2 mb-3">
                        {msg.actions.map((action, i) => (
                          <div key={i} className="text-xs font-medium text-gray-400 flex items-center gap-2 bg-gray-900/50 w-fit px-3 py-1.5 rounded-full">
                            {action.type === 'reaction' && <span>Reacted: {action.emoji}</span>}
                            {action.type === 'message' && <span>{action.text}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>

                    {msg.images && msg.images.length > 0 && (
                      <div className="mt-4 grid gap-2">
                        {msg.images.map((img, i) => (
                          <img key={i} src={img} alt="Generated" className="rounded-xl w-full max-w-md object-cover shadow-lg border border-gray-700" />
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 border border-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message Hugging Face AI...`}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-4 pr-12 py-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none overflow-hidden min-h-[56px] max-h-32"
              rows={1}
              style={{ height: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-gray-500">
            AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Configuration
              </h2>
              {hfApiKey && (
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <form onSubmit={saveSettings} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hugging Face API Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={hfApiKey}
                    onChange={(e) => setHfApiKey(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Get your free API key from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">huggingface.co</a>
                </p>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all"
              >
                Save & Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
