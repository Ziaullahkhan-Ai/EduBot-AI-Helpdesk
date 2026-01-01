
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'chat', label: 'Live Test Chat', icon: '💬' },
    { id: 'history', label: 'Conversations', icon: '📁' },
    { id: 'faqs', label: 'FAQ Manager', icon: '⚙️' },
    { id: 'simulators', label: 'Integration Panel', icon: '🔌' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-indigo-400">Edu</span>Bot
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Student Helpdesk</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">JD</div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-slate-400">Hackathon Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {navItems.find(n => n.id === activeView)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold uppercase">System Online</span>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
