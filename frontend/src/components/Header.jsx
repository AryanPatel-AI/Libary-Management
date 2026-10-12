import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Library, Moon, Sun, X, LogOut, LogIn, UserPlus,
  Bookmark, ShoppingBag, LayoutDashboard, Home, ShieldAlert, Sparkles,
  Search, BookOpen, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

const Header = ({ darkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentUser = user?.data || user;
  const isLoggedIn = !!(user && (user.data || user._id || user.name || user.email));

  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'librarian';
  const isAdmin = currentUser?.role === 'admin';

  // PUBLIC NAVIGATION (when visitor is not authenticated)
  const publicNav = [
    { name: 'Home', path: '/' },
    { name: 'Catalog', path: '/books' },
    { name: 'Authors', path: '/authors' },
    { name: 'Categories', path: '/categories' },
    { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/library-info' },
    { name: 'Help', path: '/library-info' },
  ];

  // MAIN NAVIGATION FOR STAFF / LIBRARIAN / ADMIN
  const staffNav = [
    { name: 'Dashboard', path: isAdmin ? '/admin' : '/librarian' },
    { name: 'Books', path: isAdmin ? '/admin/books' : '/librarian/books' },
    { name: 'Members', path: isAdmin ? '/admin/users' : '/librarian/members' },
    { name: 'Circulation', path: isAdmin ? '/admin/circulation' : '/librarian/issue' },
    { name: 'Reservations', path: isAdmin ? '/admin/reservations' : '/librarian/reservations' },
    { name: 'Fines', path: isAdmin ? '/admin/fines' : '/librarian/fines' },
    { name: 'Reports', path: isAdmin ? '/admin/reports' : '/librarian/reports' },
  ];

  // MAIN NAVIGATION FOR MEMBERS / PATRONS (No admin exposure)
  const memberNav = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Books', path: '/books' },
    { name: 'My Loans', path: '/loans' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'Fines', path: '/fines' },
    { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/library-info' },
  ];

  const activeNavLinks = !isLoggedIn ? publicNav : isStaff ? staffNav : memberNav;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };
  const closeMenu = () => setMobileMenuOpen(false);

  const headerBg = isScrolled
    ? 'bg-[#fbf9f5]/90 dark:bg-[#090b11]/90 backdrop-blur-md border-slate-200/80 dark:border-white/[0.08] shadow-xs'
    : 'bg-[#fbf9f5]/60 dark:bg-[#090b11]/60 backdrop-blur-xs border-transparent';

  const logoTarget = !isLoggedIn ? '/' : isStaff ? (isAdmin ? '/admin' : '/librarian') : '/dashboard';

  return (
    <>
      <header className={`fixed top-0 z-[60] w-full border-b transition-all duration-300 ${headerBg}`}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo / Monogram */}
          <Link
            to={logoTarget}
            className="flex items-center gap-3.5 group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
              <Library className="w-5 h-5 text-amber-500 dark:text-amber-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-editorial text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Patel &amp; Co.
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
                Knowledge Center
              </span>
            </div>
          </Link>

          {/* Center Role-Aware Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-slate-200/60 dark:border-white/[0.06] text-xs font-semibold">
            {activeNavLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white dark:bg-[#111523] text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right-Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Catalog Search Trigger */}
            <Link
              to="/books"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all hover:border-slate-300 dark:hover:border-white/20"
              title="Search Catalog (⌘K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[11px] font-sans">Search...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 font-mono text-[9px]">
                ⌘K
              </kbd>
            </Link>

            {/* Design System Demo Link */}
            <Link
              to="/shadcn-demo"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-all"
              title="View Design System Components"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>UI Primitives</span>
            </Link>

            {/* Notifications */}
            {user && <NotificationCenter />}

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Auth Controls */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {(currentUser?.role === 'admin' || currentUser?.role === 'librarian') && (
                  <Link
                    to="/librarian"
                    className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-bold"
                  >
                    <BookOpen className="w-3 h-3" />
                    LIBRARIAN
                  </Link>
                )}

                {currentUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-mono font-bold"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    ADMIN
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-xl bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200/80 dark:border-white/[0.08]"
                >
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Profile"
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center">
                      {currentUser?.name ? currentUser.name[0].toUpperCase() : 'S'}
                    </div>
                  )}
                  <span className="text-xs font-semibold max-w-[90px] truncate hidden sm:inline text-slate-800 dark:text-slate-200">
                    {currentUser?.name?.split(' ')[0] || 'Scholar'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold rounded-xl transition-all hover:opacity-90 active:scale-95 flex items-center gap-1.5 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:flex px-3.5 py-2 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold rounded-xl transition-all"
                >
                  Enroll
                </Link>
              </div>
            )}

            {/* Navigation Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-200/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5"
              title="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Slide-Out Navigation Drawer ──────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[70] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[#fbf9f5] dark:bg-[#0c0f18] border-l border-slate-200 dark:border-white/10 shadow-2xl h-full overflow-y-auto flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center">
                      <Library className="w-4 h-4 text-amber-500 dark:text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-serif-editorial text-lg font-bold text-slate-900 dark:text-white leading-none">
                        Patel &amp; Co.
                      </h3>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">
                        Archival Navigation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info or Auth */}
                <div className="p-6 border-b border-slate-200 dark:border-white/10">
                  {isLoggedIn ? (
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#111523] border border-slate-200 dark:border-white/10 space-y-3">
                      <div className="flex items-center gap-3">
                        {currentUser?.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt="Profile"
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center">
                            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'S'}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {currentUser?.name || 'Scholar'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs font-mono">
                        <span className="text-slate-400">STATUS</span>
                        <span className="text-amber-600 dark:text-amber-400 uppercase font-bold">
                          {currentUser?.role || 'Active Member'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={closeMenu}
                        className="w-full py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={closeMenu}
                        className="w-full py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Enroll as Scholar
                      </Link>
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="p-6 space-y-6">
                  {/* Public Library Exploration */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-2 font-bold">
                      PUBLIC LIBRARY
                    </span>
                    {[
                      { name: 'Book Catalog', path: '/books' },
                      { name: 'Authors & Biographies', path: '/authors' },
                      { name: 'Subject Categories', path: '/categories' },
                      { name: 'Special Collections', path: '/collections' },
                      { name: 'Events & Lectures', path: '/events' },
                      { name: 'Library Information & Hours', path: '/library-info' },
                    ].map(item => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={closeMenu}
                        className={`block px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          location.pathname === item.path
                            ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/* Member Experience */}
                  {isLoggedIn && (
                    <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-white/10">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-2 font-bold">
                        MEMBER SERVICES
                      </span>
                      {[
                        { name: 'Scholar Home', path: '/main' },
                        { name: 'Member Dashboard', path: '/dashboard' },
                        { name: 'Current Active Loans', path: '/loans' },
                        { name: 'Borrowing History', path: '/history' },
                        { name: 'Holds & Reservations', path: '/reservations' },
                        { name: 'Fines & Account Ledger', path: '/fines' },
                        { name: 'Alerts & Notifications', path: '/notifications' },
                        { name: 'Patron Identity & Card', path: '/profile' },
                        { name: 'Folio Watchlist', path: '/watchlist' },
                      ].map(item => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={closeMenu}
                          className={`block px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            location.pathname === item.path
                              ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Staff Desks */}
                  {(currentUser?.role === 'admin' || currentUser?.role === 'librarian') && (
                    <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-white/10">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-2 font-bold">
                        STAFF &amp; ADMINISTRATION
                      </span>
                      <Link
                        to="/librarian"
                        onClick={closeMenu}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-all"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Librarian Desk Console</span>
                      </Link>
                      {currentUser?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={closeMenu}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Admin Command Console</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10 font-mono text-[10px] text-slate-400 text-center">
                PATEL &amp; CO. ARCHIVAL CATALOG &bull; V2.4
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
