import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Clock, BookmarkCheck, AlertTriangle, Info,
  CheckCircle2, Check, Trash2, Filter, Settings, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-001',
    category: 'hold_ready',
    title: 'Your Hold is Ready for Collection',
    message: 'Klara and the Sun by Kazuo Ishiguro has arrived from Central Storage and is waiting at Circulation Desk Bin A-04 until Friday.',
    timestamp: '2 hours ago',
    unread: true,
    actionUrl: '/reservations',
    actionLabel: 'View Hold Details',
  },
  {
    id: 'notif-002',
    category: 'due_soon',
    title: 'Courtesy Notice: Book Due in 2 Days',
    message: 'The Structure of Scientific Revolutions is due on June 18. You can renew this title online if no other patrons are waiting.',
    timestamp: 'Yesterday at 09:30 AM',
    unread: true,
    actionUrl: '/loans',
    actionLabel: 'Renew Online',
  },
  {
    id: 'notif-003',
    category: 'overdue',
    title: 'Overdue Folio Notice & Penalty Warning',
    message: 'Structure & Interpretation of Computer Programs is 2 days past due. Daily late assessment of $1.00/day is accumulating.',
    timestamp: '3 days ago',
    unread: false,
    actionUrl: '/fines',
    actionLabel: 'Review Account',
  },
  {
    id: 'notif-004',
    category: 'announcement',
    title: 'Special Archive Exhibit: Rare Cartography',
    message: 'The Patel & Co. Special Collections room will be displaying 16th-century Venetian sea charts this Saturday at 2:00 PM.',
    timestamp: '5 days ago',
    unread: false,
    actionUrl: '/events',
    actionLabel: 'View Event',
  },
  {
    id: 'notif-005',
    category: 'system',
    title: 'Annual Library System Maintenance',
    message: 'Digital catalog search will be operating in read-only mode this Sunday from 02:00 to 04:00 AM UTC for database indexing.',
    timestamp: '1 week ago',
    unread: false,
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.info('Notification dismissed');
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return n.unread;
    return n.category === filter;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'hold_ready':
        return <BookmarkCheck className="w-4 h-4 text-emerald-500" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'announcement':
        return <Bell className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-8 pb-16 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Section Header */}
        <div className="mb-8">
          <span className="section-eyebrow mb-2">Member Portal &bull; Dispatch</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Notifications &amp; Alerts
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
                Real-time communications regarding loan deadlines, hold arrivals, and institutional notices.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold rounded-xl transition-all flex items-center gap-2 self-start md:self-auto shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Mark All as Read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {[
            { key: 'all', label: 'All Alerts' },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'hold_ready', label: 'Hold Ready' },
            { key: 'due_soon', label: 'Due Soon' },
            { key: 'overdue', label: 'Overdue Notices' },
            { key: 'announcement', label: 'Announcements' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification Stream */}
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-foreground">Inbox is Clear</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              No notifications matching this filter. We will notify you when books are ready or deadlines approach.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifs.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`hairline-card rounded-2xl bg-card border p-4 sm:p-5 transition-all ${
                    item.unread
                      ? 'border-amber-500/40 bg-amber-500/[0.015]'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif-editorial font-bold text-base text-foreground">
                            {item.title}
                          </h4>
                          {item.unread && (
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-border/60">
                        {item.actionUrl ? (
                          <a
                            href={item.actionUrl}
                            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                          >
                            {item.actionLabel || 'View Details'} &rarr;
                          </a>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRead(item.id)}
                            className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
                          >
                            {item.unread ? 'Mark Read' : 'Mark Unread'}
                          </button>
                          <button
                            onClick={() => deleteNotification(item.id)}
                            className="p-1 text-muted-foreground hover:text-rose-500 rounded hover:bg-muted transition-colors"
                            title="Dismiss"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};

export default Notifications;
