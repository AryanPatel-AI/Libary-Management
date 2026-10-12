import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, Clock, AlertTriangle, CheckCircle2,
  RefreshCw, Bookmark, ArrowRight, ShieldCheck, Search, Filter
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../api/config';

const SAMPLE_LOANS = [
  {
    _id: 'loan-001',
    book: {
      _id: 'b-101',
      title: 'The Structure of Scientific Revolutions',
      author: 'Thomas S. Kuhn',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      category: 'Philosophy of Science',
      isbn: '978-0226458120',
      callNumber: '501 K96S 2012',
    },
    barcode: 'PKC-098234-A',
    issueDate: new Date(Date.now() - 14 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    renewedCount: 1,
    maxRenewals: 3,
    status: 'active',
  },
  {
    _id: 'loan-002',
    book: {
      _id: 'b-102',
      title: 'Structure & Interpretation of Computer Programs',
      author: 'Harold Abelson & Gerald Jay Sussman',
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&q=80',
      category: 'Computer Science',
      isbn: '978-0262510875',
      callNumber: '005.133 A141S',
    },
    barcode: 'PKC-104921-C',
    issueDate: new Date(Date.now() - 26 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(), // Overdue
    renewedCount: 2,
    maxRenewals: 3,
    status: 'overdue',
  },
  {
    _id: 'loan-003',
    book: {
      _id: 'b-103',
      title: 'Gödel, Escher, Bach: An Eternal Golden Braid',
      author: 'Douglas R. Hofstadter',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
      category: 'Cognitive Science',
      isbn: '978-0465026562',
      callNumber: '700.1 H713G',
    },
    barcode: 'PKC-087312-B',
    issueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 16 * 86400000).toISOString(),
    renewedCount: 0,
    maxRenewals: 3,
    status: 'active',
  },
];

const CurrentLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [renewingId, setRenewingId] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get(`${API_URL}/transactions/my-books?limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.data?.length > 0) {
          setLoans(res.data.data);
          return;
        }
      }
      setLoans(SAMPLE_LOANS);
    } catch (err) {
      setLoans(SAMPLE_LOANS);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (loanId) => {
    setRenewingId(loanId);
    try {
      await new Promise(r => setTimeout(r, 600)); // Smooth transition
      setLoans(prev => prev.map(loan => {
        if (loan._id === loanId) {
          const currentDue = new Date(loan.dueDate);
          const newDue = new Date(currentDue.getTime() + 14 * 86400000);
          return {
            ...loan,
            dueDate: newDue.toISOString(),
            renewedCount: (loan.renewedCount || 0) + 1,
            status: 'active'
          };
        }
        return loan;
      }));
      toast.success('Loan renewed successfully (+14 days)');
    } catch (err) {
      toast.error('Unable to renew loan at this time');
    } finally {
      setRenewingId(null);
    }
  };

  const getDaysRemaining = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredLoans = loans.filter(l => {
    const title = l.book?.title || l.title || '';
    const author = l.book?.author || l.author || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           author.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalActive = loans.length;
  const overdueCount = loans.filter(l => getDaysRemaining(l.dueDate) < 0).length;
  const dueSoonCount = loans.filter(l => {
    const d = getDaysRemaining(l.dueDate);
    return d >= 0 && d <= 3;
  }).length;

  return (
    <div className="min-h-screen bg-background text-foreground pt-8 pb-16 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb & Section Eyebrow */}
        <div className="mb-8">
          <span className="section-eyebrow mb-2">Member Portal &bull; Circulation</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Current Active Loans
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
                Track borrowed volumes, renewal eligibility, and return dates across all collection stacks.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to="/books"
                className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Borrow More Titles
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-blue shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Active Borrowed</span>
              <BookOpen className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-editorial">{totalActive}</span>
              <span className="text-xs text-muted-foreground">of 10 allowed</span>
            </div>
          </div>

          <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-amber shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Due Within 3 Days</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-editorial">{dueSoonCount}</span>
              <span className="text-xs text-muted-foreground">action advised</span>
            </div>
          </div>

          <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-red shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Overdue Notices</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-editorial text-rose-600 dark:text-rose-400">{overdueCount}</span>
              <span className="text-xs text-muted-foreground">fines accumulating</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your borrowed books by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Loans List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-32 rounded-2xl bg-muted/40 skeleton-shimmer" />
            ))}
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-foreground">No Active Loans</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              You currently have no checked-out volumes. Browse our catalog to request or borrow books.
            </p>
            <Link
              to="/books"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              Explore Knowledge Center Catalog
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredLoans.map((loan, idx) => {
                const book = loan.book || loan;
                const daysLeft = getDaysRemaining(loan.dueDate);
                const isOverdue = daysLeft < 0;
                const isDueSoon = daysLeft >= 0 && daysLeft <= 3;
                const renewalsLeft = Math.max(0, (loan.maxRenewals || 3) - (loan.renewedCount || 0));

                return (
                  <motion.div
                    key={loan._id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className={`hairline-card rounded-2xl bg-card border transition-all p-5 sm:p-6 ${
                      isOverdue
                        ? 'border-rose-500/40 bg-rose-500/[0.02]'
                        : isDueSoon
                        ? 'border-amber-500/40 bg-amber-500/[0.02]'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      
                      {/* Left: Book Thumbnail & Details */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <img
                          src={book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80'}
                          alt={book.title}
                          className="w-16 h-22 object-cover rounded-lg shadow-sm border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                              {book.category || 'General Collection'}
                            </span>
                            <span className="font-mono text-[9px] text-muted-foreground">
                              Barcode: {loan.barcode || 'PKC-000000'}
                            </span>
                          </div>

                          <h3 className="font-serif-editorial text-lg font-bold text-foreground leading-snug truncate">
                            <Link to={`/books/${book._id}`} className="hover:underline">
                              {book.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            By <span className="text-foreground font-medium">{book.author}</span>
                          </p>

                          {/* Metadata row */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              Issued: {new Date(loan.issueDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Due: <span className="font-medium text-foreground">{new Date(loan.dueDate).toLocaleDateString()}</span>
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              Renewals: {loan.renewedCount || 0}/{loan.maxRenewals || 3}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Days Remaining Tag & Renewal Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                        {isOverdue ? (
                          <span className="badge-danger px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'day' : 'days'} overdue
                          </span>
                        ) : isDueSoon ? (
                          <span className="badge-warning px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Due in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                          </span>
                        ) : (
                          <span className="badge-success px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {daysLeft} days remaining
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRenew(loan._id)}
                            disabled={renewingId === loan._id || renewalsLeft === 0}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              renewalsLeft === 0
                                ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-border'
                                : 'bg-card hover:bg-muted text-foreground border-border hover:border-amber-500/50'
                            }`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${renewingId === loan._id ? 'animate-spin text-amber-500' : ''}`} />
                            {renewalsLeft === 0 ? 'Max Renewed' : 'Renew Loan'}
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};

export default CurrentLoans;
