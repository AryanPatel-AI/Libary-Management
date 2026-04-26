import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, Users, Calendar, Clock, ArrowUpRight, 
  Search, Bell, Settings, Filter, Plus
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MainPage = () => {
  const { user } = useContext(AuthContext);

  const stats = [
    { label: "Currently Issued", value: "12", trend: "+2 this week", icon: <Book className="w-5 h-5" /> },
    { label: "Active Requests", value: "4", trend: "Pending approval", icon: <Clock className="w-5 h-5" /> },
    { label: "Total Visitors", value: "1.2k", trend: "Last 24h", icon: <Users className="w-5 h-5" /> },
    { label: "Due Today", value: "3", trend: "Action required", icon: <Calendar className="w-5 h-5" /> },
  ];

  const quickActions = [
    { name: "Explore Catalog", path: "/books", color: "bg-indigo-600" },
    { name: "View Dashboard", path: "/dashboard", color: "bg-emerald-600" },
    { name: "My Watchlist", path: "/watchlist", color: "bg-amber-600" },
    { name: "Order History", path: "/orders", color: "bg-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      {/* 🌟 Header Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase tracking-widest mb-4">
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                System Operational
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
                Good Day, <span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0] || 'Member'}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
                Welcome to the central command of Patel & Co. Knowledge Center. Manage your collection and explore global insights.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Universal Search..." 
                  className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 pl-10 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                <Bell className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 📊 Stats Dashboard */}
      <section className="container mx-auto px-6 -mt-10 mb-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {stat.icon}
                </div>
                <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {stat.trend}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🧱 Functional Grid */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Actions - 8 Columns */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {quickActions.map((action, i) => (
                <Link 
                  key={i}
                  to={action.path}
                  className="relative overflow-hidden p-8 rounded-[32px] group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${action.color} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-full -translate-x-1/2 -translate-y-1/2`}></div>
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    {action.name}
                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">Launch module to manage your {action.name.toLowerCase()}.</p>
                </Link>
              ))}
            </div>

            <div className="p-8 bg-indigo-600 rounded-[40px] text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-4">Request a Book</h3>
                <p className="text-indigo-100 mb-8 max-w-md">Can't find what you're looking for? Submit a request and we'll source it for you.</p>
                <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black hover:scale-105 transition-transform">
                  New Request
                </button>
              </div>
              <Book className="absolute bottom-[-20px] right-[-20px] w-64 h-64 text-white/10 -rotate-12" />
            </div>
          </div>

          {/* Side Panel - 4 Columns */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[40px] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black">Recent Activity</h3>
                <Filter className="w-5 h-5 text-slate-400 cursor-pointer" />
              </div>
              <div className="space-y-6">
                {[
                  { user: "Sarah J.", action: "issued 'The Great Gatsby'", time: "2h ago" },
                  { user: "You", action: "added 'Atomic Habits' to Watchlist", time: "5h ago" },
                  { user: "Admin", action: "verified your account", time: "1d ago" },
                  { user: "Mike R.", action: "returned 'Deep Work'", time: "2d ago" },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{act.user} <span className="font-medium text-slate-500">{act.action}</span></p>
                      <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-white p-8 rounded-[40px] shadow-xl dark:shadow-none text-white dark:text-slate-900">
              <h3 className="text-xl font-black mb-4">Pro Subscription</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm mb-8 leading-relaxed">Unlock unlimited issues, premium audiobook access, and priority support.</p>
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                Upgrade Now
              </button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default MainPage;
