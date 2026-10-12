import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle2, AlertTriangle, Search, Filter,
  MapPin, Check, ArrowRight, UserCheck, RefreshCw, Archive
} from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_RESERVATIONS = [
  {
    id: 'res-001',
    bookTitle: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    barcode: 'PKC-039120-B',
    callNumber: '823.92 I79K',
    patronName: 'Julian Sterling',
    patronCard: 'PKC-MBR-849204',
    status: 'ready_pickup',
    shelfBin: 'Front Desk Bin A-04',
    readySince: '2026-06-14',
    expiresAt: '2026-06-19',
    queuePosition: 1,
  },
  {
    id: 'res-002',
    bookTitle: 'The Design of Everyday Things',
    author: 'Don Norman',
    barcode: 'PKC-011293-A',
    callNumber: '745.2 N842D',
    patronName: 'Maya Lin',
    patronCard: 'PKC-MBR-309112',
    status: 'ready_pickup',
    shelfBin: 'Front Desk Bin B-11',
    readySince: '2026-06-15',
    expiresAt: '2026-06-20',
    queuePosition: 1,
  },
  {
    id: 'res-003',
    bookTitle: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    barcode: 'PKC-084923-D',
    callNumber: '005.74 K64D',
    patronName: 'Elena Rostova',
    patronCard: 'PKC-MBR-554210',
    status: 'pull_from_stacks',
    shelfBin: 'Wing B &bull; 3rd Floor &bull; Stack 5-A',
    readySince: 'Pending Stacks Pull',
    expiresAt: null,
    queuePosition: 1,
  },
  {
    id: 'res-004',
    bookTitle: 'The Order of Time',
    author: 'Carlo Rovelli',
    barcode: 'PKC-029410-C',
    callNumber: '530.11 R875O',
    patronName: 'Marcus Vance',
    patronCard: 'PKC-MBR-192834',
    status: 'expired',
    shelfBin: 'Front Desk Bin A-02',
    readySince: '2026-06-08',
    expiresAt: '2026-06-13',
    queuePosition: 1,
  },
];

const LibrarianReservations = () => {
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState('all');

  const handleMarkPulled = (resId, title) => {
    const bin = `Front Desk Bin C-${Math.floor(10 + Math.random() * 89)}`;
    setReservations(prev => prev.map(r => {
      if (r.id === resId) {
        return {
          ...r,
          status: 'ready_pickup',
          shelfBin: bin,
          readySince: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        };
      }
      return r;
    }));
    toast.success(`"${title}" marked as pulled! Placed in ${bin}`);
  };

  const handleCompletePickup = (resId, title, patron) => {
    setReservations(prev => prev.filter(r => r.id !== resId));
    toast.success(`Hold completed! "${title}" issued to ${patron}`);
  };

  const handleReshelveExpired = (resId, title) => {
    setReservations(prev => prev.filter(r => r.id !== resId));
    toast.info(`Hold expired: "${title}" returned to circulation stacks`);
  };

  const filtered = reservations.filter(r => {
    const matchesSearch = r.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.patronName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.patronCard.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = tabFilter === 'all' || r.status === tabFilter;
    return matchesSearch && matchesTab;
  });

  const pullCount = reservations.filter(r => r.status === 'pull_from_stacks').length;
  const readyCount = reservations.filter(r => r.status === 'ready_pickup').length;
  const expiredCount = reservations.filter(r => r.status === 'expired').length;

  return (
    <div className="space-y-8 font-sans">
      
      {/* Eyebrow & Title */}
      <div>
        <span className="section-eyebrow mb-1.5">Librarian Desk &bull; Holds Fulfillment</span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-editorial text-3xl font-bold text-foreground tracking-tight">
              Reservation &amp; Hold Fulfillment
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Pull returned requests from stacks, manage front-desk hold bins, and process patron pickups.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-amber shadow-xs">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Awaiting Stacks Pull</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif-editorial text-amber-600 dark:text-amber-400">{pullCount}</span>
            <span className="text-xs text-muted-foreground">needs pulling today</span>
          </div>
        </div>

        <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-green shadow-xs">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">On Front Desk Bins</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif-editorial text-emerald-600 dark:text-emerald-400">{readyCount}</span>
            <span className="text-xs text-muted-foreground">awaiting patron collection</span>
          </div>
        </div>

        <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-red shadow-xs">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Expired Holds</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif-editorial text-rose-600 dark:text-rose-400">{expiredCount}</span>
            <span className="text-xs text-muted-foreground">ready for reshelving</span>
          </div>
        </div>
      </div>

      {/* Controls / Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search hold by book, patron name, or card ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: 'all', label: `All (${reservations.length})` },
            { key: 'pull_from_stacks', label: `To Pull (${pullCount})` },
            { key: 'ready_pickup', label: `Ready Bin (${readyCount})` },
            { key: 'expired', label: `Expired (${expiredCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setTabFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                tabFilter === tab.key
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Holds Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="th-cell">Book Title &amp; Call Number</th>
                <th className="th-cell">Requesting Patron</th>
                <th className="th-cell">Hold Shelf / Bin</th>
                <th className="th-cell">Expiry Window</th>
                <th className="th-cell">Status</th>
                <th className="th-cell text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    No reservations matching current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((res, idx) => (
                  <tr key={res.id} className="tr-hover">
                    <td className="td-cell">
                      <p className="font-serif-editorial font-bold text-sm text-foreground">
                        {res.bookTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {res.author} &bull; <span className="font-mono text-[10px]">{res.callNumber}</span>
                      </p>
                    </td>

                    <td className="td-cell">
                      <p className="font-semibold text-xs text-foreground">{res.patronName}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">{res.patronCard}</span>
                    </td>

                    <td className="td-cell">
                      <span className="font-mono text-xs text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border"
                            dangerouslySetInnerHTML={{ __html: res.shelfBin }}
                      />
                    </td>

                    <td className="td-cell font-mono text-xs text-muted-foreground">
                      {res.expiresAt ? `Expires ${res.expiresAt}` : 'Immediate'}
                    </td>

                    <td className="td-cell">
                      {res.status === 'pull_from_stacks' && (
                        <span className="badge-warning px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          Needs Pulling
                        </span>
                      )}
                      {res.status === 'ready_pickup' && (
                        <span className="badge-success px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          In Hold Bin
                        </span>
                      )}
                      {res.status === 'expired' && (
                        <span className="badge-danger px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          Expired Hold
                        </span>
                      )}
                    </td>

                    <td className="td-cell text-right">
                      {res.status === 'pull_from_stacks' && (
                        <button
                          onClick={() => handleMarkPulled(res.id, res.bookTitle)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark Pulled
                        </button>
                      )}
                      {res.status === 'ready_pickup' && (
                        <button
                          onClick={() => handleCompletePickup(res.id, res.bookTitle, res.patronName)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Issue to Patron
                        </button>
                      )}
                      {res.status === 'expired' && (
                        <button
                          onClick={() => handleReshelveExpired(res.id, res.bookTitle)}
                          className="px-3 py-1 bg-muted hover:bg-border text-foreground text-xs font-medium rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Return to Stacks
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default LibrarianReservations;
