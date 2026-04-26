import React, { useState, useEffect } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import MetricCard from '../../components/MetricCard';
import { Book, Users, ClipboardList, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ books: 0, users: 0, issues: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  // Mock data for charts - in reality, fetch this from /api/analytics
  const borrowData = [
    { name: 'Mon', borrows: 4 },
    { name: 'Tue', borrows: 7 },
    { name: 'Wed', borrows: 5 },
    { name: 'Thu', borrows: 10 },
    { name: 'Fri', borrows: 8 },
    { name: 'Sat', borrows: 15 },
    { name: 'Sun', borrows: 12 },
  ];

  const categoryData = [
    { name: 'Fiction', count: 40 },
    { name: 'Non-Fiction', count: 30 },
    { name: 'Sci-Fi', count: 20 },
    { name: 'Fantasy', count: 27 },
    { name: 'Biography', count: 18 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/books`),
          axios.get(`${API_URL}/users`)
        ]);
        
        const allBooks = booksRes.data.data.books || [];
        const totalBooks = allBooks.reduce((acc, book) => acc + book.totalCopies, 0);
        const availableBooks = allBooks.reduce((acc, book) => acc + book.availableCopies, 0);
        
        setStats({
          books: totalBooks,
          users: usersRes.data.data.total || 0,
          issues: totalBooks - availableBooks,
          overdue: 2 // Mock overdue count
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome to the Aryan & Co. Library Admin Dashboard</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Books Inventory" value={loading ? '...' : stats.books} icon={Book} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" delay={0.1} />
        <MetricCard title="Registered Members" value={loading ? '...' : stats.users} icon={Users} colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" delay={0.2} />
        <MetricCard title="Active Issues" value={loading ? '...' : stats.issues} icon={ClipboardList} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" delay={0.3} />
        <MetricCard title="Overdue Returns" value={loading ? '...' : stats.overdue} icon={AlertCircle} colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" delay={0.4} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Borrowing Trends Chart */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Weekly Borrowing Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={borrowData}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#aa3bff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#aa3bff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="borrows" stroke="#aa3bff" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Books by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
