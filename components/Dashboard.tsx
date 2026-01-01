
import React, { useMemo } from 'react';
import { db } from '../services/db';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { QueryCategory, Sentiment } from '../types';

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
      resolved: conversations.filter(c => c.status === 'Resolved').length
    };
  }, [conversations]);

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Queries', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Resolved Rate', value: `${stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Sentiment', value: 'Neutral', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Channels', value: '3', color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white shadow-sm transition-transform hover:scale-105`}>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm">📁</span> Query Categories
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-sm">😊</span> Sentiment Breakdown
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.sentimentData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Platform Activity */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-6">Channel Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {['Web', 'WhatsApp', 'Facebook'].map((platform) => {
             const count = stats.platformData.find(p => p.name === platform)?.value || 0;
             const percentage = stats.total ? Math.round((count / stats.total) * 100) : 0;
             return (
               <div key={platform} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{platform}</span>
                    <span className="text-sm font-bold text-indigo-600">{percentage}%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    />
                 </div>
               </div>
             )
           })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
