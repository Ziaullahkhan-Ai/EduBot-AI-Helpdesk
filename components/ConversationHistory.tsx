
import React, { useState } from 'react';
import { db } from '../services/db';
import { Conversation, Sentiment } from '../types';

const ConversationHistory: React.FC = () => {
  const [conversations, setConversations] = useState(db.getConversations());
  const [selected, setSelected] = useState<Conversation | null>(null);

  const getSentimentColor = (s: Sentiment) => {
    switch(s) {
      case Sentiment.POSITIVE: return 'text-green-600 bg-green-50';
      case Sentiment.NEGATIVE: return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const deleteConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    db.deleteConversation(id);
    setConversations(db.getConversations());
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6 overflow-hidden">
      {/* List */}
      <div className="w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <input 
            placeholder="Search conversations..." 
            className="w-full px-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
             <div className="p-8 text-center text-slate-400">No conversations found</div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === conv.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{conv.studentName}</h4>
                  <span className="text-[10px] text-slate-400">{new Date(conv.lastActivity).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mb-2">
                  {conv.messages[conv.messages.length - 1]?.text || "No messages"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{conv.platform}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600">{conv.category}</span>
                  <button onClick={(e) => deleteConv(conv.id, e)} className="ml-auto text-slate-300 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {selected ? (
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-lg">{selected.studentName}</h3>
                <div className="flex gap-3 mt-1">
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(selected.sentiment)}`}>
                     {selected.sentiment} Sentiment
                   </span>
                   <span className="text-xs text-slate-500 flex items-center gap-1">
                     Platform: <strong>{selected.platform}</strong>
                   </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">Mark Resolved</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selected.messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                    {m.text}
                    <div className="text-[10px] opacity-60 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <span className="text-6xl mb-4">💬</span>
            <p>Select a conversation to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
