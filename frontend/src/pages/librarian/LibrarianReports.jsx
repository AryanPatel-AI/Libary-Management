import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, TrendingUp, BookOpen, RotateCcw,
  DollarSign, CheckSquare, Clock, ArrowUpRight, BarChart2
} from 'lucide-react';
import { toast } from 'react-toastify';

const TOP_CATEGORIES = [
  { name: 'Computer Science & Systems', count: 48, percentage: 34 },
  { name: 'Philosophy & Logic', count: 32, percentage: 22 },
  { name: 'Architecture & Design Theory', count: 26, percentage: 18 },
  { name: 'Cognitive Science & Linguistics', count: 20, percentage: 14 },
  { name: 'Rare Archival Manuscripts', count: 16, percentage: 12 },
];

const SHELF_AUDIT_TASKS = [
  { id: 'sh-1', stack: 'Wing B &bull; 3rd Floor &bull; CS Stacks 1-4', status: 'completed', auditor: 'EV', time: '09:30 AM' },
  { id: 'sh-2', stack: 'Wing A &bull; 2nd Floor &bull; Philosophy Stacks 1-2', status: 'completed', auditor: 'JS', time: '11:00 AM' },
  { id: 'sh-3', stack: 'Special Vault &bull; Rare Manuscripts Shelf R', status: 'pending', auditor: 'Unassigned', time: 'Due 03:00 PM' },
  { id: 'sh-4', stack: 'Ground Level &bull; Contemporary Fiction A-M', status: 'pending', auditor: 'Unassigned', time: 'Due 05:00 PM' },
];

const OVERDUE_DISPATCHES = [
  { card: 'PKC-MBR-109281', name: 'Alexander Wright', book: 'The Mythical Man-Month', days: 5, status: 'SMS & Email Sent' },
  { card: 'PKC-MBR-884102', name: 'Clara Oswald', book: 'A Pattern Language', days: 3, status: 'Email Sent' },
  { card: 'PKC-MBR-491024', name: 'David Kim', book: 'Purely Functional Data Structures', days: 7, status: 'Phone Follow-up Needed' },
];

const LibrarianReports = () => {
  const [shelfTasks, setShelfTasks] = useState(SHELF_AUDIT_TASKS);

  const toggleTask = (id) => {
    setShelfTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'completed' ? 'pending' : 'completed',
          auditor: t.status === 'completed' ? 'Unassigned' : 'Current Staff',
        };
      }
      return t;
    }));
    toast.success('Shelf reading audit status toggled');
  };

  const handleExportDaily = () => {
    toast.success('Daily Operational Report (CSV) exported');
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Eyebrow & Title */}
      <div>
        <span className="section-eyebrow mb-1.5">Librarian Desk &bull; Operations</span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-editorial text-3xl font-bold text-foreground tracking-tight">
              Circulation Desk Daily Reports
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Shift circulation metrics, stack shelf-reading checklists, high-velocity categories, and overdue dispatch audits.
            </p>
          </div>

          <button
            onClick={handleExportDaily}
            className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 self-start sm:self-auto shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Download Shift Report (.CSV)
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-blue shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Today's Checkouts</span>
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif-editorial">74</span>
            <span className="text-xs text-emerald-600 font-semibold">+12% vs avg</span>
          </div>
        </div>

        <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-green shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Today's Returns</span>
            <RotateCcw className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif-editorial">61</span>
            <span className="text-xs text-muted-foreground">reshelved or held</span>
          </div>
        </div>

        <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-amber shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Fines Collected</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif-editorial text-amber-600 dark:text-amber-400">$84.50</span>
            <span className="text-xs text-muted-foreground">cash &amp; card total</span>
          </div>
        </div>

        <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-purple shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Holds Ready at Desk</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif-editorial">19</span>
            <span className="text-xs text-muted-foreground">in active bins</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column: Highest Circulating Categories */}
        <div className="hairline-card p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-serif-editorial text-lg font-bold text-foreground">
              Circulation Velocity by Subject
            </h3>
            <span className="font-mono text-xs text-muted-foreground">Past 7 Days</span>
          </div>

          <div className="space-y-4 pt-1">
            {TOP_CATEGORIES.map(cat => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{cat.name}</span>
                  <span className="font-mono font-semibold text-muted-foreground">{cat.count} circulations ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${cat.percentage * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Shelf-Reading Audit Checklist */}
        <div className="hairline-card p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-serif-editorial text-lg font-bold text-foreground">
              Daily Shelf-Reading &amp; Stacks Audit
            </h3>
            <span className="font-mono text-xs text-muted-foreground">Shift Duties</span>
          </div>

          <div className="space-y-3 pt-1">
            {shelfTasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  task.status === 'completed'
                    ? 'bg-muted/30 border-border opacity-70'
                    : 'bg-card border-amber-500/40 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    readOnly
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <div>
                    <p
                      className="text-xs font-semibold text-foreground"
                      dangerouslySetInnerHTML={{ __html: task.stack }}
                    />
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      Auditor: {task.auditor} &bull; {task.time}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  task.status === 'completed'
                    ? 'badge-success'
                    : 'badge-warning'
                }`}>
                  {task.status === 'completed' ? 'Checked' : 'Due'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Overdue Notice Dispatch Log */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <h3 className="font-serif-editorial font-bold text-base text-foreground">
            Automated Overdue Notice Dispatches (Today)
          </h3>
          <span className="font-mono text-xs text-muted-foreground">3 dispatches executed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="th-cell">Patron Name &amp; Card ID</th>
                <th className="th-cell">Overdue Folio Title</th>
                <th className="th-cell">Days Overdue</th>
                <th className="th-cell text-right">Dispatch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {OVERDUE_DISPATCHES.map((d, i) => (
                <tr key={i} className="tr-hover">
                  <td className="td-cell">
                    <p className="font-semibold text-xs text-foreground">{d.name}</p>
                    <span className="font-mono text-[10px] text-muted-foreground">{d.card}</span>
                  </td>
                  <td className="td-cell font-serif-editorial font-bold text-sm text-foreground">
                    {d.book}
                  </td>
                  <td className="td-cell font-mono text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    {d.days} days
                  </td>
                  <td className="td-cell text-right">
                    <span className="badge-info px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default LibrarianReports;
