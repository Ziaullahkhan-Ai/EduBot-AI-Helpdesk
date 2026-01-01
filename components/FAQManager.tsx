
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Dynamic Knowledge Base</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <span>➕</span> Add FAQ
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl space-y-4 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newFaq.category}
                onChange={e => setNewFaq({...newFaq, category: e.target.value as QueryCategory})}
              >
                {Object.values(QueryCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Question</label>
              <input 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Student query..."
                value={newFaq.question || ''}
                onChange={e => setNewFaq({...newFaq, question: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Bot Answer</label>
            <textarea 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="How the bot should respond..."
              value={newFaq.answer || ''}
              onChange={e => setNewFaq({...newFaq, answer: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Save FAQ</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow relative group">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">{faq.category}</span>
            </div>
            <h4 className="font-bold text-slate-800 mb-2 leading-tight">"{faq.question}"</h4>
            <p className="text-sm text-slate-500 flex-1 italic">"{faq.answer}"</p>
            <button 
              onClick={() => deleteFaq(faq.id)}
              className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
