
import React, { useMemo } from 'react';
import { db } from '../services/db';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { QueryCategory, Sentiment, Conversation } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
  const conversations = db.getConversations();

  const stats = useMemo(() => {
    const categories: Record<string, number> = {};
    const sentiments: Record<string, number> = {};
    const platforms: Record<string, number> = {};

    conversations.forEach(c => {
      categories[c.category] = (categories[c.category] || 0) + 1;
      sentiments[c.sentiment] = (sentiments[c.sentiment] || 0) + 1;
      platforms[c.platform] = (platforms[c.platform] || 0) + 1;
    });

    return {
      categoryData: Object.entries(categories).map(([name, value]) => ({ name, value })),
      sentimentData: Object.entries(sentiments).map(([name, value]) => ({ name, value })),
      platformData: Object.entries(platforms).map(([name, value]) => ({ name, value })),
      total: conversations.length,
      resolved: conversations.filter(c => c.status === 'Resolved').length,
      escalated: conversations.filter(c => c.status === 'Escalated').length
    };
  }, [conversations]);

  const recentActivity = conversations.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Queries', value: stats.total, color: 'text-indigo-600', bg: 'bg-white', icon: '📩' },
          { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600', bg: 'bg-white', icon: '✅' },
          { label: 'Escalations', value: stats.escalated, color: 'text-rose-600', bg: 'bg-white', icon: '⚠️' },
          { label: 'Avg Sentiment', value: 'Positive', color: 'text-amber-600', bg: 'bg-white', icon: '✨' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md group`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="text-2xl opacity-40 group-hover:opacity-100 transition-opacity">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
             <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">📊</span>
             Query Analytics
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} fontWeight={700} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">🔔</span>
            Live Activity
          </h3>
          <div className="flex-1 space-y-5 overflow-y-auto pr-2">
            {recentActivity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <span className="text-4xl mb-2">💤</span>
                <p className="text-xs font-bold uppercase tracking-wider">Waiting for events...</p>
              </div>
            ) : (
              recentActivity.map((conv) => (
                <div key={conv.id} className="group relative pl-6 border-l-2 border-slate-100 hover:border-indigo-400 transition-colors py-1">
                  <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors"></div>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-black text-slate-800 truncate">{conv.studentName}</p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(conv.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 italic">"{conv.messages[conv.messages.length - 1]?.text}"</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase">{conv.platform}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${conv.status === 'Escalated' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {conv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="mt-6 w-full py-3 bg-slate-50 text-slate-500 text-xs font-black rounded-xl hover:bg-slate-100 transition-colors uppercase tracking-widest">
             View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
