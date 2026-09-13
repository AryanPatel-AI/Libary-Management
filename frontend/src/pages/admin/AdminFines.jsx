import React, { useState, useEffect } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { Loader2, User, DollarSign, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import MetricCard from '../../components/MetricCard';

const AdminFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [paidFilter, setPaidFilter] = useState('');

  const fetchFines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page, limit: 15 });
      if (paidFilter !== '') params.append('paid', paidFilter);

      const { data } = await axios.get(`${API_URL}/fines?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFines(data.data.fines);
      setTotalPages(data.data.pages);
      setTotal(data.data.total);
      setTotalUnpaid(data.data.totalUnpaidAmount || 0);
    } catch (error) {
      console.error('Error fetching fines:', error);
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [page, paidFilter]);

  const handleMarkPaid = async (fineId, amount) => {
    const result = await Swal.fire({
      title: 'Mark Fine as Paid?',
      text: `Confirm payment of ₹${amount}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, mark paid',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/fines/${fineId}/pay`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Fine marked as paid');
        fetchFines();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark fine as paid');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Fine Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage overdue fines across all users</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Fines"
          value={loading ? '...' : total}
          icon={DollarSign}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          delay={0.1}
        />
        <MetricCard
          title="Total Unpaid"
          value={loading ? '...' : `₹${totalUnpaid}`}
          icon={DollarSign}
          colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          delay={0.2}
        />
        <MetricCard
          title="Fine Rate"
          value={`₹${import.meta.env.VITE_FINE_PER_DAY || 5}/day`}
          icon={DollarSign}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          delay={0.3}
        />
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {[
              { value: '', label: 'All Fines' },
              { value: 'false', label: 'Unpaid' },
              { value: 'true', label: 'Paid' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => { setPaidFilter(f.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  paidFilter === f.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-6 font-bold">User</th>
                <th className="p-6 font-bold">Book</th>
                <th className="p-6 font-bold">Amount</th>
                <th className="p-6 font-bold">Reason</th>
                <th className="p-6 font-bold">Date</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-slate-500 font-medium text-sm">Loading fines...</p>
                    </div>
                  </td>
                </tr>
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">No fines found.</td>
                </tr>
              ) : fines.map((fine) => (
                <tr key={fine._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <User className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{fine.user?.name || 'N/A'}</div>
                        <div className="text-xs text-slate-500">{fine.user?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-medium text-slate-900 dark:text-white text-sm truncate max-w-[180px]">
                      {fine.transaction?.book?.title || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500">{fine.transaction?.book?.author || ''}</div>
                  </td>
                  <td className="p-6">
                    <span className="font-extrabold text-lg text-red-600 dark:text-red-400">₹{fine.amount}</span>
                  </td>
                  <td className="p-6 text-sm text-slate-600 dark:text-slate-400">
                    {fine.reason || 'Overdue return'}
                  </td>
                  <td className="p-6 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(fine.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6">
                    {fine.paid ? (
                      <span className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                        Paid
                      </span>
                    ) : (
                      <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {!fine.paid && (
                      <button
                        onClick={() => handleMarkPaid(fine._id, fine.amount)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Page <span className="text-slate-900 dark:text-white">{page}</span> of {totalPages || 1}
          </div>
          <div className="flex gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-slate-300 transition-all shadow-sm"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-slate-300 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFines;
