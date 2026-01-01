
import React, { useState } from 'react';
import { gemini } from '../services/geminiService';
import { db } from '../services/db';
import { Conversation, QueryCategory, Sentiment } from '../types';

const IntegrationSimulator: React.FC = () => {
  const [platform, setPlatform] = useState<'WhatsApp' | 'Facebook'>('WhatsApp');
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'in' | 'out' }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateWebhook = async () => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, msg: input, type: 'in' }]);

    // Simulated "Backend" Webhook Processing
    const analysis = await gemini.analyzeQuery(input);
    const response = await gemini.generateResponse(input, [], db.getFAQs());

    // Save to global history as if it came from WhatsApp/FB
    const newConv: Conversation = {
      id: Math.random().toString(36).substring(7),
      studentId: 'WTS-001',
      studentName: `${platform} User`,
      messages: [
        { id: '1', role: 'user', text: input, timestamp: Date.now() },
        { id: '2', role: 'bot', text: response, timestamp: Date.now() }
      ],
      category: analysis.category,
      sentiment: analysis.sentiment,
      platform,
      lastActivity: Date.now(),
      status: 'Open'
    };
    db.saveConversation(newConv);

    // Simulated "Response"
    setTimeout(() => {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: response, type: 'out' }]);
      setIsProcessing(false);
      setInput('');
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Simulation Form */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl">
          {(['WhatsApp', 'Facebook'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${platform === p ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
             <div className="text-4xl mb-4">{platform === 'WhatsApp' ? '💬' : 'Ⓜ️'}</div>
             <p className="text-sm font-semibold text-slate-600">Simulate Incoming Webhook Payload</p>
             <p className="text-xs text-slate-400 mt-1 italic">Mimics a real {platform} API message event</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Incoming Message Text</label>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Send a message as a student via ${platform}...`}
              className="w-full px-5 py-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <button 
            onClick={simulateWebhook}
            disabled={!input.trim() || isProcessing}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? 'Triggering Webhook...' : `Simulate ${platform} Message`}
          </button>
        </div>
      </div>

      {/* Real-time Logs */}
      <div className="bg-slate-900 rounded-3xl p-6 flex flex-col shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-indigo-400 font-mono text-sm uppercase tracking-tighter">Event Logs (Real-time)</h4>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
            <span className="w-1 h-1 bg-indigo-400 rounded-full animate-ping"></span> LISTENING
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs pr-2">
          {logs.map((log, i) => (
            <div key={i} className={`p-3 rounded-lg ${log.type === 'in' ? 'bg-slate-800 border-l-2 border-green-500' : 'bg-slate-800/50 border-l-2 border-indigo-500 opacity-80'}`}>
              <div className="flex justify-between mb-1 opacity-50 uppercase text-[8px]">
                <span>{log.type === 'in' ? 'WEBHOOK_INCOMING' : 'WEBHOOK_OUTGOING'}</span>
                <span>{log.time}</span>
              </div>
              <div className={log.type === 'in' ? 'text-green-400' : 'text-indigo-300'}>
                {log.type === 'in' ? '> REC:' : '< SENT:'} {log.msg}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-600">
               No active event logs. Simulate a message to see the lifecycle.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationSimulator;
