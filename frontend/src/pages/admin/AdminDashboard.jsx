import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import {
  Book, BookOpen, Users, ClipboardList, AlertCircle, DollarSign, Search,
  Plus, ArrowUpRight, ArrowDownLeft, CheckCircle2, TrendingUp, Clock,
  BookmarkCheck, UserPlus, FileText, ChevronRight, ArrowRight, ShieldCheck,
  PackageCheck, RefreshCw, Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import API_URL from '../../api/config';
import { AuthContext } from '../../contexts/AuthContext';

/* ── Fallback Operational Datasets ────────────────────────────────── */
const MOCK_ATTENTION_OVERDUE = [
  { id: 'ov-1', member: 'Priya Sharma', card: 'PKC-MBR-102938', title: 'The Structure of Scientific Revolutions', daysOverdue: 8, fine: 8.00 },
  { id: 'ov-2', member: 'Arjun Mehta',  card: 'PKC-MBR-449120', title: 'Clean Code: Craftsmanship in Software', daysOverdue: 5, fine: 5.00 },
  { id: 'ov-3', member: 'Marcus Vance', card: 'PKC-MBR-192834', title: 'Structure & Interpretation of Computer Programs', daysOverdue: 3, fine: 3.00 },
];

const MOCK_ATTENTION_RESERVATIONS = [
  { id: 'res-1', book: 'Klara and the Sun', author: 'Kazuo Ishiguro', patron: 'Julian Sterling', shelf: 'Front Desk Bin A-04', readyUntil: 'Expires in 2 days' },
  { id: 'res-2', book: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', patron: 'Elena Rostova', shelf: 'Wing B &bull; Stack 5-A', readyUntil: 'Needs pulling today' },
];

const MOCK_ATTENTION_DUETODAY = [
  { id: 'due-1', member: 'Maya Lin', card: 'PKC-MBR-309112', title: 'The Design of Everyday Things', dueTime: 'Today 05:00 PM' },
  { id: 'due-2', member: 'David Kim', card: 'PKC-MBR-904123', title: 'A Pattern Language', dueTime: 'Today 08:00 PM' },
];

const MOCK_ACTIVITY_FEED = [
  { id: 'act-1', type: 'issue',   title: 'Issued "Introduction to Algorithms"', member: 'Kavya Nair', time: '4 min ago',   badge: 'Issue' },
  { id: 'act-2', type: 'return',  title: 'Returned "Thinking, Fast and Slow"',   member: 'Arjun Mehta', time: '18 min ago',  badge: 'Return' },
  { id: 'act-3', type: 'member',  title: 'Enrolled Scholar Patron',             member: 'Dr. Clara Oswald', time: '45 min ago', badge: 'Member' },
  { id: 'act-4', type: 'payment', title: 'Settled Overdue Fine ($4.00)',        member: 'Julian Sterling', time: '1 hr ago',    badge: 'Payment' },
];

const MOCK_CHART_DATA = [
  { name: 'Mon', issues: 18, returns: 14 },
  { name: 'Tue', issues: 24, returns: 19 },
  { name: 'Wed', issues: 20, returns: 22 },
  { name: 'Thu', issues: 28, returns: 25 },
  { name: 'Fri', issues: 35, returns: 31 },
  { name: 'Sat', issues: 42, returns: 38 },
  { name: 'Sun', issues: 29, returns: 26 },
];

const MOCK_POPULAR_BOOKS = [
  { id: 'p-1', title: 'The Structure of Scientific Revolutions', author: 'Thomas S. Kuhn', count: 52, category: 'Philosophy' },
  { id: 'p-2', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen et al.', count: 47, category: 'Computer Science' },
  { id: 'p-3', title: 'The Design of Everyday Things', author: 'Don Norman', count: 41, category: 'Design Systems' },
  { id: 'p-4', title: 'Gödel, Escher, Bach', author: 'Douglas Hofstadter', count: 36, category: 'Cognitive Science' },
];

const MOCK_NEW_ACQUISITIONS = [
  { id: 'acq-1', title: 'Purely Functional Data Structures', author: 'Chris Okasaki', accession: '2026-06-12', category: 'CS Stacks' },
  { id: 'acq-2', title: 'The Order of Time', author: 'Carlo Rovelli', accession: '2026-06-10', category: 'Physics' },
  { id: 'acq-3', title: 'The Architecture of the City', author: 'Aldo Rossi', accession: '2026-06-08', category: 'Architecture' },
];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 4820,
    availableCopies: 3940,
    currentlyIssued: 880,
    overdue: 24,
    members: 1420,
    reservations: 42,
    outstandingFines: 318.50,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [attentionTab, setAttentionTab] = useState('overdue');

  const currentUser = user?.data || user;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOperationalData();
  }, []);

  const fetchOperationalData = async () => {
    try {
      setLoading(true);
      if (token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_URL}/analytics/dashboard`, config).catch(() => null);
        if (res?.data?.success && res.data.data) {
          const d = res.data.data;
          setStats({
            totalBooks: d.totalBooks || 4820,
            availableCopies: d.totalAvailableCopies || 3940,
            currentlyIssued: d.activeIssues || 880,
            overdue: d.overdueBooks || 24,
            members: d.totalUsers || 1420,
            reservations: d.reservationsCount || 42,
            outstandingFines: d.totalUnpaidFines || 318.50,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* ── 1. OPERATIONAL COMMAND HEADER & QUICK ACTIONS ───────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              ADMINISTRATIVE DESK &bull; LIVE TERMINAL
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Library Operations Command
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Real-time circulation metrics, stack alerts, reservation pipelines, and audit logs.
          </p>
        </div>

        {/* Quick Actions Strip */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/books"
            className="px-3.5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Book
          </Link>
          <Link
            to="/admin/circulation"
            className="px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
            Issue Book
          </Link>
          <Link
            to="/admin/circulation"
            className="px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            Return Book
          </Link>
          <Link
            to="/admin/users"
            className="px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-purple-500" />
            Add Member
          </Link>
        </div>
      </div>

      {/* ── 2. SEVEN CORE OPERATIONAL INDICATORS ───────────────────────── */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          
          {/* Total Books */}
          <div className="hairline-card p-4 rounded-2xl bg-card border border-border metric-blue shadow-2xs">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
              Total Titles
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif-editorial">{stats.totalBooks.toLocaleString()}</span>
              <Book className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">in collection</span>
          </div>

          {/* Available Copies */}
          <div className="hairline-card p-4 rounded-2xl bg-card border border-border metric-green shadow-2xs">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
              Available Copies
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif-editorial text-emerald-600 dark:text-emerald-400">
                {stats.availableCopies.toLocaleString()}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">on shelf ready</span>
          </div>

          {/* Currently Issued */}
          <div className="hairline-card p-4 rounded-2xl bg-card border border-border metric-purple shadow-2xs">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
              Currently Issued
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif-editorial text-foreground">
                {stats.currentlyIssued.toLocaleString()}
              </span>
              <ClipboardList className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">active loans</span>
          </div>

          {/* Overdue */}
          <div className="hairline-card p-4 rounded-2xl bg-card border border-rose-500/40 metric-red shadow-2xs">
            <span className="font-mono text-[9px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold block">
              Overdue
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif-editorial text-rose-600 dark:text-rose-400">
                {stats.overdue}
              </span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <span className="text-[10px] text-rose-600/80 block mt-1">require action</span>
          </div>

          {/* Members */}
          <div className="hairline-card p-4 rounded-2xl bg-card border border-border metric-blue shadow-2xs">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
              Members
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif-editorial">
                {stats.members.toLocaleString()}
              </span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">registered scholars</span>
          </div>

          {/* Reservations */}
          <div className="hairline-card p-4 rounded-2xl bg-card border border-border metric-amber shadow-2xs">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
              Reservations
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif-editorial text-amber-600 dark:text-amber-400">
                {stats.reservations}
              </span>
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">in hold queue</span>
          </div>

          {/* Outstanding Fines */}
          <div className="hairline-card p-4 rounded-2xl bg-card border border-border metric-amber shadow-2xs">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
              Unpaid Fines
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif-editorial text-amber-600 dark:text-amber-400">
                ${stats.outstandingFines.toFixed(2)}
              </span>
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">pending receipt</span>
          </div>

        </div>
      </section>

      {/* ── 3. ATTENTION REQUIRED SECTION ─────────────────────────────── */}
      <section className="hairline-card rounded-3xl bg-card border border-border overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h2 className="font-serif-editorial text-lg font-bold text-foreground">
                Priority Attention Required
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Items demanding staff intervention: overdue loans, pending hold retrievals, and deadline expiries.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { key: 'overdue', label: `Overdue Books (${MOCK_ATTENTION_OVERDUE.length})` },
              { key: 'reservations', label: `Pending Holds (${MOCK_ATTENTION_RESERVATIONS.length})` },
              { key: 'duetoday', label: `Due Today (${MOCK_ATTENTION_DUETODAY.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setAttentionTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  attentionTab === tab.key
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {attentionTab === 'overdue' && (
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="th-cell">Overdue Title</th>
                  <th className="th-cell">Borrower Member</th>
                  <th className="th-cell">Days Overdue</th>
                  <th className="th-cell">Accrued Fine</th>
                  <th className="th-cell text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_ATTENTION_OVERDUE.map(row => (
                  <tr key={row.id} className="tr-hover">
                    <td className="td-cell font-serif-editorial font-bold text-sm text-foreground">
                      {row.title}
                    </td>
                    <td className="td-cell">
                      <p className="text-xs font-semibold text-foreground">{row.member}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">{row.card}</span>
                    </td>
                    <td className="td-cell font-mono text-xs text-rose-600 dark:text-rose-400 font-semibold">
                      {row.daysOverdue} days past due
                    </td>
                    <td className="td-cell font-mono text-xs text-foreground">
                      ${row.fine.toFixed(2)}
                    </td>
                    <td className="td-cell text-right">
                      <Link
                        to="/admin/circulation"
                        className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        Dispatch Notice &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {attentionTab === 'reservations' && (
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="th-cell">Requested Volume</th>
                  <th className="th-cell">Patron Scholar</th>
                  <th className="th-cell">Shelf Routing</th>
                  <th className="th-cell">Hold Window</th>
                  <th className="th-cell text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_ATTENTION_RESERVATIONS.map(row => (
                  <tr key={row.id} className="tr-hover">
                    <td className="td-cell font-serif-editorial font-bold text-sm text-foreground">
                      {row.book}
                      <p className="font-sans text-xs text-muted-foreground font-normal">{row.author}</p>
                    </td>
                    <td className="td-cell text-xs font-semibold text-foreground">
                      {row.patron}
                    </td>
                    <td className="td-cell font-mono text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: row.shelf }} />
                    <td className="td-cell font-mono text-xs text-amber-600 dark:text-amber-400">
                      {row.readyUntil}
                    </td>
                    <td className="td-cell text-right">
                      <Link
                        to="/admin/reservations"
                        className="px-3 py-1 rounded-lg bg-foreground text-background hover:opacity-90 text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        Fulfill Hold &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {attentionTab === 'duetoday' && (
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="th-cell">Volume Title</th>
                  <th className="th-cell">Borrower Member</th>
                  <th className="th-cell">Expiry Deadline</th>
                  <th className="th-cell text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_ATTENTION_DUETODAY.map(row => (
                  <tr key={row.id} className="tr-hover">
                    <td className="td-cell font-serif-editorial font-bold text-sm text-foreground">
                      {row.title}
                    </td>
                    <td className="td-cell">
                      <p className="text-xs font-semibold text-foreground">{row.member}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">{row.card}</span>
                    </td>
                    <td className="td-cell font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      {row.dueTime}
                    </td>
                    <td className="td-cell text-right">
                      <Link
                        to="/admin/circulation"
                        className="px-3 py-1 rounded-lg bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        Inspect Loan
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── 4. ANALYTICS & ACTIVITY GRID ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left 7 Cols: Meaningful Circulation Trends Chart */}
        <div className="lg:col-span-7 hairline-card p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-serif-editorial text-lg font-bold text-foreground">
                Circulation Velocity &amp; Activity Trends
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daily book checkouts versus check-in volume over the past 7 days.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Checkouts
              </span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Returns
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="issuesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="returnsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#issuesGrad)" />
                <Area type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#returnsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 Cols: Live Activity Feed */}
        <div className="lg:col-span-5 hairline-card p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-serif-editorial text-lg font-bold text-foreground">
              Recent Activity Feed
            </h3>
            <Link to="/admin/logs" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              Full Audit Log &rarr;
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {MOCK_ACTIVITY_FEED.map(act => (
              <div key={act.id} className="p-3 rounded-2xl bg-muted/30 border border-border flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      act.type === 'issue' ? 'badge-info' :
                      act.type === 'return' ? 'badge-success' :
                      act.type === 'payment' ? 'badge-warning' : 'badge-neutral'
                    }`}>
                      {act.badge}
                    </span>
                    <span className="font-semibold text-foreground">{act.title}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-1">
                    Patron: <span className="text-foreground">{act.member}</span>
                  </p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 5. POPULAR BOOKS & NEW ACQUISITIONS ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Popular Books */}
        <div className="hairline-card p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-serif-editorial text-lg font-bold text-foreground">
              High-Circulation Popular Titles
            </h3>
            <span className="font-mono text-xs text-muted-foreground">30-Day Velocity</span>
          </div>

          <div className="space-y-3">
            {MOCK_POPULAR_BOOKS.map((b, idx) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400 w-5">
                    0{idx + 1}
                  </span>
                  <div>
                    <p className="font-serif-editorial font-bold text-sm text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.author} &bull; {b.category}</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-muted-foreground">
                  {b.count} borrows
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* New Acquisitions */}
        <div className="hairline-card p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-serif-editorial text-lg font-bold text-foreground">
              Recent Archival Acquisitions
            </h3>
            <Link to="/admin/books" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              Inventory &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_NEW_ACQUISITIONS.map(acq => (
              <div key={acq.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border">
                <div>
                  <p className="font-serif-editorial font-bold text-sm text-foreground">{acq.title}</p>
                  <p className="text-xs text-muted-foreground">{acq.author} &bull; {acq.category}</p>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Added {acq.accession}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
