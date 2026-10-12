import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Search, CreditCard, Banknote, ShieldAlert,
  Receipt, CheckCircle2, X, Printer, User
} from 'lucide-react';
import { toast } from 'react-toastify';

const SAMPLE_PATRONS_WITH_FINES = [
  {
    patronId: 'patron-01',
    name: 'Marcus Vance',
    cardId: 'PKC-MBR-192834',
    email: 'm.vance@campus.edu',
    totalDue: 7.00,
    items: [
      { id: 'f-1', book: 'Structure & Interpretation of Computer Programs', reason: 'Overdue (3 days)', amount: 3.00, date: '2026-06-15' },
      { id: 'f-2', book: 'Introduction to Algorithms (CLRS)', reason: 'Overdue (4 days)', amount: 4.00, date: '2026-05-10' },
    ],
  },
  {
    patronId: 'patron-02',
    name: 'Julian Sterling',
    cardId: 'PKC-MBR-849204',
    email: 'scholar.sterling@patel-library.org',
    totalDue: 4.00,
    items: [
      { id: 'f-3', book: 'Thinking, Fast and Slow', reason: 'Overdue (4 days)', amount: 4.00, date: '2026-05-20' },
    ],
  },
  {
    patronId: 'patron-03',
    name: 'Sophia Chen',
    cardId: 'PKC-MBR-671239',
    email: 's.chen@architecture.org',
    totalDue: 18.50,
    items: [
      { id: 'f-4', book: 'Complexity and Contradiction in Architecture', reason: 'Water damage assessment on corner', amount: 18.50, date: '2026-06-02' },
    ],
  },
];

const LibrarianFines = () => {
  const [patrons, setPatrons] = useState(SAMPLE_PATRONS_WITH_FINES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePatron, setActivePatron] = useState(SAMPLE_PATRONS_WITH_FINES[0]);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [waiverModalOpen, setWaiverModalOpen] = useState(false);
  const [waiverReason, setWaiverReason] = useState('First-time courtesy waiver');
  const [receiptRecord, setReceiptRecord] = useState(null);

  const handleSelectPatron = (patron) => {
    setActivePatron(patron);
    setPayAmount(patron.totalDue.toFixed(2));
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(payAmount);
    if (!amountNum || amountNum <= 0 || !activePatron) return;

    const receipt = {
      receiptNo: `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
      patron: activePatron.name,
      cardId: activePatron.cardId,
      amount: amountNum,
      method: payMethod,
      date: new Date().toLocaleString(),
      librarian: 'Staff Desk #1',
    };

    // Deduct from patron
    setPatrons(prev => prev.map(p => {
      if (p.patronId === activePatron.patronId) {
        const remaining = Math.max(0, p.totalDue - amountNum);
        return { ...p, totalDue: remaining };
      }
      return p;
    }));

    setActivePatron(prev => ({
      ...prev,
      totalDue: Math.max(0, prev.totalDue - amountNum),
    }));

    setReceiptRecord(receipt);
    toast.success(`Payment of $${amountNum.toFixed(2)} accepted via ${payMethod.toUpperCase()}`);
  };

  const handleApplyWaiver = (e) => {
    e.preventDefault();
    if (!activePatron) return;

    setPatrons(prev => prev.map(p => {
      if (p.patronId === activePatron.patronId) {
        return { ...p, totalDue: 0, items: [] };
      }
      return p;
    }));

    setActivePatron(prev => ({ ...prev, totalDue: 0, items: [] }));
    setWaiverModalOpen(false);
    toast.info(`Balance waived for ${activePatron.name}. Reason: ${waiverReason}`);
  };

  const filteredPatrons = patrons.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.cardId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      
      {/* Eyebrow & Title */}
      <div>
        <span className="section-eyebrow mb-1.5">Librarian Desk &bull; Cashier &amp; Settlements</span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-editorial text-3xl font-bold text-foreground tracking-tight">
              Circulation Cashier &amp; Fines Desk
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Collect outstanding fees, accept cash or terminal payments, process official receipts, or apply authorized waivers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Patron Ledger Lookup */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patron by name or card ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2.5">
            {filteredPatrons.map(patron => {
              const isSelected = activePatron?.patronId === patron.patronId;
              return (
                <div
                  key={patron.patronId}
                  onClick={() => handleSelectPatron(patron)}
                  className={`hairline-card p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-card border-amber-500/60 shadow-sm'
                      : 'bg-card/60 hover:bg-card border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif-editorial font-bold text-sm text-foreground">
                        {patron.name}
                      </h4>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {patron.cardId}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono text-sm font-bold ${patron.totalDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ${patron.totalDue.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {patron.totalDue > 0 ? 'Due' : 'Cleared'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right Column: Payment & Settlement Terminal */}
        <div className="lg:col-span-2 space-y-6">
          {activePatron ? (
            <div className="hairline-card p-6 rounded-3xl bg-card border border-border shadow-xs space-y-6">
              
              {/* Patron Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Patron Fee Ledger
                  </span>
                  <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                    {activePatron.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Card: <span className="font-mono font-bold text-foreground">{activePatron.cardId}</span> &bull; {activePatron.email}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground">Total Outstanding:</span>
                  <div className="font-serif-editorial text-3xl font-bold text-amber-600 dark:text-amber-400">
                    ${activePatron.totalDue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Itemized Charges */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Itemized Fines &amp; Assessments
                </h4>
                <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-background/50">
                  {activePatron.items.map(item => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{item.book}</p>
                        <p className="text-[11px] text-muted-foreground">{item.reason} &bull; {item.date}</p>
                      </div>
                      <span className="font-mono font-bold text-foreground">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {activePatron.items.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No active charges on patron account.
                    </div>
                  )}
                </div>
              </div>

              {/* Cashier Payment Form */}
              {activePatron.totalDue > 0 ? (
                <form onSubmit={handleProcessPayment} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
                        Amount to Collect ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        max={activePatron.totalDue}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-mono font-bold text-foreground focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
                        Tender Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPayMethod('cash')}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                            payMethod === 'cash'
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background text-muted-foreground hover:text-foreground border-border'
                          }`}
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          Cash
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayMethod('card')}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                            payMethod === 'card'
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background text-muted-foreground hover:text-foreground border-border'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Card / POS
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setWaiverModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center gap-1.5"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Apply Supervisor Waiver
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Collect Payment &amp; Issue Receipt
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <h4 className="font-serif-editorial font-bold text-base text-foreground">
                    Patron Account in Good Standing
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    No outstanding fines or damage assessments remain.
                  </p>
                </div>
              )}

              {/* Receipt Printout Snippet */}
              {receiptRecord && (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pb-2 border-b border-border">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-amber-500" />
                      Receipt #{receiptRecord.receiptNo}
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="text-foreground hover:underline flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                  </div>
                  <div className="mt-2 text-xs space-y-1">
                    <p className="text-foreground font-semibold">
                      Received ${receiptRecord.amount.toFixed(2)} from {receiptRecord.patron} ({receiptRecord.cardId})
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Method: {receiptRecord.method.toUpperCase()} &bull; Date: {receiptRecord.date}
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">Select a patron to proceed.</div>
          )}
        </div>

      </div>

      {/* Waiver Dialog */}
      <AnimatePresence>
        {waiverModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-serif-editorial text-lg font-bold text-foreground">
                  Supervisor Fine Waiver
                </h3>
                <button onClick={() => setWaiverModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplyWaiver} className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  You are waiving <span className="font-bold text-foreground">${activePatron?.totalDue.toFixed(2)}</span> in fees for <span className="font-bold text-foreground">{activePatron?.name}</span>. This will be audited.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Waiver Policy Justification
                  </label>
                  <select
                    value={waiverReason}
                    onChange={(e) => setWaiverReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                  >
                    <option>First-time courtesy waiver</option>
                    <option>Administrative system error</option>
                    <option>Medical or emergency exception</option>
                    <option>Academic research grant offset</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setWaiverModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-muted hover:bg-border text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                  >
                    Confirm &amp; Audit Waiver
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LibrarianFines;
