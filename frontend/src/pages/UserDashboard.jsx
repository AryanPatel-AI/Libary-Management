import React, { useState, useEffect } from 'react';
import API_URL from '../api/config';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Star, 
  Package, 
  AlertCircle, 
  RefreshCw, 
  Bookmark, 
  DollarSign, 
  Check, 
  X,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AIRecommendations from '../components/AIRecommendations';

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [fines, setFines] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [renewingId, setRenewingId] = useState(null);
  const [payingFineId, setPayingFineId] = useState(null);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const config = getAuthConfig();

      const [txRes, watchRes, resRes, finesRes] = await Promise.all([
        axios.get(`${API_URL}/transactions/my-books?limit=100`, config).catch(() => ({ data: { data: {} } })),
        axios.get(`${API_URL}/watchlist`, config).catch(() => ({ data: { data: {} } })),
        axios.get(`${API_URL}/reservations/my`, config).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/fines/my-fines`, config).catch(() => ({ data: { data: [] } }))
      ]);

      setTransactions(txRes.data.data?.transactions || []);
      setWatchlist(watchRes.data.data?.books || []);
      setReservations(resRes.data.data || []);
      setFines(finesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewLoan = async (transactionId) => {
    try {
      setRenewingId(transactionId);
      const res = await axios.post(`${API_URL}/circulation/${transactionId}/renew`, {}, getAuthConfig());
      toast.success(res.data.message || 'Loan renewed successfully!');
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Renewal not permitted by library policy');
    } finally {
      setRenewingId(null);
    }
  };

  const handleCancelReservation = async (reservationId, title) => {
    const result = await Swal.fire({
      title: 'Cancel Reservation?',
      text: `Remove hold request for "${title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Hold',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/reservations/${reservationId}`, getAuthConfig());
        toast.success('Reservation cancelled');
        await fetchDashboardData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel reservation');
      }
    }
  };

  const handlePayFine = async (fineId, amount) => {
    const result = await Swal.fire({
      title: 'Pay Library Fine',
      text: `Pay outstanding fine of ₹${amount}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirm Payment',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b'
    });

    if (result.isConfirmed) {
      try {
        setPayingFineId(fineId);
        const res = await axios.post(`${API_URL}/fines/${fineId}/pay`, {
          amount: parseFloat(amount),
          paymentMethod: 'UPI'
        }, getAuthConfig());

        toast.success(res.data.message || 'Fine payment registered!');
        await fetchDashboardData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Payment processing failed');
      } finally {
        setPayingFineId(null);
      }
    }
  };

  // Data calculations
  const activeIssues = transactions.filter(t => t.status === 'issued' || t.status === 'ACTIVE');
  const pastOrders = transactions.filter(t => t.status === 'returned' || t.status === 'RETURNED');
  
  const now = new Date();
  const overdueCount = activeIssues.filter(t => new Date(t.dueDate || t.dueAt) < now).length;
  const totalUnpaidFineCents = fines.filter(f => f.status !== 'PAID' && f.status !== 'WAIVED')
    .reduce((sum, f) => sum + (f.balanceCents || f.amount * 100 || 0), 0);
  const totalUnpaidFines = (totalUnpaidFineCents / 100).toFixed(2);

  const dueReminders = activeIssues.filter(t => {
    const due = new Date(t.dueDate || t.dueAt);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).sort((a, b) => new Date(a.dueDate || a.dueAt) - new Date(b.dueDate || b.dueAt));

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <motion.div 
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4"
    >
      <div className={`p-4 rounded-2xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Overdue Warning Alert Banner */}
      {overdueCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-6 rounded-3xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-100 dark:bg-red-900/50 p-3.5 rounded-2xl text-red-600 dark:text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900 dark:text-red-200">
                You have {overdueCount} overdue loan{overdueCount > 1 ? 's' : ''}!
              </h2>
              <p className="text-sm text-red-700 dark:text-red-400">
                Please return them promptly to the library desk or renew eligible loans below to avoid daily late fines.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Patron Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Active borrowings, hold requests queue, due dates, and fine balances.
        </p>
      </div>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Loans" 
          value={activeIssues.length} 
          icon={BookOpen} 
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" 
        />
        <StatCard 
          title="Reservations in Queue" 
          value={reservations.length} 
          icon={Bookmark} 
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" 
        />
        <StatCard 
          title="Books Returned" 
          value={pastOrders.length} 
          icon={CheckCircle} 
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
        />
        <StatCard 
          title="Fines Balance" 
          value={`₹${totalUnpaidFines}`} 
          icon={DollarSign} 
          colorClass={totalUnpaidFineCents > 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"} 
          subtitle={totalUnpaidFineCents > 0 ? 'Outstanding library fees' : 'No outstanding fees'}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Loans, Hold Requests, Fines */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Loans Section with Self-Renewal */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Borrowings</h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">{activeIssues.length} items on loan</span>
            </div>

            {activeIssues.length > 0 ? (
              <div className="space-y-3">
                {activeIssues.map((t) => {
                  const dueDate = new Date(t.dueDate || t.dueAt);
                  const isOverdue = dueDate < now;
                  const txId = t._id || t.id;

                  return (
                    <div 
                      key={txId} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 gap-4"
                    >
                      <div className="min-w-0 flex items-center gap-4">
                        <div className="w-12 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                          <BookOpen className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">
                            {t.book?.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">by {t.book?.author}</p>
                          {t.copy?.barcode && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Copy: {t.copy.barcode}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Date</p>
                          <p className={`text-sm font-bold ${isOverdue ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                            {dueDate.toLocaleDateString()}
                          </p>
                          {t.renewalCount !== undefined && (
                            <p className="text-[10px] text-slate-400">Renewals: {t.renewalCount}</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleRenewLoan(txId)}
                          disabled={renewingId === txId || isOverdue}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40"
                          title={isOverdue ? 'Overdue books cannot be renewed online. Return at desk.' : 'Extend loan period'}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${renewingId === txId ? 'animate-spin' : ''}`} />
                          Renew
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                You have no actively borrowed books. Explore the catalog to borrow.
              </div>
            )}
          </section>

          {/* Reservations & Hold Queue Section */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Reservations Queue</h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">{reservations.length} hold requests</span>
            </div>

            {reservations.length > 0 ? (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <div key={r.id || r._id} className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {r.book?.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Reserved on {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        r.status === 'READY_FOR_PICKUP'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                      }`}>
                        {r.status === 'READY_FOR_PICKUP' ? 'Ready for Pickup!' : `Queue Position: #${r.queuePosition}`}
                      </span>

                      <button
                        onClick={() => handleCancelReservation(r.id || r._id, r.book?.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Cancel hold"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No active book reservations.
              </div>
            )}
          </section>

          {/* Outstanding Fines Section */}
          {fines.length > 0 && (
            <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-rose-600" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fines & Penalties</h2>
                </div>
                <span className="text-xs font-bold text-rose-600">Total: ₹{totalUnpaidFines}</span>
              </div>

              <div className="space-y-3">
                {fines.map((f) => {
                  const balance = (f.balanceCents ? f.balanceCents / 100 : f.amount || 0).toFixed(2);
                  const isPaid = f.status === 'PAID' || f.status === 'WAIVED';

                  return (
                    <div key={f.id || f._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          {f.reason || 'Overdue Fee'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Assessed on {new Date(f.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ₹{balance}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">{f.status}</p>
                        </div>

                        {!isPaid && (
                          <button
                            onClick={() => handlePayFine(f.id || f._id, balance)}
                            disabled={payingFineId === (f.id || f._id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Past Returned Books History */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Borrowing History</h2>
            </div>

            {pastOrders.length > 0 ? (
              <div className="space-y-3">
                {pastOrders.slice(0, 5).map((t) => (
                  <div key={t._id || t.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{t.book?.title}</p>
                      <p className="text-xs text-slate-500">
                        Returned on {new Date(t.returnDate || t.returnedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">
                      Returned
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No past transactions on record.
              </div>
            )}
          </section>
        </div>

        {/* Right Col: AI Recommendations & Due Reminders */}
        <div className="space-y-8">
          <AIRecommendations />

          {/* Due Reminders Box */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-3xl p-6 shadow-sm border border-amber-100 dark:border-amber-900/50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Due Reminders</h2>
            </div>

            {dueReminders.length > 0 ? (
              <div className="space-y-3">
                {dueReminders.map((t) => {
                  const dueDate = new Date(t.dueDate || t.dueAt);
                  const isOverdue = dueDate < now;

                  return (
                    <div 
                      key={t._id || t.id} 
                      className={`p-4 rounded-2xl border ${
                        isOverdue 
                          ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900' 
                          : 'bg-white border-amber-100 dark:bg-slate-700 dark:border-slate-600'
                      }`}
                    >
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {t.book?.title}
                      </h4>
                      <p className={`text-xs font-semibold mt-1 ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                        {isOverdue ? 'Overdue!' : 'Due Soon'} • {dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mb-2 opacity-60" />
                <p className="text-sm font-semibold">No upcoming due dates!</p>
              </div>
            )}
          </section>

          {/* Watchlist */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Saved in Watchlist</h2>
            </div>

            {watchlist.length > 0 ? (
              <div className="space-y-2">
                {watchlist.slice(0, 4).map((book) => (
                  <div key={book._id || book.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <p className="font-bold text-slate-800 dark:text-white text-xs truncate max-w-[180px]">
                      {book.title}
                    </p>
                    <span className="text-[10px] text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {book.category}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 text-xs py-4">Your watchlist is empty.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
