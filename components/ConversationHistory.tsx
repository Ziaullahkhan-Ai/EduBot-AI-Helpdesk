
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Conversation, Sentiment } from '../types';

const ConversationHistory: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => {
    setConversations(db.getConversations());
  }, []);

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
    const updated = db.getConversations();
    setConversations(updated);
    if (selected?.id === id) setSelected(null);
  };

  const handleStatusUpdate = (id: string, status: Conversation['status']) => {
    db.updateConversationStatus(id, status);
    const updated = db.getConversations();
    setConversations(updated);
    if (selected?.id === id) {
      setSelected({ ...selected, status });
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6 overflow-hidden animate-in fade-in duration-500">
      {/* List */}
      <div className="w-1/3 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Inbox</h3>
          <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-full font-bold text-slate-500">{conversations.length} TOTAL</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
             <div className="p-12 text-center text-slate-400">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm font-medium">No conversations yet</p>
             </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`p-5 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${selected?.id === conv.id ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{conv.studentName}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{new Date(conv.lastActivity).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mb-3 italic opacity-80">
                  {conv.messages[conv.messages.length - 1]?.text || "No messages"}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${conv.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : conv.status === 'Escalated' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {conv.status}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">{conv.platform}</span>
                  <button onClick={(e) => deleteConv(conv.id, e)} className="ml-auto p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {selected ? (
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {selected.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{selected.studentName}</h3>
                  <div className="flex gap-3 mt-1 items-center">
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getSentimentColor(selected.sentiment)}`}>
                       {selected.sentiment} Tone
                     </span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       Channel: {selected.platform}
                     </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {selected.status !== 'Resolved' && (
                  <button 
                    onClick={() => handleStatusUpdate(selected.id, 'Resolved')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
                  >
                    Mark Resolved
                  </button>
                )}
                {selected.status !== 'Escalated' && (
                   <button 
                    onClick={() => handleStatusUpdate(selected.id, 'Escalated')}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                  >
                    Escalate
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              {selected.messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-4 rounded-3xl text-sm shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                    {m.text}
                    <div className={`text-[10px] font-medium mt-2 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 px-10 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-4 grayscale">💬</div>
            <h4 className="text-xl font-bold">No Conversation Selected</h4>
            <p className="text-sm mt-2 max-w-xs">Select a student thread from the left to view the full interaction history and metadata.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
