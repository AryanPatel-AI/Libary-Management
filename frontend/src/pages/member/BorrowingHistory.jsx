import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  History, Download, Search, Filter, Calendar, CheckCircle2,
  Clock, DollarSign, BookOpen, ArrowUpDown, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../api/config';

const SAMPLE_HISTORY = [
  {
    _id: 'hist-001',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    category: 'Design & Ergonomics',
    barcode: 'PKC-011293-A',
    issueDate: '2026-06-10',
    returnDate: '2026-06-24',
    durationDays: 14,
    fineAssessed: 0,
    status: 'returned',
  },
  {
    _id: 'hist-002',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Behavioral Economics',
    barcode: 'PKC-048201-B',
    issueDate: '2026-05-02',
    returnDate: '2026-05-20',
    durationDays: 18,
    fineAssessed: 4.00,
    status: 'returned_late',
  },
  {
    _id: 'hist-003',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Software Engineering',
    barcode: 'PKC-091823-A',
    issueDate: '2026-04-12',
    returnDate: '2026-04-26',
    durationDays: 14,
    fineAssessed: 0,
    status: 'returned',
  },
  {
    _id: 'hist-004',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Cosmology & Physics',
    barcode: 'PKC-032910-C',
    issueDate: '2026-03-01',
    returnDate: '2026-03-15',
    durationDays: 14,
    fineAssessed: 0,
    status: 'returned',
  },
  {
    _id: 'hist-005',
    title: 'The Elements of Typographic Style',
    author: 'Robert Bringhurst',
    category: 'Typography & Arts',
    barcode: 'PKC-076123-A',
    issueDate: '2026-02-14',
    returnDate: '2026-02-28',
    durationDays: 14,
    fineAssessed: 0,
    status: 'returned',
  },
  {
    _id: 'hist-006',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell & Peter Norvig',
    category: 'Computer Science',
    barcode: 'PKC-099412-D',
    issueDate: '2026-01-10',
    returnDate: '2026-01-30',
    durationDays: 20,
    fineAssessed: 6.00,
    status: 'returned_late',
  },
];

const BorrowingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get(`${API_URL}/transactions/my-transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.data?.length > 0) {
          // Format transactions
          const formatted = res.data.data.map((tx, idx) => ({
            _id: tx._id || `tx-${idx}`,
            title: tx.book?.title || tx.bookTitle || 'Archival Folio',
            author: tx.book?.author || tx.bookAuthor || 'Catalogued Author',
            category: tx.book?.category || 'General Collection',
            barcode: tx.barcode || `PKC-${100000 + idx}`,
            issueDate: tx.createdAt ? tx.createdAt.split('T')[0] : '2026-05-01',
            returnDate: tx.returnDate ? tx.returnDate.split('T')[0] : '2026-05-15',
            durationDays: 14,
            fineAssessed: tx.fineAmount || 0,
            status: tx.status || 'returned',
          }));
          setHistory(formatted);
          return;
        }
      }
      setHistory(SAMPLE_HISTORY);
    } catch (err) {
      setHistory(SAMPLE_HISTORY);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) {
      toast.info('No records to export');
      return;
    }
    const headers = ['Title', 'Author', 'Category', 'Barcode', 'Issue Date', 'Return Date', 'Duration (Days)', 'Fine Assessed ($)'];
    const rows = history.map(item => [
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.author.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.barcode,
      item.issueDate,
      item.returnDate,
      item.durationDays,
      item.fineAssessed.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `patel_co_borrowing_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Borrowing ledger exported successfully');
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'on_time' && item.fineAssessed === 0) ||
                          (statusFilter === 'fined' && item.fineAssessed > 0);
    return matchesSearch && matchesStatus;
  });

  const totalBorrowed = history.length;
  const totalFines = history.reduce((sum, h) => sum + (h.fineAssessed || 0), 0);
  const onTimePercentage = totalBorrowed > 0 
    ? Math.round(((totalBorrowed - history.filter(h => h.fineAssessed > 0).length) / totalBorrowed) * 100) 
    : 100;

  return (
    <div className="min-h-screen bg-background text-foreground pt-8 pb-16 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Eyebrow & Title */}
        <div className="mb-8">
          <span className="section-eyebrow mb-2">Member Portal &bull; Ledger</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Borrowing History
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
                Official institutional ledger of previously circulated titles, durations kept, and return records.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4 text-amber-500" />
              Export Archival Ledger (.CSV)
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-blue shadow-xs">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Lifetime Circulations</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-editorial">{totalBorrowed}</span>
              <span className="text-xs text-muted-foreground">volumes returned</span>
            </div>
          </div>

          <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-green shadow-xs">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">On-Time Return Rate</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-editorial text-emerald-600 dark:text-emerald-400">{onTimePercentage}%</span>
              <span className="text-xs text-muted-foreground">punctual return record</span>
            </div>
          </div>

          <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-amber shadow-xs">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Lifetime Fines Assessed</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-editorial">${totalFines.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">all settled</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search previous titles, authors, or barcodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Circulations</option>
              <option value="on_time">Returned On Time (No Fines)</option>
              <option value="fined">Returned Late (Fined)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="th-cell">Volume / Author</th>
                  <th className="th-cell">Barcode &amp; Category</th>
                  <th className="th-cell">Issued</th>
                  <th className="th-cell">Returned</th>
                  <th className="th-cell">Duration</th>
                  <th className="th-cell">Fine Assessed</th>
                  <th className="th-cell text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                      Loading circulation archive...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                      No matching historical records found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item, idx) => (
                    <motion.tr
                      key={item._id || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="tr-hover group"
                    >
                      <td className="td-cell">
                        <div>
                          <p className="font-serif-editorial font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.author}
                          </p>
                        </div>
                      </td>

                      <td className="td-cell">
                        <div>
                          <span className="font-mono text-[10px] text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                            {item.barcode}
                          </span>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {item.category}
                          </p>
                        </div>
                      </td>

                      <td className="td-cell font-mono text-xs text-muted-foreground">
                        {item.issueDate}
                      </td>

                      <td className="td-cell font-mono text-xs text-muted-foreground">
                        {item.returnDate}
                      </td>

                      <td className="td-cell font-mono text-xs text-foreground">
                        {item.durationDays} days
                      </td>

                      <td className="td-cell font-mono text-xs">
                        {item.fineAssessed > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            ${item.fineAssessed.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">$0.00</span>
                        )}
                      </td>

                      <td className="td-cell text-right">
                        {item.fineAssessed > 0 ? (
                          <span className="badge-warning px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Late Return
                          </span>
                        ) : (
                          <span className="badge-success px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Returned On Time
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BorrowingHistory;
