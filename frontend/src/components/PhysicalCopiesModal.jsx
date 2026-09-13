import React, { useState, useEffect } from 'react';
import API_URL from '../api/config';
import axios from 'axios';
import { 
  X, 
  Plus, 
  Layers, 
  Barcode, 
  Building2, 
  MapPin, 
  Check, 
  Sparkles, 
  AlertCircle,
  Copy as CopyIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

const PhysicalCopiesModal = ({ isOpen, onClose, book, onCopyChanged }) => {
  const [copies, setCopies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New copy form state
  const [newCopy, setNewCopy] = useState({
    branchId: '',
    shelfId: '',
    barcode: '',
    accessionNumber: '',
    condition: 'GOOD',
    price: '0'
  });

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    if (isOpen && book) {
      fetchCopiesAndBranches();
    }
  }, [isOpen, book]);

  const fetchCopiesAndBranches = async () => {
    try {
      setLoading(true);
      const [copiesRes, branchesRes] = await Promise.all([
        axios.get(`${API_URL}/copies?bookId=${book.id || book._id}`, getAuthConfig()),
        axios.get(`${API_URL}/branches`, getAuthConfig())
      ]);

      setCopies(copiesRes.data.data || []);
      const bList = (branchesRes.data.data || []).filter((b) => b.isActive);
      setBranches(bList);

      if (bList.length > 0) {
        setNewCopy((prev) => ({ ...prev, branchId: bList[0].id }));
        loadShelves(bList[0].id);
      }
    } catch (err) {
      console.error('Failed to load copies:', err);
      toast.error('Failed to load physical copies');
    } finally {
      setLoading(false);
    }
  };

  const loadShelves = async (branchId) => {
    if (!branchId) return;
    try {
      const res = await axios.get(`${API_URL}/branches/${branchId}`, getAuthConfig());
      const sList = res.data.data.shelves || [];
      setShelves(sList);
      if (sList.length > 0) {
        setNewCopy((prev) => ({ ...prev, shelfId: sList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load shelves:', err);
    }
  };

  const handleBranchChange = (branchId) => {
    setNewCopy((prev) => ({ ...prev, branchId }));
    loadShelves(branchId);
  };

  const generateBarcodeAndAccession = async () => {
    try {
      const branch = branches.find((b) => b.id === newCopy.branchId);
      const branchCode = branch ? branch.code : 'MAIN';
      const res = await axios.get(`${API_URL}/copies/generate-barcode?branch=${branchCode}`, getAuthConfig());
      setNewCopy((prev) => ({
        ...prev,
        barcode: res.data.data.barcode,
        accessionNumber: res.data.data.accessionNumber
      }));
      toast.info('Generated new barcode & accession number');
    } catch (err) {
      toast.error('Failed to generate barcode');
    }
  };

  const handleAddCopy = async (e) => {
    e.preventDefault();
    if (!newCopy.barcode || !newCopy.accessionNumber || !newCopy.branchId) {
      toast.error('Branch, Barcode, and Accession Number are required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_URL}/copies`, {
        bookId: book.id || book._id,
        barcode: newCopy.barcode.trim().toUpperCase(),
        accessionNumber: newCopy.accessionNumber.trim().toUpperCase(),
        branchId: newCopy.branchId,
        shelfId: newCopy.shelfId || null,
        condition: newCopy.condition,
        priceCents: Math.round(parseFloat(newCopy.price || 0) * 100)
      }, getAuthConfig());

      toast.success(res.data.message || 'Physical copy registered!');
      setShowAddForm(false);
      setNewCopy((prev) => ({ ...prev, barcode: '', accessionNumber: '' }));
      await fetchCopiesAndBranches();
      if (onCopyChanged) onCopyChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add copy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (copyId, newStatus, newCondition) => {
    try {
      await axios.patch(`${API_URL}/copies/${copyId}/status`, {
        status: newStatus,
        condition: newCondition
      }, getAuthConfig());

      toast.success(`Copy updated to ${newStatus}`);
      await fetchCopiesAndBranches();
      if (onCopyChanged) onCopyChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update copy status');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Physical Inventory Copies
              </h2>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                {book?.title}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ISBN: {book?.isbn || book?.isbn13 || 'N/A'} • Total Registered Copies: {copies.length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Asset Inventory List
          </span>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm && !newCopy.barcode) {
                generateBarcodeAndAccession();
              }
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Add Form' : 'Register New Physical Copy'}
          </button>
        </div>

        {/* Add Copy Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleAddCopy} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-900/50 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Barcode className="w-4 h-4 text-indigo-600" />
                Add Physical Book Copy
              </h3>
              <button
                type="button"
                onClick={generateBarcodeAndAccession}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Generate Barcode
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Branch</label>
                <select
                  value={newCopy.branchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Shelf Location</label>
                <select
                  value={newCopy.shelfId}
                  onChange={(e) => setNewCopy({ ...newCopy, shelfId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Unassigned --</option>
                  {shelves.map((s) => (
                    <option key={s.id} value={s.id}>Floor {s.floor} - {s.shelfCode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Barcode</label>
                <input
                  type="text"
                  value={newCopy.barcode}
                  onChange={(e) => setNewCopy({ ...newCopy, barcode: e.target.value })}
                  placeholder="LIB-2026-MAIN-001001"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Accession Number</label>
                <input
                  type="text"
                  value={newCopy.accessionNumber}
                  onChange={(e) => setNewCopy({ ...newCopy, accessionNumber: e.target.value })}
                  placeholder="ACC-2026-000101"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Condition</label>
                <select
                  value={newCopy.condition}
                  onChange={(e) => setNewCopy({ ...newCopy, condition: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="NEW">NEW</option>
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="GOOD">GOOD</option>
                  <option value="FAIR">FAIR</option>
                  <option value="POOR">POOR</option>
                  <option value="DAMAGED">DAMAGED</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Replacement Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={newCopy.price}
                  onChange={(e) => setNewCopy({ ...newCopy, price: e.target.value })}
                  placeholder="500"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  {submitting ? 'Creating...' : 'Register Copy Asset'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Copies Table */}
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Barcode & Accession</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading copies...</td>
                </tr>
              ) : copies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No physical copies registered for this book yet. Click "Register New Physical Copy" above.
                  </td>
                </tr>
              ) : (
                copies.map((copy) => (
                  <tr key={copy.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white">
                        <span>{copy.barcode}</span>
                        <button
                          onClick={() => copyToClipboard(copy.barcode)}
                          title="Copy barcode"
                          className="p-1 text-slate-400 hover:text-indigo-600"
                        >
                          <CopyIcon className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Acc: {copy.accessionNumber}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {copy.branch ? copy.branch.name : 'Unassigned'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Shelf: {copy.shelf ? copy.shelf.shelfCode : 'Unassigned'}
                      </p>
                    </td>

                    <td className="p-3.5 font-bold">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                        copy.condition === 'NEW' || copy.condition === 'EXCELLENT'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : copy.condition === 'GOOD'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {copy.condition}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        copy.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : copy.status === 'ON_LOAN'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : copy.status === 'RESERVED'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {copy.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <select
                        value={copy.status}
                        onChange={(e) => handleStatusChange(copy.id, e.target.value, copy.condition)}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 outline-none"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="ON_LOAN" disabled>ON_LOAN</option>
                        <option value="RESERVED" disabled>RESERVED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="DAMAGED">DAMAGED</option>
                        <option value="LOST">LOST</option>
                        <option value="WITHDRAWN">WITHDRAWN</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PhysicalCopiesModal;
