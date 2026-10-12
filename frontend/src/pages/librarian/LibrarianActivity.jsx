import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowUpRight, RotateCcw, Clock, DollarSign,
  ShieldAlert, Filter, Search, User, CheckCircle2, Download
} from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_LOGS = [
  {
    id: 'log-001',
    type: 'checkout',
    librarian: 'JS (Desk 1)',
    patronName: 'Julian Sterling',
    patronCard: 'PKC-MBR-849204',
    itemTitle: 'The Structure of Scientific Revolutions',
    barcode: 'PKC-098234-A',
    timestamp: '10:42 AM',
    date: 'Today',
    details: 'Loan due July 12, 2026',
  },
  {
    id: 'log-002',
    type: 'checkin',
    librarian: 'EV (Desk 2)',
    patronName: 'Marcus Vance',
    patronCard: 'PKC-MBR-192834',
    itemTitle: 'Structure & Interpretation of Computer Programs',
    barcode: 'PKC-104921-C',
    timestamp: '10:15 AM',
    date: 'Today',
    details: 'Returned late (3 days) &bull; $3.00 fine assessed',
  },
  {
    id: 'log-003',
    type: 'payment',
    librarian: 'JS (Desk 1)',
    patronName: 'Marcus Vance',
    patronCard: 'PKC-MBR-192834',
    itemTitle: 'Settlement Receipt #RCP-491024',
    barcode: 'FEE-SETTLE',
    timestamp: '10:18 AM',
    date: 'Today',
    details: 'Paid $3.00 via Cash Tender',
  },
  {
    id: 'log-004',
    type: 'hold',
    librarian: 'AL (Archivist)',
    patronName: 'Elena Rostova',
    patronCard: 'PKC-MBR-554210',
    itemTitle: 'Klara and the Sun',
    barcode: 'PKC-039120-B',
    timestamp: '09:50 AM',
    date: 'Today',
    details: 'Pulled from Stacks 4 &bull; Placed in Hold Bin A-04',
  },
  {
    id: 'log-005',
    type: 'waiver',
    librarian: 'AP (Chief)',
    patronName: 'Julian Sterling',
    patronCard: 'PKC-MBR-849204',
    itemTitle: 'Modern Operating Systems',
    barcode: 'PKC-033109-A',
    timestamp: 'Yesterday 04:30 PM',
    date: 'Yesterday',
    details: 'Waived $8.50 repair fee (Policy: First-time courtesy)',
  },
  {
    id: 'log-006',
    type: 'checkout',
    librarian: 'EV (Desk 2)',
    patronName: 'Maya Lin',
    patronCard: 'PKC-MBR-309112',
    itemTitle: 'The Design of Everyday Things',
    barcode: 'PKC-011293-A',
    timestamp: 'Yesterday 02:15 PM',
    date: 'Yesterday',
    details: 'Loan due July 11, 2026',
  },
];

const LibrarianActivity = () => {
  const [logs] = useState(INITIAL_LOGS);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filterType === 'all' || log.type === filterType;
    const matchesSearch = log.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.patronName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.librarian.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionBadge = (type) => {
    switch (type) {
      case 'checkout':
        return (
          <span className="badge-info px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Issue Checkout
          </span>
        );
      case 'checkin':
        return (
          <span className="badge-success px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Check-In Return
          </span>
        );
      case 'hold':
        return (
          <span className="badge-warning px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Hold Fulfilled
          </span>
        );
      case 'payment':
        return (
          <span className="badge-success px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Fee Paid
          </span>
        );
      case 'waiver':
        return (
          <span className="badge-neutral px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-500" /> Fee Waived
          </span>
        );
      default:
        return null;
    }
  };

  const handleExport = () => {
    toast.success('Desk shift log downloaded as CSV');
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Eyebrow & Title */}
      <div>
        <span className="section-eyebrow mb-1.5">Librarian Desk &bull; Audit Trail</span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-editorial text-3xl font-bold text-foreground tracking-tight">
              Desk Circulation Activity Feed
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Live chronological stream of staff checkouts, volume returns, hold shelf movements, and fee transactions.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            Export Audit Log
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, patron, barcode, or staff initials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {[
            { key: 'all', label: 'All Operations' },
            { key: 'checkout', label: 'Checkouts' },
            { key: 'checkin', label: 'Returns' },
            { key: 'hold', label: 'Holds' },
            { key: 'payment', label: 'Payments' },
            { key: 'waiver', label: 'Waivers' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterType === f.key
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="divide-y divide-border">
          {filteredLogs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="p-4 sm:p-5 tr-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border">
                  <Activity className="w-4 h-4 text-amber-500" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getActionBadge(log.type)}
                    <span className="font-mono text-xs font-bold text-foreground">
                      {log.itemTitle}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                      {log.barcode}
                    </span>
                  </div>

                  <p
                    className="text-xs text-muted-foreground mt-1"
                    dangerouslySetInnerHTML={{ __html: log.details }}
                  />

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>Patron: <strong className="text-foreground">{log.patronName}</strong> ({log.patronCard})</span>
                    <span>&bull;</span>
                    <span>Librarian: <strong className="text-foreground">{log.librarian}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="font-mono text-xs font-semibold text-foreground">
                  {log.timestamp}
                </span>
                <p className="text-[10px] text-muted-foreground">{log.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LibrarianActivity;
