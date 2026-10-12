import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Clock, ArrowUpRight, 
  Search, Bookmark,
  ShieldCheck, Compass, CheckCircle2
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const MainPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const currentUser = user?.data || user;
  const displayName = currentUser?.name || currentUser?.firstName || 'Scholar';

  const stats = [
    { label: "Active Loans", value: "3", trend: "0 Due Today", icon: BookOpen, status: 'normal' },
    { label: "Pending Requests", value: "1", trend: "Desk Review", icon: Clock, status: 'pending' },
    { label: "Folios Preserved", value: "18", trend: "In Watchlist", icon: Bookmark, status: 'normal' },
    { label: "Citation Credits", value: "142", trend: "Tier 1 Scholar", icon: ShieldCheck, status: 'verified' },
  ];

  const quickActions = [
    { name: "Active Loans", path: "/loans", desc: "View current borrowed folios, deadlines & renew", badge: "Circulation", icon: BookOpen },
    { name: "Borrowing History", path: "/history", desc: "Official ledger of previous loans & return receipts", badge: "Ledger", icon: Clock },
    { name: "Holds & Reservations", path: "/reservations", desc: "Track queue positions & front-desk pickup bins", badge: "Holds", icon: Bookmark },
    { name: "Fines & Account Ledger", path: "/fines", desc: "Itemized fee breakdown & cashier desk settlements", badge: "Financial", icon: ShieldCheck },
    { name: "Special Collections", path: "/collections", desc: "Curated rare folios, manuscripts & archives", badge: "Exhibits", icon: Compass },
    { name: "Subject Categories", path: "/categories", desc: "Dewey Decimal taxonomy & stack directory", badge: "Taxonomy", icon: BookOpen },
  ];

  const recentLogs = [
    { action: "Circulation Check-in", title: "The Structure of Scientific Revolutions", time: "2 hours ago", status: "Returned" },
    { action: "Digital Folio Issued", title: "Structure & Interpretation of Computer Programs", time: "Yesterday", status: "Active" },
    { action: "Watchlist Bookmark", title: "Design Systems: Foundations & Frameworks", time: "3 days ago", status: "Saved" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/books');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] dark:bg-[#090b11] text-slate-900 dark:text-slate-100 pb-20 font-sans transition-colors duration-300">
      
      {/* ── COMMAND DESK HERO ───────────────────────────────────────── */}
      <section className="relative pt-10 pb-16 border-b border-slate-200/60 dark:border-white/[0.06] archival-grid">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-xs uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                SCHOLAR SESSION &bull; DESK TERMINAL
              </div>

              <h1 className="font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Good Day, <span className="italic font-normal">{displayName.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mt-2 font-normal">
                Welcome to the Patel &amp; Co. central scholarly desk. Review your circulated folios,
                query the archives, or explore the latest acquisitions.
              </p>
            </div>

            {/* Quick Universal Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Quick Archive Search..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all shrink-0"
              >
                Query
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ───────────────────────────────────────────── */}
      <section className="container mx-auto px-6 -mt-8 mb-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-6 bg-white dark:bg-[#111523] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className="font-serif-editorial text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── MAIN WORKSPACE MODULES ──────────────────────────────────── */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main 8-Column Grid */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  to={action.path}
                  className="p-7 rounded-2xl bg-white dark:bg-[#111523] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10">
                      {action.badge}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  <div>
                    <h3 className="font-serif-editorial text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {action.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Request Acquisition Banner */}
            <div className="p-8 rounded-3xl bg-slate-950 text-white relative overflow-hidden border border-white/10">
              <div className="relative z-10 max-w-lg">
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                  ACQUISITION DESK
                </span>
                <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold mt-2 mb-2 leading-tight">
                  Request a Special Acquisition
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                  Require an out-of-print monograph, rare conference proceeding, or standard specification?
                  Submit a request to the Patel &amp; Co. cataloging committee.
                </p>
                <Link
                  to="/books"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
                >
                  <span>Submit Folio Request</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <Compass className="absolute -bottom-8 -right-8 w-48 h-48 text-white/[0.04] pointer-events-none" />
            </div>
          </div>

          {/* Side 4-Column Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Recent Archival Activity */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111523] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/5">
                <h4 className="font-serif-editorial text-lg font-bold text-slate-900 dark:text-white">
                  Circulation Ledger
                </h4>
                <span className="font-mono text-[10px] text-slate-400">HISTORY</span>
              </div>

              <div className="space-y-4">
                {recentLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {log.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {log.action} &bull; {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
                <Link
                  to="/orders"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>View Full Transaction Ledger</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Library Schedule & Hours */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111523] border border-slate-200/80 dark:border-white/[0.08] shadow-xs text-xs font-mono space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                FACILITY HOURS &bull; MAIN HALL
              </span>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Monday &ndash; Friday</span>
                <span className="font-bold text-slate-900 dark:text-white">08:00 &ndash; 22:00</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Saturday &ndash; Sunday</span>
                <span className="font-bold text-slate-900 dark:text-white">10:00 &ndash; 18:00</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Digital Vault Accessible 24/7 Globally
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default MainPage;
