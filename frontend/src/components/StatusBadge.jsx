import React from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, XCircle, 
  ShieldAlert, Wrench, Shield, ShieldOff,
  PackageCheck, Package, Ban, Wallet,
  Banknote, Receipt, CheckCircle
} from 'lucide-react';

export const StatusBadge = ({ type, status, className = '' }) => {
  // Normalize status for matching
  const s = status?.toLowerCase() || '';

  let icon = null;
  let colorClass = '';
  let label = status;

  // 1. BOOK STATUSES
  if (type === 'book') {
    if (s.includes('available')) {
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    } else if (s.includes('issued')) {
      icon = <Clock className="w-3.5 h-3.5" />;
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    } else if (s.includes('reserved')) {
      icon = <Package className="w-3.5 h-3.5" />;
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    } else if (s.includes('overdue')) {
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    } else if (s.includes('lost')) {
      icon = <XCircle className="w-3.5 h-3.5" />;
      colorClass = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-white/10 dark:text-slate-300 dark:border-white/20';
    } else if (s.includes('damaged')) {
      icon = <ShieldAlert className="w-3.5 h-3.5" />;
      colorClass = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
    } else if (s.includes('maintenance')) {
      icon = <Wrench className="w-3.5 h-3.5" />;
      colorClass = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
    }
  }

  // 2. MEMBER STATUSES
  if (type === 'member') {
    if (s.includes('active')) {
      icon = <Shield className="w-3.5 h-3.5" />;
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    } else if (s.includes('suspended')) {
      icon = <Ban className="w-3.5 h-3.5" />;
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    } else if (s.includes('expired')) {
      icon = <ShieldOff className="w-3.5 h-3.5" />;
      colorClass = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-white/10 dark:text-slate-300 dark:border-white/20';
    }
  }

  // 3. RESERVATION STATUSES
  if (type === 'reservation') {
    if (s.includes('pending')) {
      icon = <Clock className="w-3.5 h-3.5" />;
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    } else if (s.includes('ready')) {
      icon = <PackageCheck className="w-3.5 h-3.5" />;
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    } else if (s.includes('fulfilled')) {
      icon = <CheckCircle className="w-3.5 h-3.5" />;
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    } else if (s.includes('cancelled')) {
      icon = <XCircle className="w-3.5 h-3.5" />;
      colorClass = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-white/10 dark:text-slate-300 dark:border-white/20';
    } else if (s.includes('expired')) {
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    }
  }

  // 4. FINE STATUSES
  if (type === 'fine') {
    if (s.includes('unpaid')) {
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    } else if (s.includes('partially paid')) {
      icon = <Wallet className="w-3.5 h-3.5" />;
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    } else if (s.includes('paid')) {
      icon = <Banknote className="w-3.5 h-3.5" />;
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    } else if (s.includes('waived')) {
      icon = <Receipt className="w-3.5 h-3.5" />;
      colorClass = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-white/10 dark:text-slate-300 dark:border-white/20';
    }
  }

  // Fallback if no match
  if (!icon) {
    icon = <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />;
    colorClass = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-white/10 dark:text-slate-300 dark:border-white/20';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${colorClass} ${className}`}>
      {icon}
      {label}
    </span>
  );
};
