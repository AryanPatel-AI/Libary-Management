import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  UserCheck, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  Clock, 
  DollarSign,
  Barcode
} from 'lucide-react';
import API_URL from '../../api/config';
import { toast } from 'react-toastify';

const CirculationDesk = () => {
  const [activeTab, setActiveTab] = useState('checkout'); // 'checkout' | 'checkin' | 'lookup'
  const token = localStorage.getItem('token');

  // Checkout State
  const [memberInput, setMemberInput] = useState('');
  const [member, setMember] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [copyBarcode, setCopyBarcode] = useState('');
  const [stagedCopies, setStagedCopies] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Checkin State
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);
  const [lastReturnResult, setLastReturnResult] = useState(null);

  // Lookup State
  const [lookupBarcode, setLookupBarcode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const barcodeInputRef = useRef(null);
  const returnInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'checkout' && member && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    } else if (activeTab === 'checkin' && returnInputRef.current) {
      returnInputRef.current.focus();
    }
  }, [activeTab, member]);

  // Lookup Member by Barcode or Number
  const handleMemberLookup = async (e) => {
    if (e) e.preventDefault();
    if (!memberInput.trim()) return;

    setMemberLoading(true);
    try {
      const res = await fetch(`${API_URL}/users?search=${encodeURIComponent(memberInput.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data.users.length > 0) {
        const found = json.data.users[0];
        setMember(found);
        toast.success(`Member identified: ${found.name}`);
      } else {
        toast.error('Member not found. Please verify member card number.');
        setMember(null);
      }
    } catch (err) {
      toast.error('Failed to lookup member');
    } finally {
      setMemberLoading(false);
    }
  };

  // Add Book Copy to Staging
  const handleStageCopy = async (e) => {
    if (e) e.preventDefault();
    const barcode = copyBarcode.trim().toUpperCase();
    if (!barcode) return;

    if (stagedCopies.some(c => c.barcode === barcode)) {
      toast.warning('Copy already added to checkout queue');
      setCopyBarcode('');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/copies/barcode/${barcode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || `Copy ${barcode} not found`);
        return;
      }

      const copy = json.data;
      if (copy.status !== 'AVAILABLE' && copy.status !== 'RESERVED') {
        toast.error(`Copy is ${copy.status}. Only available items can be issued.`);
        return;
      }

      setStagedCopies(prev => [...prev, copy]);
      setCopyBarcode('');
      toast.info(`Added: ${copy.book.title}`);
    } catch (err) {
      toast.error('Error verifying copy barcode');
    }
  };

  // Execute Batch Checkout
  const handleConfirmCheckout = async () => {
    if (!member || stagedCopies.length === 0) return;

    setCheckoutLoading(true);
    let successCount = 0;

    for (const copy of stagedCopies) {
      try {
        const res = await fetch(`${API_URL}/circulation/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            barcode: copy.barcode,
            memberNumber: member.member ? member.member.memberNumber : undefined,
            userId: member._id
          })
        });

        const json = await res.json();
        if (res.ok && json.success) {
          successCount++;
        } else {
          toast.error(json.message || `Failed to checkout ${copy.barcode}`);
        }
      } catch (err) {
        toast.error(`Network error for copy ${copy.barcode}`);
      }
    }

    setCheckoutLoading(false);
    if (successCount > 0) {
      toast.success(`Successfully checked out ${successCount} item(s)!`);
      setStagedCopies([]);
      // Refresh member stats
      handleMemberLookup();
    }
  };

  // Process Fast Checkin
  const handleFastCheckin = async (e) => {
    if (e) e.preventDefault();
    const barcode = returnBarcode.trim().toUpperCase();
    if (!barcode) return;

    setReturnLoading(true);
    try {
      const res = await fetch(`${API_URL}/circulation/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ barcode })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setLastReturnResult(json);
        toast.success(json.message);
        setReturnBarcode('');
      } else {
        toast.error(json.message || 'Checkin failed');
      }
    } catch (err) {
      toast.error('Network error processing return');
    } finally {
      setReturnLoading(false);
    }
  };

  // Quick Copy Lookup
  const handleCopyLookup = async (e) => {
    if (e) e.preventDefault();
    const barcode = lookupBarcode.trim().toUpperCase();
    if (!barcode) return;

    setLookupLoading(true);
    try {
      const res = await fetch(`${API_URL}/copies/barcode/${barcode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setLookupResult(json.data);
      } else {
        toast.error(`Barcode ${barcode} not found`);
        setLookupResult(null);
      }
    } catch (err) {
      toast.error('Failed to lookup barcode');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Scan className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Rapid Circulation Terminal
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Barcode-driven high throughput desk terminal for issue, checkin, and inventory lookup.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'checkout'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Fast Checkout [F1]
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'checkin'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Fast Checkin [F2]
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'lookup'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-4 h-4" />
            Copy Inspector [F3]
          </button>
        </div>
      </div>

      {/* TAB 1: FAST CHECKOUT */}
      {activeTab === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Member Identification & Copy Scanner */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Scan Member Card */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">1</span>
                Step 1: Scan Member Card / Enter Number
              </h2>
              <form onSubmit={handleMemberLookup} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    placeholder="Scan Member Card (e.g. MEM-2026-0001 or email)..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <UserCheck className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <button
                  type="submit"
                  disabled={memberLoading}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {memberLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Lookup'}
                </button>
              </form>

              {/* Member Summary Card */}
              {member && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">{member.name}</h3>
                    <p className="text-xs text-slate-500">{member.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {member.member ? member.member.memberType : 'PATRON'}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {member.member ? member.member.memberNumber : member._id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 border-l pl-6 border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500">Unpaid Fines</p>
                      <p className={`text-base font-black ${member.member && member.member.totalFinesDueCents > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        ${member.member ? member.member.totalFinesDue : '0.00'}
                      </p>
                    </div>
                    <button
                      onClick={() => { setMember(null); setStagedCopies([]); }}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      title="Clear Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Step 2: Scan Book Copy Barcode */}
            <div className={`bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-opacity ${!member ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">2</span>
                Step 2: Scan Book Barcodes
              </h2>
              <form onSubmit={handleStageCopy} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={copyBarcode}
                    onChange={(e) => setCopyBarcode(e.target.value)}
                    placeholder="Scan Book Barcode (e.g. LIB-2026-MAIN-001001)..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <Barcode className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  Scan
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Staged Cart & Confirm Checkout */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[420px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  Staged for Issue ({stagedCopies.length})
                </h3>
                {stagedCopies.length > 0 && (
                  <button
                    onClick={() => setStagedCopies([])}
                    className="text-xs text-slate-400 hover:text-rose-500 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[350px]">
                {stagedCopies.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Scan className="w-12 h-12 stroke-[1.5] mb-2 opacity-40" />
                    <p className="text-sm font-medium">Ready to scan</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Identify member above, then scan book barcodes to stage them for checkout.
                    </p>
                  </div>
                ) : (
                  stagedCopies.map((copy, index) => (
                    <div
                      key={copy.barcode}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{copy.book.title}</p>
                          <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{copy.barcode}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setStagedCopies(prev => prev.filter(c => c.barcode !== copy.barcode))}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={!member || stagedCopies.length === 0 || checkoutLoading}
                  onClick={handleConfirmCheckout}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all text-sm"
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing Checkout...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Checkout ({stagedCopies.length} Items)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FAST CHECKIN (RETURN) */}
      {activeTab === 'checkin' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="inline-flex p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
              <ArrowDownLeft className="w-8 h-8" />
            </span>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Fast Scan Book Return</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Scan book copy barcode to automatically settle loan, assess overdue fines, and alert next member in queue.
            </p>

            <form onSubmit={handleFastCheckin} className="mt-6 flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={returnInputRef}
                  type="text"
                  value={returnBarcode}
                  onChange={(e) => setReturnBarcode(e.target.value)}
                  placeholder="Scan copy barcode (e.g. LIB-2026-MAIN-001001)..."
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <Barcode className="w-5 h-5 text-slate-400 absolute left-3 top-4" />
              </div>
              <button
                type="submit"
                disabled={returnLoading}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {returnLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Process Return'}
              </button>
            </form>
          </div>

          {/* Return Result Card */}
          <AnimatePresence>
            {lastReturnResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>{lastReturnResult.message}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
                  <div>
                    <span className="text-xs text-slate-500">Book Title</span>
                    <p className="font-bold text-slate-800 dark:text-white">{lastReturnResult.data.book.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Returned By</span>
                    <p className="font-bold text-slate-800 dark:text-white">{lastReturnResult.data.user?.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Fine Assessed</span>
                    <p className={`font-bold ${lastReturnResult.fineAssessed > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      ${lastReturnResult.fineAssessed.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Reservation Hold</span>
                    <p className="font-bold text-blue-500">
                      {lastReturnResult.reservationTriggered ? 'Allocated to Next Patron' : 'Returned to Shelf'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 3: COPY INSPECTOR */}
      {activeTab === 'lookup' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-500" />
              Scan or Enter Physical Copy Barcode
            </h2>
            <form onSubmit={handleCopyLookup} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={lookupBarcode}
                  onChange={(e) => setLookupBarcode(e.target.value)}
                  placeholder="Enter barcode (e.g. LIB-2026-MAIN-001001)..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <Barcode className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {lookupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Inspect'}
              </button>
            </form>
          </div>

          {lookupResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{lookupResult.book.title}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">Barcode: {lookupResult.barcode} | Accession: {lookupResult.accessionNumber}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  lookupResult.status === 'AVAILABLE'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : lookupResult.status === 'ON_LOAN'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {lookupResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
                <div>
                  <span className="text-xs text-slate-500">Branch</span>
                  <p className="font-semibold text-slate-800 dark:text-white">{lookupResult.branch?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Shelf Location</span>
                  <p className="font-semibold text-slate-800 dark:text-white">{lookupResult.shelf?.shelfCode || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Condition</span>
                  <p className="font-semibold text-slate-800 dark:text-white">{lookupResult.condition}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Acquired</span>
                  <p className="font-semibold text-slate-800 dark:text-white">{new Date(lookupResult.acquiredAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default CirculationDesk;
