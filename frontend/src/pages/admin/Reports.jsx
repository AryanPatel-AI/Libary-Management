import React, { useState, useEffect } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  BookOpen, 
  Calendar,
  Layers,
  ArrowDownToLine,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [downloadingType, setDownloadingType] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [overdueList, setOverdueList] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [monthlyRes, overdueRes, popularRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/monthly-report`, getAuthConfig()),
        axios.get(`${API_URL}/analytics/overdue`, getAuthConfig()),
        axios.get(`${API_URL}/analytics/popular-books?limit=5`, getAuthConfig())
      ]);

      setMonthlyStats(monthlyRes.data.data);
      setOverdueList(overdueRes.data.data || []);
      setPopularBooks(popularRes.data.data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
      toast.error('Failed to load reporting data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async (type, filename) => {
    try {
      setDownloadingType(type);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/analytics/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download anchor
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${type} report successfully!`);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      toast.error('Failed to download report');
    } finally {
      setDownloadingType(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          Library Analytics & Export Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Generate comprehensive audit statements, overdue listings, circulation statistics, and data exports.
        </p>
      </div>

      {/* Quick Export Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-500" />
          One-Click Report Exports (CSV)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              type: 'overdue',
              title: 'Overdue Loans List',
              desc: 'Detailed record of late loans, borrower contact, and outstanding calculated fines.',
              color: 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300'
            },
            {
              type: 'circulation',
              title: 'Circulation History',
              desc: 'Complete log of issues, returns, renewals, and branch borrowing volume.',
              color: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300'
            },
            {
              type: 'inventory',
              title: 'Physical Assets Inventory',
              desc: 'All physical copies, accession numbers, barcodes, condition grades, and shelf codes.',
              color: 'border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300'
            },
            {
              type: 'fines',
              title: 'Fine Ledger & Collections',
              desc: 'Audit trail of assessed penalties, balances due, waivers, and cashier payments.',
              color: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
            }
          ].map((item) => (
            <div key={item.type} className={`p-5 rounded-3xl border flex flex-col justify-between ${item.color}`}>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => downloadCSV(item.type)}
                disabled={downloadingType === item.type}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:shadow transition-all active:scale-95"
              >
                <ArrowDownToLine className="w-4 h-4" />
                {downloadingType === item.type ? 'Generating CSV...' : 'Download CSV'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Performance Summary */}
      {monthlyStats && (
        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Monthly Performance ({monthlyStats.month})
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500">Books Issued</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{monthlyStats.issuedThisMonth}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500">Books Returned</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{monthlyStats.returnedThisMonth}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500">New Members</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{monthlyStats.newMembersThisMonth}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500">Fines Collected</p>
              <p className="text-2xl font-black text-amber-600 mt-1">₹{monthlyStats.finesCollected}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Loans Table */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Active Overdue Books ({overdueList.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Patrons with unreturned items past scheduled due date.
            </p>
          </div>

          {overdueList.length > 0 && (
            <button
              onClick={() => downloadCSV('overdue', `overdue_notice_${new Date().toISOString().split('T')[0]}.csv`)}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 py-1.5 px-3 rounded-lg bg-red-50 dark:bg-red-950/30"
            >
              <Download className="w-3.5 h-3.5" />
              Export Overdue
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold text-xs">
              <tr>
                <th className="pb-3">Book Title</th>
                <th className="pb-3">Barcode</th>
                <th className="pb-3">Member</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Overdue</th>
                <th className="pb-3 text-right">Est. Fine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {overdueList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white">{item.bookTitle}</td>
                  <td className="py-3.5 font-mono text-xs text-slate-500">{item.barcode}</td>
                  <td className="py-3.5">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{item.memberName}</p>
                      <p className="text-xs text-slate-400">{item.memberNumber} • {item.memberEmail}</p>
                    </div>
                  </td>
                  <td className="py-3.5 text-xs">{new Date(item.dueAt).toLocaleDateString()}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold">
                      {item.daysOverdue} days
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-bold text-red-600 dark:text-red-400">
                    ₹{item.estimatedFine}
                  </td>
                </tr>
              ))}

              {overdueList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                    All clear! There are currently no overdue loans.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
