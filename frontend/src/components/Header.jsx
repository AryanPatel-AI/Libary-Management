import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Library, User, Moon, Sun, Menu, X, LogOut, Bookmark, ShoppingBag, LayoutDashboard, Home, Info, Phone, Star, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';

const Header = ({ darkMode, toggleDarkMode, onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLandingPage = location.pathname === '/';

  // Links shown in the hidden menu
  const mainLinks = [
    { name: 'Home', path: '/main', icon: <Home className="w-5 h-5" /> },
    { name: 'Catalog', path: '/books', icon: <Library className="w-5 h-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Watchlist', path: '/watchlist', icon: <Bookmark className="w-5 h-5" /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingBag className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className={`fixed top-0 z-[60] w-full border-b transition-all duration-500 ${isScrolled ? 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-slate-200 dark:border-slate-800' : 'bg-transparent border-transparent'}`}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* 🏷️ Logo */}
          <Link to={user ? "/main" : "/"} className="flex items-center gap-3 hover:scale-105 transition-transform group">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:rotate-12 transition-all">
              <Library className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Patel & Co.</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Knowledge Center</span>
            </div>
          </Link>

          {/* ⚙️ Minimal Action Center */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Main Menu Trigger (The 'Settings' Symbol) */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-3 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all flex items-center gap-2 group"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              <span className="hidden sm:inline font-bold text-sm tracking-tight">Navigation</span>
            </button>

            {!user && isLandingPage && (
              <button 
                onClick={onOpenLogin}
                className="ml-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/10"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🧭 Professional Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[70] flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Menu Content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl h-full overflow-y-auto flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Settings className="text-white w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-black tracking-tighter">Command Center</h2>
                </div>
                <button 
                  onClick={closeMenu}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 p-8 space-y-12">
                {/* Platform Links */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">System Access</h3>
                  <div className="space-y-2">
                    {mainLinks.map((link, i) => (
                      <Link 
                        key={i}
                        to={link.path}
                        onClick={closeMenu}
                        className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${location.pathname === link.path.split('#')[0] ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600'}`}
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account Details if logged in */}
                {user && user.data && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-4">
                      {user.data.avatar ? (
                        <img src={user.data.avatar} alt="Profile" className="w-12 h-12 rounded-2xl object-cover border border-indigo-600/20" />
                      ) : (
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                          {user.data.name ? user.data.name[0] : '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-black text-slate-900 dark:text-white leading-tight">{user.data.name}</p>
                        <p className="text-xs text-slate-500">{user.data.email}</p>
                      </div>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membership Status</p>
                    <p className="text-indigo-500 font-black">Elite Tier Member</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-8 border-t border-slate-100 dark:border-slate-800">
                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-black hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out Session
                  </button>
                ) : (
                  <button 
                    onClick={() => { closeMenu(); onOpenLogin(); }}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-indigo-600 text-white rounded-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Initialize Account
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
