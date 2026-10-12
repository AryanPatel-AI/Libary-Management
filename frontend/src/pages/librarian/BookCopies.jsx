import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Barcode,
  Search,
  Plus,
  Filter,
  Printer,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Layers,
  MapPin,
  X,
  Sparkles,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import API_URL from '../../api/config';

const INITIAL_COPIES = [
  {
    id: 'cp-101',
    barcode: 'LIB-2026-MAIN-001042',
    accessionNumber: 'ACC-2026-000411',
    bookTitle: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    shelfLocation: '2F-CS-04A',
    binding: 'Hardcover',
    condition: 'Pristine',
    acquisitionCost: 49.99,
    status: 'AVAILABLE',
    branch: 'Main Library',
    lastInventoryDate: '2026-09-01'
  },
  {
    id: 'cp-102',
    barcode: 'LIB-2026-MAIN-001043',
    accessionNumber: 'ACC-2026-000412',
    bookTitle: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    shelfLocation: '2F-CS-04A',
    binding: 'Paperback',
    condition: 'Good',
    acquisitionCost: 38.50,
    status: 'AVAILABLE',
    branch: 'Main Library',
    lastInventoryDate: '2026-09-01'
  },
  {
    id: 'cp-103',
    barcode: 'LIB-2026-MAIN-001044',
    accessionNumber: 'ACC-2026-000413',
    bookTitle: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    shelfLocation: '2F-CS-04A',
    binding: 'Paperback',
    condition: 'Good',
    acquisitionCost: 38.50,
    status: 'LOANED',
    branch: 'Main Library',
    lastInventoryDate: '2026-08-15'
  },
  {
    id: 'cp-104',
    barcode: 'LIB-2026-MAIN-000871',
    accessionNumber: 'ACC-2026-000301',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    shelfLocation: '2F-CS-02C',
    binding: 'Paperback',
    condition: 'Fair',
    acquisitionCost: 42.00,
    status: 'LOANED',
    branch: 'Main Library',
    lastInventoryDate: '2026-08-20'
  },
  {
    id: 'cp-105',
    barcode: 'LIB-2026-MAIN-000872',
    accessionNumber: 'ACC-2026-000302',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    shelfLocation: '2F-CS-02C',
    binding: 'Paperback',
    condition: 'Damaged',
    acquisitionCost: 42.00,
    status: 'MAINTENANCE',
    branch: 'Main Library',
    notes: 'Torn spine on page 112 • Bookbinder staging',
    lastInventoryDate: '2026-09-10'
  },
  {
    id: 'cp-106',
    barcode: 'LIB-2026-MAIN-000210',
    accessionNumber: 'ACC-2026-000089',
    bookTitle: 'The Great Gatsby: Archival Critical Edition',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    shelfLocation: '1F-FIC-09B',
    binding: 'Archival Binding',
    condition: 'Pristine',
    acquisitionCost: 65.00,
    status: 'AVAILABLE',
    branch: 'Main Library (Rare/Archival Stacks)',
    lastInventoryDate: '2026-09-05'
  },
  {
    id: 'cp-107',
    barcode: 'LIB-2026-MAIN-000212',
    accessionNumber: 'ACC-2026-000091',
    bookTitle: 'The Great Gatsby: Archival Critical Edition',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    shelfLocation: '1F-FIC-09B',
    binding: 'Paperback',
    condition: 'Lost',
    acquisitionCost: 18.00,
    status: 'LOST',
    branch: 'Main Library',
    notes: 'Unreturned after 60 days • Patron replacement fee charged',
    lastInventoryDate: '2026-07-12'
  },
  {
    id: 'cp-108',
    barcode: 'LIB-2026-MAIN-000450',
    accessionNumber: 'ACC-2026-000155',
    bookTitle: 'Artificial Intelligence: A Modern Approach (4th Ed.)',
    author: 'Stuart Russell & Peter Norvig',
    isbn: '978-0134610993',
    shelfLocation: '2F-AI-01A',
    binding: 'Hardcover',
    condition: 'Pristine',
    acquisitionCost: 110.00,
    status: 'AVAILABLE',
    branch: 'Main Library',
    lastInventoryDate: '2026-09-08'
  }
];

const BookCopies = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [copies, setCopies] = useState(INITIAL_COPIES);
  const [search, setSearch] = useState(initialSearch);
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bindingFilter, setBindingFilter] = useState('ALL');

  // Modals
  const [editCopyModal, setEditCopyModal] = useState(null);
  const [printLabelModal, setPrintLabelModal] = useState(null);
  const [newCopyModal, setNewCopyModal] = useState(false);

  // New Copy Form State
  const [newForm, setNewForm] = useState({
    bookTitle: '',
    author: '',
    isbn: '',
    shelfLocation: '1F-FIC-01A',
    binding: 'Hardcover',
    condition: 'Pristine',
    acquisitionCost: 29.99,
    branch: 'Main Library'
  });

  // Filter logic
  const filteredCopies = copies.filter((cp) => {
    const matchSearch =
      cp.barcode.toLowerCase().includes(search.toLowerCase()) ||
      cp.accessionNumber.toLowerCase().includes(search.toLowerCase()) ||
      cp.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      cp.shelfLocation.toLowerCase().includes(search.toLowerCase()) ||
      cp.isbn.includes(search);

    const matchCondition = conditionFilter === 'ALL' || cp.condition === conditionFilter;
    const matchStatus = statusFilter === 'ALL' || cp.status === statusFilter;
    const matchBinding = bindingFilter === 'ALL' || cp.binding === bindingFilter;

    return matchSearch && matchCondition && matchStatus && matchBinding;
  });

  // Summary Metrics
  const totalTracked = copies.length;
  const availableCount = copies.filter((c) => c.status === 'AVAILABLE').length;
  const loanedCount = copies.filter((c) => c.status === 'LOANED').length;
  const maintenanceCount = copies.filter((c) => c.status === 'MAINTENANCE' || c.condition === 'Damaged').length;
  const totalValue = copies.reduce((sum, c) => sum + (c.acquisitionCost || 0), 0).toFixed(2);

  // Update Status & Condition Action
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editCopyModal) return;

    setCopies((prev) =>
      prev.map((c) => (c.id === editCopyModal.id ? editCopyModal : c))
    );
    toast.success(`Copy ${editCopyModal.barcode} updated successfully`);
    setEditCopyModal(null);
  };

  // Register New Copy Action
  const handleRegisterNewCopy = (e) => {
    e.preventDefault();
    const count = copies.length + 1;
    const year = new Date().getFullYear();
    const generatedBarcode = `LIB-${year}-MAIN-${String(count).padStart(6, '0')}`;
    const generatedAccession = `ACC-${year}-${String(count).padStart(6, '0')}`;

    const newEntry = {
      id: `cp-${Date.now()}`,
      barcode: generatedBarcode,
      accessionNumber: generatedAccession,
      bookTitle: newForm.bookTitle || 'Untitled Catalog Item',
      author: newForm.author || 'Unknown Author',
      isbn: newForm.isbn || '978-0000000000',
      shelfLocation: newForm.shelfLocation,
      binding: newForm.binding,
      condition: newForm.condition,
      acquisitionCost: parseFloat(newForm.acquisitionCost) || 0,
      status: 'AVAILABLE',
      branch: newForm.branch,
      lastInventoryDate: new Date().toISOString().split('T')[0]
    };

    setCopies([newEntry, ...copies]);
    toast.success(`Registered new copy with barcode ${generatedBarcode}`);
    setNewCopyModal(false);
  };

  return (
    <div className="space-y-6">

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-editorial tracking-tight text-foreground">
              Physical Copy Tracking
            </h1>
            <span className="badge-info px-2.5 py-0.5 rounded-full text-xs font-mono font-medium">
              Accession Ledger
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage individual barcodes, binding types, physical conditions, and shelf allocations.
          </p>
        </div>

        <button
          onClick={() => setNewCopyModal(true)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-98 transition-all shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Copy</span>
        </button>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="hairline-card metric-blue p-4 rounded-xl bg-card">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Total Copies
          </span>
          <div className="mt-1 text-2xl font-bold font-serif-editorial text-foreground">
            {totalTracked}
          </div>
          <span className="text-[11px] text-muted-foreground">Active in catalog</span>
        </div>

        <div className="hairline-card metric-green p-4 rounded-xl bg-card">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Available
          </span>
          <div className="mt-1 text-2xl font-bold font-serif-editorial text-emerald-600 dark:text-emerald-400">
            {availableCount}
          </div>
          <span className="text-[11px] text-muted-foreground">On shelf stacks</span>
        </div>

        <div className="hairline-card metric-purple p-4 rounded-xl bg-card">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            In Circulation
          </span>
          <div className="mt-1 text-2xl font-bold font-serif-editorial text-purple-600 dark:text-purple-400">
            {loanedCount}
          </div>
          <span className="text-[11px] text-muted-foreground">Checked out to patrons</span>
        </div>

        <div className="hairline-card metric-amber p-4 rounded-xl bg-card">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Damaged / Repair
          </span>
          <div className="mt-1 text-2xl font-bold font-serif-editorial text-amber-600 dark:text-amber-400">
            {maintenanceCount}
          </div>
          <span className="text-[11px] text-muted-foreground">Requires bindery</span>
        </div>

        <div className="hairline-card metric-red p-4 rounded-xl bg-card">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Asset Value
          </span>
          <div className="mt-1 text-2xl font-bold font-serif-editorial text-foreground">
            ${totalValue}
          </div>
          <span className="text-[11px] text-muted-foreground">Acquisition total</span>
        </div>
      </div>

      {/* ── Search & Filter Ergonomics ─────────────────────────────── */}
      <div className="hairline-card p-4 rounded-xl bg-card space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by barcode (LIB-...), accession (ACC-...), book title, shelf stack..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background font-mono text-sm placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Conditions</option>
              <option value="Pristine">Pristine</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
              <option value="Lost">Lost</option>
            </select>

            <select
              value={bindingFilter}
              onChange={(e) => setBindingFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Bindings</option>
              <option value="Hardcover">Hardcover</option>
              <option value="Paperback">Paperback</option>
              <option value="Archival Binding">Archival Binding</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="LOANED">Loaned</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span>Displaying {filteredCopies.length} physical copies</span>
          <span>Click "Label" to generate printable thermal barcode sticker</span>
        </div>
      </div>

      {/* ── Copies Ledger Table ────────────────────────────────────── */}
      <div className="hairline-card rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="th-cell">Barcode & Accession</th>
                <th className="th-cell">Book Title & Author</th>
                <th className="th-cell">Shelf Stack</th>
                <th className="th-cell">Binding</th>
                <th className="th-cell">Condition</th>
                <th className="th-cell">Acq. Cost</th>
                <th className="th-cell">Status</th>
                <th className="th-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCopies.map((cp) => {
                const isDamaged = cp.condition === 'Damaged';
                const isLost = cp.condition === 'Lost' || cp.status === 'LOST';

                return (
                  <tr key={cp.id} className="hover:bg-muted/30 transition-colors">
                    {/* Barcode & Accession */}
                    <td className="td-cell whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{cp.barcode}</span>
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {cp.accessionNumber}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="td-cell max-w-[240px]">
                      <div className="font-serif-editorial text-xs font-bold text-foreground line-clamp-1">
                        {cp.bookTitle}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">
                        {cp.author}
                      </div>
                      {cp.notes && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 line-clamp-1">
                          Note: {cp.notes}
                        </div>
                      )}
                    </td>

                    {/* Shelf */}
                    <td className="td-cell whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded border border-border">
                        {cp.shelfLocation}
                      </span>
                    </td>

                    {/* Binding */}
                    <td className="td-cell whitespace-nowrap text-xs">
                      {cp.binding === 'Archival Binding' ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          Archival
                        </span>
                      ) : (
                        cp.binding
                      )}
                    </td>

                    {/* Condition */}
                    <td className="td-cell whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cp.condition === 'Pristine'
                            ? 'badge-success'
                            : cp.condition === 'Good'
                            ? 'badge-info'
                            : cp.condition === 'Fair'
                            ? 'badge-neutral'
                            : cp.condition === 'Damaged'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {cp.condition}
                      </span>
                    </td>

                    {/* Acquisition Cost */}
                    <td className="td-cell whitespace-nowrap font-mono text-xs text-foreground">
                      ${cp.acquisitionCost?.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="td-cell whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          cp.status === 'AVAILABLE'
                            ? 'badge-success'
                            : cp.status === 'LOANED'
                            ? 'badge-info'
                            : cp.status === 'MAINTENANCE'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {cp.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="td-cell text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPrintLabelModal(cp)}
                          className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Print Spine Barcode Label"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEditCopyModal(cp)}
                          className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-colors"
                          title="Update Status / Condition"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Update Status / Condition ────────────────────────── */}
      {editCopyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hairline-card w-full max-w-lg bg-card rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-up">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Copy Ledger Update
                </span>
                <h3 className="font-serif-editorial text-lg font-bold text-foreground">
                  {editCopyModal.barcode}
                </h3>
                <p className="text-xs text-muted-foreground">{editCopyModal.bookTitle}</p>
              </div>
              <button
                onClick={() => setEditCopyModal(null)}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Physical Condition
                  </label>
                  <select
                    value={editCopyModal.condition}
                    onChange={(e) =>
                      setEditCopyModal({ ...editCopyModal, condition: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs font-semibold"
                  >
                    <option value="Pristine">Pristine</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Operational Status
                  </label>
                  <select
                    value={editCopyModal.status}
                    onChange={(e) =>
                      setEditCopyModal({ ...editCopyModal, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs font-semibold font-mono"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="LOANED">LOANED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="LOST">LOST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    value={editCopyModal.shelfLocation}
                    onChange={(e) =>
                      setEditCopyModal({ ...editCopyModal, shelfLocation: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Acquisition Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCopyModal.acquisitionCost}
                    onChange={(e) =>
                      setEditCopyModal({
                        ...editCopyModal,
                        acquisitionCost: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Condition / Maintenance Notes
                </label>
                <textarea
                  rows={2}
                  value={editCopyModal.notes || ''}
                  onChange={(e) =>
                    setEditCopyModal({ ...editCopyModal, notes: e.target.value })
                  }
                  placeholder="e.g. Spine taped, minor water mark on back cover..."
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditCopyModal(null)}
                  className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Print Barcode Label ──────────────────────────────── */}
      {printLabelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hairline-card w-full max-w-sm bg-card rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-up">
            <div className="flex items-start justify-between border-b border-border pb-2">
              <h3 className="font-serif-editorial text-base font-bold text-foreground">
                Thermal Label Preview
              </h3>
              <button
                onClick={() => setPrintLabelModal(null)}
                className="p-1 rounded border border-border hover:bg-muted text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thermal Spine Label Simulation */}
            <div className="border-2 border-dashed border-border p-4 rounded-xl bg-white text-black text-center space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
                CITY ARCHIVAL LIBRARY
              </div>
              <div className="font-serif-editorial text-xs font-bold leading-snug line-clamp-2">
                {printLabelModal.bookTitle}
              </div>
              <div className="py-2 flex flex-col items-center justify-center">
                {/* Simulated Barcode Stripes */}
                <div className="h-10 w-44 bg-repeating-linear-gradient flex items-stretch justify-center gap-0.5">
                  <div className="w-1 bg-black" />
                  <div className="w-0.5 bg-black" />
                  <div className="w-2 bg-black" />
                  <div className="w-0.5 bg-black" />
                  <div className="w-1.5 bg-black" />
                  <div className="w-1 bg-black" />
                  <div className="w-0.5 bg-black" />
                  <div className="w-2.5 bg-black" />
                  <div className="w-1 bg-black" />
                  <div className="w-0.5 bg-black" />
                  <div className="w-1 bg-black" />
                  <div className="w-2 bg-black" />
                  <div className="w-0.5 bg-black" />
                  <div className="w-1.5 bg-black" />
                </div>
                <div className="font-mono text-xs font-bold tracking-widest mt-1">
                  {printLabelModal.barcode}
                </div>
              </div>
              <div className="font-mono text-[11px] font-bold border-t border-neutral-300 pt-1">
                STACK: {printLabelModal.shelfLocation}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                  toast.success('Dispatched to thermal label printer');
                }}
                className="flex-1 py-2 rounded-lg bg-foreground text-background font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Label</span>
              </button>
              <button
                onClick={() => setPrintLabelModal(null)}
                className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Register New Physical Copy ───────────────────────── */}
      {newCopyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hairline-card w-full max-w-lg bg-card rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-up">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Accession Registry
                </span>
                <h3 className="font-serif-editorial text-lg font-bold text-foreground">
                  Register New Physical Copy
                </h3>
              </div>
              <button
                onClick={() => setNewCopyModal(false)}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewCopy} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  value={newForm.bookTitle}
                  onChange={(e) => setNewForm({ ...newForm, bookTitle: e.target.value })}
                  placeholder="e.g. Clean Code"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.author}
                    onChange={(e) => setNewForm({ ...newForm, author: e.target.value })}
                    placeholder="Robert C. Martin"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.isbn}
                    onChange={(e) => setNewForm({ ...newForm, isbn: e.target.value })}
                    placeholder="978-0132350884"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.shelfLocation}
                    onChange={(e) => setNewForm({ ...newForm, shelfLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Binding
                  </label>
                  <select
                    value={newForm.binding}
                    onChange={(e) => setNewForm({ ...newForm, binding: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs"
                  >
                    <option value="Hardcover">Hardcover</option>
                    <option value="Paperback">Paperback</option>
                    <option value="Archival Binding">Archival Binding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Condition
                  </label>
                  <select
                    value={newForm.condition}
                    onChange={(e) => setNewForm({ ...newForm, condition: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs"
                  >
                    <option value="Pristine">Pristine</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Acquisition Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newForm.acquisitionCost}
                  onChange={(e) => setNewForm({ ...newForm, acquisitionCost: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setNewCopyModal(false)}
                  className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
                >
                  Generate Barcode & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookCopies;
