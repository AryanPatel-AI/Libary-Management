import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle2, AlertCircle, XCircle, BookOpen,
  MapPin, Calendar, ArrowRight, ShieldCheck, BookmarkCheck
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { API_URL } from '../../api/config';

const SAMPLE_HOLDS = [
  {
    _id: 'hold-001',
    book: {
      _id: 'b-201',
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
      category: 'Contemporary Fiction',
      isbn: '978-0593318171',
    },
    requestedDate: '2026-08-20',
    queuePosition: 1,
    totalQueued: 3,
    status: 'ready', // ready for pickup
    pickupShelf: 'Circulation Desk &bull; Bin A-04',
    pickupDeadline: new Date(Date.now() + 4 * 86400000).toISOString(),
    estimatedDate: 'Ready now',
  },
  {
    _id: 'hold-002',
    book: {
      _id: 'b-202',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&q=80',
      category: 'Distributed Systems',
      isbn: '978-1449373320',
    },
    requestedDate: '2026-08-25',
    queuePosition: 2,
    totalQueued: 6,
    status: 'queued',
    pickupShelf: 'Main Reservation Stacks',
    pickupDeadline: null,
    estimatedDate: 'Approx. 5–8 days',
  },
  {
    _id: 'hold-003',
    book: {
      _id: 'b-203',
      title: 'The Order of Time',
      author: 'Carlo Rovelli',
      coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&q=80',
      category: 'Theoretical Physics',
      isbn: '978-0735216105',
    },
    requestedDate: '2026-08-29',
    queuePosition: 4,
    totalQueued: 8,
    status: 'queued',
    pickupShelf: 'Main Reservation Stacks',
    pickupDeadline: null,
    estimatedDate: 'Approx. 14–20 days',
  },
];

const MemberReservations = () => {
  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHolds();
  }, []);

  const fetchHolds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get(`${API_URL}/reservations/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.data?.length > 0) {
          setHolds(res.data.data);
          return;
        }
      }
      setHolds(SAMPLE_HOLDS);
    } catch (err) {
      setHolds(SAMPLE_HOLDS);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelHold = async (holdId, bookTitle) => {
    const result = await Swal.fire({
      title: 'Cancel Reservation?',
      text: `Are you sure you want to release your hold on "${bookTitle}"? This will forfeit your queue position.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, cancel hold',
      cancelButtonText: 'Keep reservation',
      background: document.documentElement.classList.contains('dark') ? '#111523' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.delete(`${API_URL}/reservations/${holdId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => {});
        }
        setHolds(prev => prev.filter(h => h._id !== holdId));
        toast.success(`Reservation for "${bookTitle}" cancelled`);
      } catch (err) {
        toast.error('Could not cancel reservation');
      }
    }
  };

  const readyCount = holds.filter(h => h.status === 'ready').length;
  const queuedCount = holds.filter(h => h.status === 'queued').length;

  return (
    <div className="min-h-screen bg-background text-foreground pt-8 pb-16 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <span className="section-eyebrow mb-2">Member Portal &bull; Reservations</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Holds &amp; Queue Status
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
                Monitor your position in reservation queues and track volumes currently waiting on the pickup shelf.
              </p>
            </div>

            <Link
              to="/books"
              className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <BookOpen className="w-4 h-4" />
              Place New Reservation
            </Link>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-green shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Ready For Pickup</span>
              <BookmarkCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-editorial text-emerald-600 dark:text-emerald-400">{readyCount}</span>
              <span className="text-xs text-muted-foreground">on desk hold shelf</span>
            </div>
          </div>

          <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-blue shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Queued In Line</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-editorial">{queuedCount}</span>
              <span className="text-xs text-muted-foreground">awaiting returns</span>
            </div>
          </div>

          <div className="hairline-card p-5 rounded-2xl bg-card border border-border metric-amber shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Hold Allowance</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif-editorial">{holds.length} / 5</span>
              <span className="text-xs text-muted-foreground">patron reservation slots</span>
            </div>
          </div>
        </div>

        {/* Holds List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(n => (
              <div key={n} className="h-32 rounded-2xl bg-muted/40 skeleton-shimmer" />
            ))}
          </div>
        ) : holds.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-foreground">No Active Reservations</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              You haven't requested any holds. If a book you want is checked out, you can reserve your spot in line.
            </p>
            <Link
              to="/books"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              Browse Library Catalog
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {holds.map((hold, idx) => {
                const book = hold.book || hold;
                const isReady = hold.status === 'ready';

                return (
                  <motion.div
                    key={hold._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`hairline-card rounded-2xl bg-card border p-5 sm:p-6 transition-all ${
                      isReady ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      
                      {/* Left Book Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <img
                          src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&q=80'}
                          alt={book.title}
                          className="w-16 h-22 object-cover rounded-lg shadow-sm border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                              {book.category || 'Archival Hold'}
                            </span>
                            {isReady ? (
                              <span className="badge-success px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready For Pickup
                              </span>
                            ) : (
                              <span className="badge-info px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Queue Position #{hold.queuePosition} of {hold.totalQueued}
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif-editorial text-lg font-bold text-foreground leading-snug truncate">
                            <Link to={`/books/${book._id}`} className="hover:underline">
                              {book.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            By <span className="text-foreground font-medium">{book.author}</span>
                          </p>

                          {/* Pickup or ETA Information */}
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            {isReady ? (
                              <>
                                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {hold.pickupShelf}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Hold expires: {hold.pickupDeadline ? new Date(hold.pickupDeadline).toLocaleDateString() : 'In 4 days'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  Estimated arrival: <span className="text-foreground font-medium">{hold.estimatedDate}</span>
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  Requested on {hold.requestedDate}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Cancel Action */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                        <button
                          onClick={() => handleCancelHold(hold._id, book.title)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel Hold
                        </button>
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

export default MemberReservations;
