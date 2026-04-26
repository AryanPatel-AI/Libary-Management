import React, { useState, useEffect } from 'react';
import API_URL from '../api/config';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, Star, Package, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [txRes, watchRes] = await Promise.all([
        axios.get(`${API_URL}/transactions/my-books?limit=100`, config),
        axios.get(`${API_URL}/watchlist`, config)
      ]);

      setTransactions(txRes.data.data.transactions || []);
      setWatchlist(watchRes.data.data?.books || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ─── Data Processing ──────────────────────────────────────────────────
  const activeIssues = transactions.filter(t => t.status === 'issued');
  const pastOrders = transactions.filter(t => t.status === 'returned');
  
  const now = new Date();
  const overdueCount = activeIssues.filter(t => new Date(t.dueDate) < now).length;
  
  const dueReminders = activeIssues.filter(t => {
    const due = new Date(t.dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    // Show books that are overdue or due within 3 days
    return diffDays <= 3;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // ─── Components ───────────────────────────────────────────────────────
  
  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4"
    >
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );

  const BookListItem = ({ transaction }) => {
    const isOverdue = new Date(transaction.dueDate) < now;
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
        <div className="w-12 h-16 bg-slate-200 dark:bg-slate-700 rounded-md shrink-0 flex items-center justify-center overflow-hidden">
          <BookOpen className="w-6 h-6 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-white truncate">{transaction.book?.title}</h4>
          <p className="text-sm text-slate-500 truncate">by {transaction.book?.author}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-500 mb-1">Due Date</p>
          <p className={`text-sm font-bold ${isOverdue ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
            {new Date(transaction.dueDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ⚠️ Overdue Alert Banner */}
      {overdueCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl flex items-center gap-4"
        >
          <div className="bg-red-100 dark:bg-red-800 p-3 rounded-xl text-red-600 dark:text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-900 dark:text-red-200">⚠️ You have {overdueCount} overdue books!</h2>
            <p className="text-red-700 dark:text-red-400">Please return them immediately to avoid daily fines. Visit the library desk or return online.</p>
          </div>
          <button className="ml-auto px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
            Return Books
          </button>
        </motion.div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Overview of your reading activity, due dates, and saved items.</p>
      </div>

      {/* 📊 Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Currently Issued" 
          value={activeIssues.length} 
          icon={BookOpen} 
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" 
        />
        <StatCard 
          title="Total Read / Returned" 
          value={pastOrders.length} 
          icon={CheckCircle} 
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
        />
        <StatCard 
          title="Overdue Books" 
          value={overdueCount} 
          icon={AlertCircle} 
          colorClass="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" 
          subtitle={overdueCount > 0 ? 'Please return immediately to avoid fines' : 'All clear!'}
        />
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 📚 My Books (Active Issues) */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Books</h2>
            </div>
            
            {activeIssues.length > 0 ? (
              <div className="space-y-3">
                {activeIssues.map(t => <BookListItem key={t._id} transaction={t} />)}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                You have no actively issued books.
              </div>
            )}
          </section>

          {/* ⭐ Watchlist */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Watchlist</h2>
            </div>
            
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {watchlist.map(book => (
                  <div key={book._id} className="border border-slate-100 dark:border-slate-700 rounded-xl p-3 flex flex-col">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 mb-1">{book.title}</h4>
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded w-fit mt-auto">{book.category}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                Your watchlist is empty. Explore the library to save books for later.
              </div>
            )}
          </section>
          
          {/* 📦 Orders / History */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
            </div>
            
            {pastOrders.length > 0 ? (
              <div className="space-y-3">
                {pastOrders.slice(0, 5).map(t => (
                  <div key={t._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{t.book?.title}</p>
                      <p className="text-xs text-slate-500">Returned on {new Date(t.returnDate).toLocaleDateString()}</p>
                    </div>
                    {t.fine > 0 && <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-500/20 px-2 py-1 rounded-md">Fine: ₹{t.fine}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No past transactions found.
              </div>
            )}
          </section>

        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-8">
          
          {/* ⏰ Due Reminders */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl p-6 shadow-sm border border-amber-100 dark:border-amber-900/50">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Due Reminders</h2>
            </div>

            {dueReminders.length > 0 ? (
              <div className="space-y-4">
                {dueReminders.map(t => {
                  const isOverdue = new Date(t.dueDate) < now;
                  return (
                    <div key={t._id} className={`p-4 rounded-xl border ${isOverdue ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-white border-amber-100 dark:bg-slate-700 dark:border-slate-600'}`}>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">{t.book?.title}</h4>
                      <p className={`text-xs font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isOverdue ? 'Overdue!' : 'Due Soon'} • {new Date(t.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mb-2 opacity-50" />
                <p>No upcoming due dates!</p>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
