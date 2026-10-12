import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, AlertTriangle, CheckCircle2, CreditCard,
  Receipt, ShieldCheck, X, ArrowRight, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../api/config';

const SAMPLE_FINES = [
  {
    _id: 'fine-001',
    bookTitle: 'Thinking, Fast and Slow',
    reason: 'Overdue Circulation (4 days @ $1.00/day)',
    barcode: 'PKC-048201-B',
    amount: 4.00,
    dateAssessed: '2026-05-20',
    status: 'unpaid',
  },
  {
    _id: 'fine-002',
    bookTitle: 'Artificial Intelligence: A Modern Approach',
    reason: 'Overdue Circulation (6 days @ $1.00/day)',
    barcode: 'PKC-099412-D',
    amount: 6.00,
    dateAssessed: '2026-01-30',
    status: 'paid',
    datePaid: '2026-02-01',
    receiptNumber: 'RCP-2026-0921',
  },
  {
    _id: 'fine-003',
    bookTitle: 'Modern Operating Systems (4th Edition)',
    reason: 'Spine repair assessment',
    barcode: 'PKC-033109-A',
    amount: 8.50,
    dateAssessed: '2025-11-12',
    status: 'waived',
    datePaid: '2025-11-15',
    receiptNumber: 'WAV-CHIEF-019',
  },
];

const MemberFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null); // null = pay all
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get(`${API_URL}/fines/my-fines`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.data?.length > 0) {
          setFines(res.data.data);
          return;
        }
      }
      setFines(SAMPLE_FINES);
    } catch (err) {
      setFines(SAMPLE_FINES);
    } finally {
      setLoading(false);
    }
  };

  const unpaidFines = fines.filter(f => f.status === 'unpaid');
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);

  const handlePay = (fine = null) => {
    setSelectedFine(fine);
    setPayModalOpen(true);
  };

  const processPayment = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    await new Promise(r => setTimeout(r, 1200));

    const fineIdsToPay = selectedFine ? [selectedFine._id] : unpaidFines.map(f => f._id);
    
    setFines(prev => prev.map(f => {
      if (fineIdsToPay.includes(f._id)) {
        return {
          ...f,
          status: 'paid',
          datePaid: new Date().toISOString().split('T')[0],
          receiptNumber: `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
        };
      }
      return f;
    }));

    setProcessingPayment(false);
    setPayModalOpen(false);
    toast.success('Payment settled successfully! Receipt generated.');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-8 pb-16 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Section Header */}
        <div className="mb-8">
          <span className="section-eyebrow mb-2">Member Portal &bull; Financials</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Fines &amp; Account Ledger
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
                Review circulation penalty balances, replacement assessments, and archival receipts.
              </p>
            </div>

            {totalUnpaid > 0 && (
              <button
                onClick={() => handlePay(null)}
                className="px-5 py-2.5 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 self-start md:self-auto shadow-sm"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                Pay Outstanding Balance (${totalUnpaid.toFixed(2)})
              </button>
            )}
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`hairline-card p-6 rounded-2xl bg-card border shadow-xs ${totalUnpaid > 0 ? 'border-amber-500/40 metric-amber' : 'border-border metric-green'}`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Outstanding Balance</span>
              <DollarSign className={`w-4 h-4 ${totalUnpaid > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-4xl font-bold font-serif-editorial ${totalUnpaid > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                ${totalUnpaid.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                {totalUnpaid === 0 ? 'Account in good standing' : 'Due for settlement'}
              </span>
            </div>
          </div>

          <div className="hairline-card p-6 rounded-2xl bg-card border border-border metric-blue shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Daily Overdue Rate</span>
              <Receipt className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold font-serif-editorial">$1.00</span>
              <span className="text-xs text-muted-foreground">per volume / day</span>
            </div>
          </div>

          <div className="hairline-card p-6 rounded-2xl bg-card border border-border metric-purple shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Borrowing Status</span>
              <ShieldCheck className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif-editorial text-foreground">
                {totalUnpaid > 20 ? 'Privileges Restricted' : 'Active Privileges'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {totalUnpaid > 20 ? 'Limit exceeded ($20 cap)' : 'Clean credit allowance'}
            </p>
          </div>
        </div>

        {/* Fines Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <h3 className="font-serif-editorial font-bold text-base text-foreground">Ledger Transactions</h3>
            <span className="font-mono text-xs text-muted-foreground">{fines.length} total entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="th-cell">Title &amp; Reason</th>
                  <th className="th-cell">Barcode</th>
                  <th className="th-cell">Assessed Date</th>
                  <th className="th-cell">Amount</th>
                  <th className="th-cell">Status</th>
                  <th className="th-cell text-right">Action / Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs">
                      Loading fee ledger...
                    </td>
                  </tr>
                ) : fines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs">
                      No fines or fees on record. Your account is spotless!
                    </td>
                  </tr>
                ) : (
                  fines.map((fine, idx) => (
                    <tr key={fine._id || idx} className="tr-hover">
                      <td className="td-cell">
                        <p className="font-serif-editorial font-bold text-sm text-foreground">
                          {fine.bookTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {fine.reason}
                        </p>
                      </td>

                      <td className="td-cell font-mono text-xs text-muted-foreground">
                        {fine.barcode || 'PKC-000000'}
                      </td>

                      <td className="td-cell font-mono text-xs text-muted-foreground">
                        {fine.dateAssessed}
                      </td>

                      <td className="td-cell font-mono text-sm font-semibold text-foreground">
                        ${fine.amount.toFixed(2)}
                      </td>

                      <td className="td-cell">
                        {fine.status === 'unpaid' && (
                          <span className="badge-danger px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Unpaid
                          </span>
                        )}
                        {fine.status === 'paid' && (
                          <span className="badge-success px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Paid &bull; Settled
                          </span>
                        )}
                        {fine.status === 'waived' && (
                          <span className="badge-neutral px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Waived by Chief
                          </span>
                        )}
                      </td>

                      <td className="td-cell text-right">
                        {fine.status === 'unpaid' ? (
                          <button
                            onClick={() => handlePay(fine)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all inline-flex items-center gap-1"
                          >
                            Pay ${fine.amount.toFixed(2)}
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {fine.receiptNumber || 'RCP-ARCHIVAL'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Mock Payment */}
        <AnimatePresence>
          {payModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    <h3 className="font-serif-editorial text-lg font-bold text-foreground">
                      Patel &amp; Co. Cashier Desk
                    </h3>
                  </div>
                  <button
                    onClick={() => setPayModalOpen(false)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={processPayment} className="mt-5 space-y-4">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Description</span>
                      <span>Amount</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-foreground mt-1">
                      <span>{selectedFine ? selectedFine.bookTitle : 'Total Outstanding Balance'}</span>
                      <span className="font-mono">${selectedFine ? selectedFine.amount.toFixed(2) : totalUnpaid.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="p-3 border border-amber-500 bg-amber-500/10 rounded-xl cursor-pointer flex items-center gap-2 text-xs font-medium text-foreground">
                        <input type="radio" name="method" defaultChecked className="accent-amber-500" />
                        Card on File (•••• 4242)
                      </label>
                      <label className="p-3 border border-border rounded-xl cursor-pointer flex items-center gap-2 text-xs font-medium text-muted-foreground hover:bg-muted">
                        <input type="radio" name="method" className="accent-amber-500" />
                        Apple Pay / Google
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={processingPayment}
                      className="w-full py-2.5 bg-foreground text-background font-semibold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {processingPayment ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                          Processing Transaction...
                        </>
                      ) : (
                        `Authorize Payment ($${(selectedFine ? selectedFine.amount : totalUnpaid).toFixed(2)})`
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default MemberFines;
