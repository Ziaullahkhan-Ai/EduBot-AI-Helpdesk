
import React, { useState, useEffect, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { db } from '../services/db';
import { Message, Conversation, QueryCategory, Sentiment } from '../types';

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [conversationId] = useState(() => `WEB-${Math.random().toString(36).substring(7)}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userQuery = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userQuery,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      role: 'bot',
      text: '',
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, initialBotMessage]);

    // Metadata analysis in background
    const analysisPromise = gemini.analyzeQuery(userQuery);

    // Chat History
    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Streaming response
    let fullText = "";
    try {
      const stream = gemini.generateStreamingResponse(userQuery, history, db.getFAQs());
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, text: fullText } : m
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }

    // Save final state
    const analysis = await analysisPromise;
    const finalConv: Conversation = {
      id: conversationId,
      studentId: 'STUD-42',
      studentName: 'Active Student',
      messages: [...messages, userMessage, { ...initialBotMessage, text: fullText }],
      category: analysis.category,
      sentiment: analysis.sentiment,
      platform: 'Web',
      lastActivity: Date.now(),
      status: analysis.sentiment === Sentiment.NEGATIVE ? 'Escalated' : 'Open'
    };
    db.saveConversation(finalConv);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              🎓
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">University Concierge</h3>
            <p className="text-xs text-indigo-100/80 font-medium">Powered by Gemini 3 Flash</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
           </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">👋</div>
            <h4 className="text-xl font-bold text-slate-800">Welcome to Global Tech Support</h4>
            <p className="text-slate-500 mt-2 text-sm max-w-xs">Ask me anything about admissions, course fees, or upcoming exam schedules.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Admission requirements?', 'Exam schedule', 'Fee structure'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] relative ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`p-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {m.text || (m.role === 'bot' && <span className="flex gap-1 py-1"><span className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse"></span><span className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse delay-75"></span><span className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse delay-150"></span></span>)}
              </div>
              <div className={`text-[10px] mt-1.5 font-medium text-slate-400 px-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isVoiceMode ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isVoiceMode ? "Listening..." : "Ask your question..."}
              className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner text-sm font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
              <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
          Global Tech University Bot • {new Date().getFullYear()} Edition
        </p>
      </div>
    </div>
  );
};

export default ChatWidget;
