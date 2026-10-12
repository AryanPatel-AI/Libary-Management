import { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const CirculationTerminal = () => {
  const [logs] = useState([
    {
      id: 1,
      type: 'issue',
      title: 'Structure & Interpretation of Computer Programs',
      user: 'Scholar S. Raman',
      shelf: 'DEWEY 005.1',
      time: 'Just now',
    },
    {
      id: 2,
      type: 'return',
      title: 'Principia Mathematica (Vol. 1)',
      user: 'Prof. E. Sterling',
      shelf: 'VAULT-7B',
      time: '3m ago',
    },
    {
      id: 3,
      type: 'reserve',
      title: 'Design of Everyday Things',
      user: 'Researcher K. Chen',
      shelf: 'SHELF 12C',
      time: '7m ago',
    },
  ]);

  return (
    <div className="w-full h-full flex flex-col justify-between rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs border border-white/10 shadow-inner">
      {/* Terminal Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-300 font-bold tracking-wider">CIRCULATION DESK // LIVE STREAM</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          SYNCED
        </div>
      </div>

      {/* Terminal Log Items */}
      <div className="space-y-2 py-2 overflow-hidden">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 transition-colors"
          >
            <div className="flex items-center gap-2 truncate max-w-[70%]">
              {log.type === 'issue' ? (
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : log.type === 'return' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
              <div className="truncate">
                <p className="text-slate-200 font-semibold truncate text-[11px] leading-tight font-sans">
                  {log.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {log.user} · <span className="text-amber-300/80">{log.shelf}</span>
                </p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 shrink-0">{log.time}</span>
          </div>
        ))}
      </div>

      {/* Terminal Footer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
        <span>RFID Circulation Ledger 2.4</span>
        <span className="text-emerald-400">0 Overdue Fines Active</span>
      </div>
    </div>
  );
};

export default CirculationTerminal;
