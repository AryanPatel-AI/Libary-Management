import React, { useState, useEffect } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { History, Search, Filter, Clock, User, HardDrive, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/analytics/logs?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(data.data.logs);
      setTotalPages(data.data.pages);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'UPDATE': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'DELETE': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-500" />
            System Activity Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit trail of all administrative and system actions</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-6 font-bold">Timestamp</th>
                <th className="p-6 font-bold">Performed By</th>
                <th className="p-6 font-bold">Action</th>
                <th className="p-6 font-bold">Entity Type</th>
                <th className="p-6 font-bold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">Loading audit trail...</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {log.performedBy?.name || 'System Agent'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                          {log.performedBy?.role || 'SYSTEM'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <HardDrive className="w-4 h-4 text-slate-400" />
                      {log.entityType}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      Modified {log.entityType} ID: {log.entityId}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Log Page <span className="text-slate-900 dark:text-white">{page}</span> of {totalPages || 1}
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

export default ActivityLogs;
