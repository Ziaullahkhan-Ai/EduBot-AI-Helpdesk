
import React, { useState } from 'react';
import { db } from '../services/db';
import { FAQ, QueryCategory } from '../types';

const FAQManager: React.FC = () => {
  const [faqs, setFaqs] = useState(db.getFAQs());
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState<Partial<FAQ>>({ category: QueryCategory.OTHER });

  const handleSave = () => {
    if (!newFaq.question || !newFaq.answer) return;
    const item: FAQ = {
      id: Math.random().toString(36).substring(7),
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category as QueryCategory
    };
    const updated = [...faqs, item];
    setFaqs(updated);
    db.saveFAQs(updated);
    setIsAdding(false);
    setNewFaq({ category: QueryCategory.OTHER });
  };

  const deleteFaq = (id: string) => {
    const updated = faqs.filter(f => f.id !== id);
    setFaqs(updated);
    db.saveFAQs(updated);
  };

  const handleReset = () => {
    if (confirm("This will clear all conversations and reset FAQs to default. Continue?")) {
      db.resetData();
      setFaqs(db.getFAQs());
      window.location.reload(); // Refresh to clear all app state
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-800">Knowledge Base</h3>
          <p className="text-xs text-slate-500 font-medium">Define how the AI responds to common student queries</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="px-4 py-2 text-rose-600 border border-rose-100 bg-rose-50 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
          >
            System Reset
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <span>➕</span> Add New Entry
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Department</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                value={newFaq.category}
                onChange={e => setNewFaq({...newFaq, category: e.target.value as QueryCategory})}
              >
                {Object.values(QueryCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Common Question</label>
              <input 
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                placeholder="e.g. How do I access the library?"
                value={newFaq.question || ''}
                onChange={e => setNewFaq({...newFaq, question: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounding Answer</label>
            <textarea 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 h-32 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none font-medium transition-all"
              placeholder="Provide the specific info the AI should use as a source..."
              value={newFaq.answer || ''}
              onChange={e => setNewFaq({...newFaq, answer: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-400 text-sm font-bold hover:text-slate-600">Discard</button>
            <button onClick={handleSave} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Publish to Knowledge Base</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col hover:shadow-lg hover:border-indigo-100 transition-all relative group">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-wider">{faq.category}</span>
            </div>
            <h4 className="font-bold text-slate-800 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">"{faq.question}"</h4>
            <div className="bg-slate-50 p-4 rounded-2xl flex-1">
              <p className="text-xs text-slate-600 leading-relaxed italic opacity-80">"{faq.answer}"</p>
            </div>
            <button 
              onClick={() => deleteFaq(faq.id)}
              className="absolute top-6 right-6 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQManager;
