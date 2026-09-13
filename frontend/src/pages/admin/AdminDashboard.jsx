import React, { useState, useEffect } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import MetricCard from '../../components/MetricCard';
import { Book, Users, ClipboardList, AlertCircle, Building2, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    books: 0,
    copies: 0,
    availableCopies: 0,
    users: 0,
    issues: 0,
    overdue: 0,
    unpaidFines: 0,
    branches: 0
  });
  const [borrowData, setBorrowData] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchDashboardAnalytics = async () => {
      try {
        setLoading(true);
        const [statsRes, trendsRes, popularRes] = await Promise.all([
          axios.get(`${API_URL}/analytics/dashboard`, getAuthConfig()).catch(() => null),
          axios.get(`${API_URL}/analytics/borrowing-trends`, getAuthConfig()).catch(() => null),
          axios.get(`${API_URL}/analytics/popular-books?limit=5`, getAuthConfig()).catch(() => null)
        ]);

        if (statsRes?.data?.success) {
          const d = statsRes.data.data;
          setStats({
            books: d.totalBooks || 0,
            copies: d.totalCopies || 0,
            availableCopies: d.totalAvailableCopies || 0,
            users: d.totalUsers || 0,
            issues: d.activeIssues || 0,
            overdue: d.overdueBooks || 0,
            unpaidFines: d.totalUnpaidFines || 0,
            branches: d.branchesCount || 1
          });
        }

        if (trendsRes?.data?.success) {
          const chartPoints = (trendsRes.data.data || []).map((p) => ({
            name: p.date,
            borrows: p.borrowed || 0,
            returns: p.returned || 0
          }));
          setBorrowData(chartPoints);
        }

        if (popularRes?.data?.success) {
          setPopularBooks(popularRes.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAnalytics();
  }, []);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Enterprise LMS Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time branch inventory, circulation telemetry, and member activity.
          </p>
        </div>

        <Link
          to="/admin/circulation"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-indigo-500/20 transition-all active:scale-95"
        >
          Open Circulation Desk
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Bibliographic Titles" 
          value={loading ? '...' : stats.books} 
          icon={Book} 
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
          delay={0.1} 
        />
        <MetricCard 
          title="Physical Copies (Assets)" 
          value={loading ? '...' : `${stats.availableCopies} / ${stats.copies}`} 
          icon={Building2} 
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
          delay={0.2} 
        />
        <MetricCard 
          title="Active Loans" 
          value={loading ? '...' : stats.issues} 
          icon={ClipboardList} 
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
          delay={0.3} 
        />
        <MetricCard 
          title="Overdue Returns" 
          value={loading ? '...' : stats.overdue} 
          icon={AlertCircle} 
          colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
          delay={0.4} 
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Members</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.users}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unpaid Fines Due</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">₹{stats.unpaidFines}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connected Branches</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.branches}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Borrowing Trends Chart */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Weekly Circulation Volume (Checkouts vs Returns)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={borrowData.length > 0 ? borrowData : [
                { name: 'Mon', borrows: 3, returns: 2 },
                { name: 'Tue', borrows: 5, returns: 4 },
                { name: 'Wed', borrows: 4, returns: 3 },
                { name: 'Thu', borrows: 6, returns: 5 },
                { name: 'Fri', borrows: 8, returns: 7 },
                { name: 'Sat', borrows: 10, returns: 8 },
                { name: 'Sun', borrows: 6, returns: 5 }
              ]}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="borrows" name="Checkouts" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
                <Area type="monotone" dataKey="returns" name="Returns" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReturns)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Borrowed Books */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Most Circulated Titles</h3>
            <Link to="/admin/reports" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View All Reports
            </Link>
          </div>

          <div className="space-y-4">
            {popularBooks.map((b, idx) => (
              <div key={b.id || idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-bold text-slate-400 text-sm">#{idx + 1}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{b.title}</p>
                    <p className="text-xs text-slate-500 truncate">{b.author}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl shrink-0">
                  {b.borrowCount} loans
                </span>
              </div>
            ))}

            {popularBooks.length === 0 && (
              <p className="text-center text-slate-400 py-10 text-sm">
                Circulation data accumulating.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
