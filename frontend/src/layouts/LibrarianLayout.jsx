import React, { useContext } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Copy, Users, ArrowUpRight,
  RotateCcw, Clock, DollarSign, Activity, FileText, Library,
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/librarian',              icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/librarian/books',        icon: BookOpen,        label: 'Books'                   },
  { to: '/librarian/copies',       icon: Copy,            label: 'Copies'                  },
  { to: '/librarian/members',      icon: Users,           label: 'Members'                 },
  { to: '/librarian/issue',        icon: ArrowUpRight,    label: 'Issue'                   },
  { to: '/librarian/return',       icon: RotateCcw,       label: 'Return'                  },
  { to: '/librarian/reservations', icon: Clock,           label: 'Reservations'            },
  { to: '/librarian/fines',        icon: DollarSign,      label: 'Fines'                   },
  { to: '/librarian/activity',     icon: Activity,        label: 'Activity'                },
  { to: '/librarian/reports',      icon: FileText,        label: 'Reports'                 },
];

const LibrarianLayout = () => {
  const { user } = useContext(AuthContext);
  const currentUser = user?.data || user;

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-height, 80px)' }}>

      {/* ── Secondary horizontal nav ──────────────────────────────── */}
      <div className="sticky top-20 z-40 bg-[#fbf9f5]/96 dark:bg-[#090b11]/96 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-11 gap-0.5 overflow-x-auto scrollbar-none">

            {/* Role badge */}
            <div className="flex items-center gap-1.5 pr-4 mr-2 border-r border-border shrink-0">
              <Library className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {currentUser?.role === 'admin' ? 'Admin' : 'Librarian'}
              </span>
            </div>

            {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pt-6 pb-12">
        <Outlet />
      </div>

    </div>
  );
};

export default LibrarianLayout;
