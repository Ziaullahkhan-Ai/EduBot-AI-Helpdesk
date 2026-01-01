
import React, { useState, useEffect, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { db } from '../services/db';
import { Message, Conversation, QueryCategory, Sentiment } from '../types';

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId] = useState(() => Math.random().toString(36).substring(7));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // AI Processing
    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const responseText = await gemini.generateResponse(input, history, db.getFAQs());
    const analysis = await gemini.analyzeQuery(input);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: responseText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    // Save to "Backend"
    const newConv: Conversation = {
      id: conversationId,
      studentId: 'STUD-001',
      studentName: 'Demo Student',
      messages: [...messages, userMessage, botMessage],
      category: analysis.category,
      sentiment: analysis.sentiment,
      platform: 'Web',
      lastActivity: Date.now(),
      status: 'Open'
    };
    db.saveConversation(newConv);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🤖</div>
          <div>
            <h3 className="font-bold">EduBot Assistant</h3>
            <p className="text-xs text-indigo-100 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span> Always here to help
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
            <span className="text-4xl">👋</span>
            <p className="text-slate-500">How can I assist you today?</p>
            <p className="text-xs">Try asking about admissions or fees.</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {m.text}
              <div className={`text-[10px] mt-2 opacity-60 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 px-4 py-2 bg-slate-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
