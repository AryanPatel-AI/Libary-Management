import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, BookMarked, Settings, LogOut, History } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  return (
    <div className="flex min-h-[85vh] bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Admin Panel</h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Aryan & Co.</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
            { to: "/admin/books", icon: BookMarked, label: "Manage Books" },
            { to: "/admin/users", icon: Users, label: "User Management" },
            { to: "/admin/logs", icon: History, label: "Activity Logs" }
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-hover' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto relative bg-slate-50 dark:bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
