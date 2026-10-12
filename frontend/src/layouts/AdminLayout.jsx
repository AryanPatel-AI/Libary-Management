import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookMarked, Users, Scan, Clock, FileText,
  DollarSign, Package, Layers, PenLine, Building2, UserCog,
  ShieldCheck, Settings, ScrollText, ArrowLeftRight, ChevronLeft,
  Library, LogOut, Menu, X,
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

/* ── Navigation Groups ─────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { to: '/admin/circulation',  icon: Scan,            label: 'Circulation'  },
      { to: '/admin/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
      { to: '/admin/reservations', icon: Clock,           label: 'Reservations' },
      { to: '/admin/fines',        icon: DollarSign,      label: 'Fines'        },
      { to: '/admin/inventory',    icon: Package,         label: 'Inventory'    },
    ],
  },
  {
    label: 'CATALOG',
    items: [
      { to: '/admin/books',      icon: BookMarked, label: 'Books'      },
      { to: '/admin/categories', icon: Layers,     label: 'Categories' },
      { to: '/admin/authors',    icon: PenLine,    label: 'Authors'    },
      { to: '/admin/publishers', icon: Building2,  label: 'Publishers' },
    ],
  },
  {
    label: 'PEOPLE',
    items: [
      { to: '/admin/users', icon: Users,    label: 'Members' },
      { to: '/admin/staff', icon: UserCog,  label: 'Staff'   },
      { to: '/admin/roles', icon: ShieldCheck, label: 'Roles' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/admin/reports',  icon: FileText,   label: 'Reports'    },
      { to: '/admin/settings', icon: Settings,   label: 'Settings'   },
      { to: '/admin/logs',     icon: ScrollText, label: 'Audit Logs' },
    ],
  },
];

const COLLAPSED_KEY = 'lms_admin_sidebar_collapsed';

/* ── Shared Sidebar Content ────────────────────────────────────────── */
const SidebarContent = ({ collapsed, forMobile = false, onNavClick, onLogout, currentUser }) => (
  <div className="flex flex-col h-full overflow-hidden">

    {/* Brand */}
    <div className={`flex items-center gap-3 px-4 h-14 border-b border-border shrink-0 ${collapsed && !forMobile ? 'justify-center px-0' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-foreground dark:bg-white flex items-center justify-center shrink-0">
        <Library className="w-4 h-4 text-amber-500" />
      </div>
      {(!collapsed || forMobile) && (
        <div className="overflow-hidden">
          <p className="font-serif-editorial text-[13px] font-bold text-foreground leading-tight whitespace-nowrap">
            Admin Console
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            Patel &amp; Co.
          </p>
        </div>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.label} className={gi > 0 ? 'mt-1' : ''}>
          {/* Group separator / label */}
          {collapsed && !forMobile ? (
            <div className="h-px bg-border mx-3 my-2" />
          ) : (
            <p className="px-4 pt-3 pb-1 font-mono text-[9px] tracking-widest text-muted-foreground/60">
              {group.label}
            </p>
          )}

          {group.items.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavClick}
              title={collapsed && !forMobile ? label : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 mx-2 rounded-lg transition-all duration-150 text-[13px] font-medium',
                  collapsed && !forMobile ? 'justify-center p-2.5' : 'px-3 py-2',
                  isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
                  {(!collapsed || forMobile) && (
                    <span className="truncate">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>

    {/* User Footer */}
    <div className={`border-t border-border p-3 shrink-0 ${collapsed && !forMobile ? 'flex justify-center' : ''}`}>
      {(!collapsed || forMobile) ? (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 uppercase">
            {(currentUser?.name || 'A').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{currentUser?.name || 'Admin'}</p>
            <p className="text-[10px] text-muted-foreground capitalize truncate">{currentUser?.role || 'Administrator'}</p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={onLogout}
          title="Sign out"
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

/* ── Admin Layout ──────────────────────────────────────────────────── */
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem(COLLAPSED_KEY) === 'true'
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const currentUser = user?.data || user;

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex bg-background" style={{ minHeight: 'calc(100vh - var(--header-height, 80px))', marginTop: 'var(--header-height, 80px)' }}>

      {/* ── Mobile overlay ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: -272 }}
            animate={{ x: 0 }}
            exit={{ x: -272 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 bottom-0 left-0 z-[60] w-64 bg-card border-r border-border flex flex-col lg:hidden shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-end h-12 px-4 border-b border-border">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarContent
                collapsed={false}
                forMobile
                onNavClick={() => setMobileOpen(false)}
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 224 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col sticky self-start top-0 bg-card border-r border-border overflow-hidden shrink-0"
        style={{ height: 'calc(100vh - var(--header-height, 80px))' }}
      >
        <SidebarContent
          collapsed={collapsed}
          onNavClick={undefined}
          onLogout={handleLogout}
          currentUser={currentUser}
        />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-[3.25rem] -right-3 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/60 hover:shadow-md transition-all z-50"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="w-3 h-3" />
          </motion.div>
        </button>
      </motion.aside>

      {/* ── Mobile FAB ──────────────────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 left-4 z-30 w-12 h-12 rounded-full bg-foreground text-background shadow-xl flex items-center justify-center lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Page content ────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-5 lg:p-8">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default AdminLayout;
