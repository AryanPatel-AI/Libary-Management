import React, { useState, useEffect } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { Search, Loader2, ArrowLeftRight, Calendar, User, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';

const statusConfig = {
  issued: { label: 'Issued', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  returned: { label: 'Returned', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
  overdue: { label: 'Overdue', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
};

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);

      const { data } = await axios.get(`${API_URL}/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(data.data.transactions);
      setTotalPages(data.data.pages);
      setTotal(data.data.total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const isOverdue = (t) => t.status === 'issued' && new Date(t.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Transaction Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View all book issues, returns, and overdue records</p>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: '', label: 'All' },
              { value: 'issued', label: 'Issued' },
              { value: 'returned', label: 'Returned' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === f.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {total} total transactions
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-6 font-bold">User</th>
                <th className="p-6 font-bold">Book</th>
                <th className="p-6 font-bold">Issue Date</th>
                <th className="p-6 font-bold">Due Date</th>
                <th className="p-6 font-bold">Return Date</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Fine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-slate-500 font-medium text-sm">Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">No transactions found.</td>
                </tr>
              ) : transactions.map((t) => {
                const overdue = isOverdue(t);
                const status = overdue ? 'overdue' : t.status;
                const config = statusConfig[status] || statusConfig.issued;

                return (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{t.user?.name || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{t.user?.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-medium text-slate-900 dark:text-white text-sm truncate max-w-[200px]">{t.book?.title || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{t.book?.author || ''}</div>
                    </td>
                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(t.issueDate).toLocaleDateString()}
                    </td>
                    <td className={`p-6 text-sm font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {new Date(t.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400">
                      {t.returnDate ? new Date(t.returnDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-6">
                      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-bold`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      {t.fine > 0 ? (
                        <span className="font-bold text-red-600 dark:text-red-400">₹{t.fine}</span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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

export default AdminTransactions;
