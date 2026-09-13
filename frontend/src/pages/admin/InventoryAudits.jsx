import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { 
  ClipboardCheck, 
  Scan, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  History, 
  RefreshCw, 
  Check, 
  X, 
  Search,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const InventoryAudits = () => {
  const [sessions, setSessions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  
  // New session modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionBranchId, setNewSessionBranchId] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionNotes, setNewSessionNotes] = useState('');

  // Scanner inputs
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedShelfId, setSelectedShelfId] = useState('');
  const [availableShelves, setAvailableShelves] = useState([]);
  const [lastScannedResult, setLastScannedResult] = useState(null);

  const barcodeInputRef = useRef(null);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, branchesRes] = await Promise.all([
        axios.get(`${API_URL}/inventory/sessions`, getAuthConfig()),
        axios.get(`${API_URL}/branches`, getAuthConfig())
      ]);

      setSessions(sessionsRes.data.data || []);
      const activeBranches = (branchesRes.data.data || []).filter(b => b.isActive);
      setBranches(activeBranches);

      if (activeBranches.length > 0) {
        setNewSessionBranchId(activeBranches[0].id);
      }

      // If an in-progress session exists, auto-load it
      const inProgress = (sessionsRes.data.data || []).find(s => s.status === 'IN_PROGRESS');
      if (inProgress) {
        await loadSessionDetails(inProgress.id);
      }
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      toast.error('Failed to load inventory audits');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId) => {
    try {
      const res = await axios.get(`${API_URL}/inventory/sessions/${sessionId}`, getAuthConfig());
      setActiveSession(res.data.data);

      // Load shelves for this branch
      if (res.data.data.branchId) {
        const branchRes = await axios.get(`${API_URL}/branches/${res.data.data.branchId}`, getAuthConfig());
        setAvailableShelves(branchRes.data.data.shelves || []);
        if (branchRes.data.data.shelves?.length > 0) {
          setSelectedShelfId(branchRes.data.data.shelves[0].id);
        }
      }

      setTimeout(() => barcodeInputRef.current?.focus(), 150);
    } catch (err) {
      toast.error('Failed to load session details');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionBranchId || !newSessionName) {
      toast.error('Branch and session title are required');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/inventory/sessions`, {
        branchId: newSessionBranchId,
        name: newSessionName,
        notes: newSessionNotes
      }, getAuthConfig());

      toast.success(res.data.message || 'Audit session started!');
      setShowCreateModal(false);
      setNewSessionName('');
      setNewSessionNotes('');

      await fetchInitialData();
      await loadSessionDetails(res.data.data.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create audit session');
    } finally {
      setLoading(false);
    }
  };

  const handleScanBarcode = async (e) => {
    e.preventDefault();
    const cleanBarcode = barcodeInput.trim().toUpperCase();
    if (!cleanBarcode || !activeSession) return;

    try {
      setScanning(true);
      const res = await axios.post(`${API_URL}/inventory/sessions/${activeSession.id}/scan`, {
        barcode: cleanBarcode,
        currentShelfId: selectedShelfId || null
      }, getAuthConfig());

      setLastScannedResult(res.data);
      if (res.data.alreadyScanned) {
        toast.info(`Notice: ${cleanBarcode} was already scanned in this session`);
      } else if (res.data.data.status === 'MATCH') {
        toast.success(`Verified: ${res.data.data.bookTitle || cleanBarcode}`);
      } else {
        toast.warning(`Discrepancy: ${res.data.data.status} - ${res.data.data.resolutionNotes}`);
      }

      setBarcodeInput('');
      await loadSessionDetails(activeSession.id);
    } catch (err) {
      toast.error(err.response?.data?.message || `Barcode '${cleanBarcode}' unrecognized`);
      setLastScannedResult({
        error: true,
        message: err.response?.data?.message || 'Unrecognized barcode'
      });
    } finally {
      setScanning(false);
      barcodeInputRef.current?.focus();
    }
  };

  const handleReconcileSession = async () => {
    if (!activeSession) return;

    const result = await Swal.fire({
      title: 'Finalize & Reconcile Stock Audit?',
      text: 'This will compare scanned items with expected stock and flag any unscanned copies as MISSING for librarian investigation.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Finalize Audit',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const res = await axios.post(`${API_URL}/inventory/sessions/${activeSession.id}/reconcile`, {}, getAuthConfig());
        Swal.fire({
          title: 'Audit Reconciled!',
          text: res.data.message,
          icon: 'success'
        });
        await fetchInitialData();
        await loadSessionDetails(activeSession.id);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to reconcile audit session');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-indigo-600" />
            Physical Stock Audits & Verification
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Conduct shelf stock audits, verify barcodes, detect misplaced books, and reconcile inventory.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Start New Audit Session
        </button>
      </div>

      {/* Main Grid: Active Session / Scanner & Past Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Session & Scanning Desk */}
        <div className="lg:col-span-2 space-y-6">
          {activeSession ? (
            <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {activeSession.name}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeSession.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {activeSession.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Branch: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeSession.branch?.name}</span>
                    • Started: {new Date(activeSession.startedAt).toLocaleDateString()}
                  </p>
                </div>

                {activeSession.status === 'IN_PROGRESS' && (
                  <button
                    onClick={handleReconcileSession}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    Finalize & Reconcile
                  </button>
                )}
              </div>

              {/* Progress Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs font-medium text-slate-500">Expected Assets</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {activeSession.totalExpected}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Scanned</p>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
                    {activeSession.totalScanned}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-center">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Discrepancies</p>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                    {activeSession.totalDiscrepancies}
                  </p>
                </div>
              </div>

              {/* Rapid Scanner Input (Only if IN_PROGRESS) */}
              {activeSession.status === 'IN_PROGRESS' && (
                <form onSubmit={handleScanBarcode} className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
                    <Scan className="w-4 h-4" />
                    Barcode Scanner Input
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Current Shelf</label>
                      <select
                        value={selectedShelfId}
                        onChange={(e) => setSelectedShelfId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                      >
                        <option value="">-- Any / Unassigned --</option>
                        {availableShelves.map((shelf) => (
                          <option key={shelf.id} value={shelf.id}>
                            Floor {shelf.floor} - Shelf {shelf.shelfCode}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Scan Book Barcode</label>
                      <div className="flex gap-2">
                        <input
                          ref={barcodeInputRef}
                          type="text"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          placeholder="LIB-2026-MAIN-001001..."
                          className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono uppercase tracking-wider focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                          disabled={scanning}
                        />
                        <button
                          type="submit"
                          disabled={scanning || !barcodeInput.trim()}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
                        >
                          {scanning ? '...' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scanner Feedback Box */}
                  {lastScannedResult && (
                    <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                      lastScannedResult.error
                        ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300'
                        : lastScannedResult.data?.status === 'MATCH'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300'
                        : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300'
                    }`}>
                      {lastScannedResult.error ? (
                        <X className="w-4 h-4 shrink-0" />
                      ) : lastScannedResult.data?.status === 'MATCH' ? (
                        <Check className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      )}
                      <span>
                        {lastScannedResult.error
                          ? lastScannedResult.message
                          : `${lastScannedResult.data.scannedBarcode} • ${lastScannedResult.message}`}
                      </span>
                    </div>
                  )}
                </form>
              )}

              {/* Scanned Items Log */}
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">
                  Scanned Items & Verification Log ({activeSession.items?.length || 0})
                </h3>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  {activeSession.items?.length > 0 ? (
                    activeSession.items.map((item) => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-800 dark:text-white truncate">
                            {item.copy?.book?.title || 'Unknown Title'}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {item.scannedBarcode} • Expected: {item.expectedShelf?.shelfCode || 'None'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            item.status === 'MATCH'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : item.status === 'MISPLACED'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : item.status === 'MISSING'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                            {item.status}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(item.scannedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No copies scanned yet in this audit session.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <ClipboardCheck className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Active Stock Audit</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Select a completed session from the right to view results or start a new inventory audit for physical stock verification.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Sessions History List */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              Audit Sessions History
            </h2>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => loadSessionDetails(sess.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    activeSession?.id === sess.id
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {sess.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      sess.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {sess.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    {sess.branch?.name} • {new Date(sess.startedAt).toLocaleDateString()}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Scanned: {sess.totalScanned}/{sess.totalExpected}</span>
                    <span className={sess.totalDiscrepancies > 0 ? 'text-amber-600 font-bold' : ''}>
                      {sess.totalDiscrepancies} discrepancies
                    </span>
                  </div>
                </div>
              ))}

              {sessions.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-6">
                  No previous audit sessions found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                New Inventory Audit
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Library Branch</label>
                <select
                  value={newSessionBranchId}
                  onChange={(e) => setNewSessionBranchId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Session Name</label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g. Q3 Main Library Verification"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Audit Notes (Optional)</label>
                <textarea
                  value={newSessionNotes}
                  onChange={(e) => setNewSessionNotes(e.target.value)}
                  placeholder="Special instructions, shelf targets..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95"
                >
                  {loading ? 'Starting...' : 'Start Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAudits;
