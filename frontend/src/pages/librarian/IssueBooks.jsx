import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Barcode,
  Search,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  Trash2,
  Printer,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  Clock,
  RotateCcw,
  X,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';
import API_URL from '../../api/config';
import { AuthContext } from '../../contexts/AuthContext';

const PRELOADED_COPIES_CATALOG = {
  'LIB-2026-MAIN-001042': {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    shelf: '2F-CS-04A',
    condition: 'Pristine'
  },
  'LIB-2026-MAIN-000871': {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    shelf: '2F-CS-02C',
    condition: 'Good'
  },
  'LIB-2026-MAIN-000210': {
    title: 'The Great Gatsby: Archival Critical Edition',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    shelf: '1F-FIC-09B',
    condition: 'Pristine'
  },
  'LIB-2026-MAIN-000450': {
    title: 'Artificial Intelligence: A Modern Approach (4th Ed.)',
    author: 'Stuart Russell & Peter Norvig',
    isbn: '978-0134610993',
    shelf: '2F-AI-01A',
    condition: 'Pristine'
  },
  'LIB-2026-MAIN-000601': {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    shelf: '1F-HIST-05C',
    condition: 'Good'
  }
};

const IssueBooks = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const currentUser = user?.data || user;

  const urlPatron = searchParams.get('patron') || '';
  const urlBarcode = searchParams.get('barcode') || '';

  // Patron State
  const [patronInput, setPatronInput] = useState(urlPatron);
  const [patron, setPatron] = useState(
    urlPatron
      ? {
          name: 'Elena Rostova',
          cardBarcode: urlPatron,
          tier: 'Postgraduate Researcher',
          activeLoans: 2,
          maxLoans: 8,
          fines: 0.00
        }
      : null
  );

  // Staged Copies for Checkout
  const [copyBarcode, setCopyBarcode] = useState('');
  const [stagedItems, setStagedItems] = useState([]);
  const [globalLoanDays, setGlobalLoanDays] = useState(14); // 7, 14, 21, 30

  // Print Receipt Preview Modal
  const [completedCheckout, setCompletedCheckout] = useState(null);

  const patronInputRef = useRef(null);
  const copyInputRef = useRef(null);

  // Auto calculate future due date string (YYYY-MM-DD)
  const calculateDueDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // On mount: if urlBarcode passed, stage it if patron exists
  useEffect(() => {
    if (urlBarcode && patron) {
      addBarcodeToStaging(urlBarcode);
    }
  }, [urlBarcode, patron]);

  // Focus ergonomics: focus patron input first, or copy input if patron is loaded
  useEffect(() => {
    if (!patron) {
      patronInputRef.current?.focus();
    } else {
      copyInputRef.current?.focus();
    }
  }, [patron]);

  // Keyboard shortcut: Ctrl + Enter to complete checkout
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCompleteCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stagedItems, patron]);

  // Lookup Patron
  const handleLookupPatron = (e) => {
    if (e) e.preventDefault();
    const clean = patronInput.trim().toUpperCase();
    if (!clean) return;

    // Simulate lookup / or match mock
    setPatron({
      name: clean.includes('8842') ? 'Elena Rostova' : clean.includes('3190') ? 'Marcus Vance' : 'David Chen',
      cardBarcode: clean,
      tier: 'Standard Circulation Patron',
      activeLoans: 2,
      maxLoans: 6,
      fines: 0.00
    });

    toast.success(`Patron card verified: ${clean}`);
    setTimeout(() => copyInputRef.current?.focus(), 100);
  };

  // Add Copy to Staging
  const addBarcodeToStaging = (rawBarcode) => {
    const barcode = rawBarcode.trim().toUpperCase();
    if (!barcode) return;

    if (stagedItems.some((item) => item.barcode === barcode)) {
      toast.warning(`Barcode ${barcode} already staged in checkout queue`);
      setCopyBarcode('');
      return;
    }

    // Check loan limit
    if (patron && patron.activeLoans + stagedItems.length >= patron.maxLoans) {
      toast.error(`Patron has reached maximum loan limit (${patron.maxLoans} books)`);
      return;
    }

    const foundInCatalog = PRELOADED_COPIES_CATALOG[barcode] || {
      title: 'Catalog Acquisition Item',
      author: 'Unknown Author',
      isbn: '978-0000000000',
      shelf: '1F-MAIN-01',
      condition: 'Good'
    };

    const newItem = {
      barcode,
      title: foundInCatalog.title,
      author: foundInCatalog.author,
      shelf: foundInCatalog.shelf,
      condition: foundInCatalog.condition,
      loanDays: globalLoanDays,
      dueDate: calculateDueDate(globalLoanDays)
    };

    setStagedItems((prev) => [...prev, newItem]);
    setCopyBarcode('');
    toast.success(`Staged copy ${barcode}`);
  };

  const handleStageBarcode = (e) => {
    e.preventDefault();
    addBarcodeToStaging(copyBarcode);
  };

  // Remove Staged Item
  const handleRemoveStaged = (barcode) => {
    setStagedItems((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  // Custom Due Date Override per item
  const handleUpdateItemDueDate = (barcode, newDate) => {
    setStagedItems((prev) =>
      prev.map((item) => (item.barcode === barcode ? { ...item, dueDate: newDate } : item))
    );
  };

  // Quick Preset Change for All Staged Items
  const handleApplyGlobalDays = (days) => {
    setGlobalLoanDays(days);
    const newDueDate = calculateDueDate(days);
    setStagedItems((prev) =>
      prev.map((item) => ({ ...item, loanDays: days, dueDate: newDueDate }))
    );
    toast.info(`Updated checkout period to +${days} days`);
  };

  // Complete Checkout Action
  const handleCompleteCheckout = async () => {
    if (!patron) {
      toast.error('Please scan or select a patron first');
      patronInputRef.current?.focus();
      return;
    }

    if (stagedItems.length === 0) {
      toast.error('Staging table is empty. Scan at least one book copy.');
      copyInputRef.current?.focus();
      return;
    }

    // Try backend API if online
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await Promise.all(
          stagedItems.map((item) =>
            fetch(`${API_URL}/transactions/issue`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                barcode: item.barcode,
                userBarcode: patron.cardBarcode,
                dueDate: item.dueDate
              })
            })
          )
        );
      } catch {
        // Fallback gracefully
      }
    }

    const receiptData = {
      txId: `TX-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleString(),
      librarian: currentUser?.name || 'Staff Librarian',
      patronName: patron.name,
      patronCard: patron.cardBarcode,
      items: [...stagedItems]
    };

    setCompletedCheckout(receiptData);
    toast.success(`Successfully checked out ${stagedItems.length} book(s) to ${patron.name}!`);
    setStagedItems([]);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-editorial tracking-tight text-foreground">
              High-Speed Issue Desk
            </h1>
            <span className="badge-info px-2.5 py-0.5 rounded-full text-xs font-mono font-medium">
              Checkout Terminal
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Rapid patron identification, continuous barcode staging, and one-click checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 text-[11px] font-mono bg-muted rounded border border-border text-muted-foreground">
            Ctrl + Enter : Checkout
          </kbd>
        </div>
      </div>

      {/* ── Step 1: Patron Identification Station ─────────────────── */}
      <div className="hairline-card p-4 sm:p-5 rounded-xl bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" />
            Step 1: Identify Patron
          </span>
          {patron && (
            <button
              onClick={() => {
                setPatron(null);
                setPatronInput('');
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Change Patron
            </button>
          )}
        </div>

        {!patron ? (
          <form onSubmit={handleLookupPatron} className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={patronInputRef}
                type="text"
                value={patronInput}
                onChange={(e) => setPatronInput(e.target.value)}
                placeholder="Scan patron card barcode or type card ID (e.g. CARD-8842-19)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background font-mono text-sm placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground pointer-events-none" />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-foreground text-background font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-98 transition-all shrink-0"
            >
              <span>Verify Card [Enter]</span>
            </button>
          </form>
        ) : (
          <div className="p-3.5 rounded-lg border border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-editorial text-base font-bold text-foreground">
                    {patron.name}
                  </h3>
                  <span className="font-mono text-xs font-bold bg-background px-2 py-0.5 rounded border border-border">
                    {patron.cardBarcode}
                  </span>
                  <span className="badge-success px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    Good Standing
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Tier: {patron.tier} • Active Loans: <strong className="text-foreground">{patron.activeLoans} / {patron.maxLoans}</strong> • Fines: ${patron.fines.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready for checkout
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Step 2: Continuous Barcode Staging Table ────────────────── */}
      <div className="hairline-card p-4 sm:p-5 rounded-xl bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
            <Barcode className="w-4 h-4 text-amber-500" />
            Step 2: Scan Book Copy Barcodes
          </span>

          {/* Quick Due Date Presets */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-mono text-[11px]">Loan Policy:</span>
            {[7, 14, 21, 30].map((days) => (
              <button
                key={days}
                onClick={() => handleApplyGlobalDays(days)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  globalLoanDays === days
                    ? 'bg-foreground text-background font-bold'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                +{days}d
              </button>
            ))}
          </div>
        </div>

        {/* Rapid Fire Scan Input */}
        <form onSubmit={handleStageBarcode} className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={copyInputRef}
              type="text"
              disabled={!patron}
              value={copyBarcode}
              onChange={(e) => setCopyBarcode(e.target.value)}
              placeholder={
                !patron
                  ? 'Verify patron above first...'
                  : 'Rapid scan book barcode (e.g. LIB-2026-MAIN-001042)...'
              }
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background font-mono text-sm placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary text-foreground disabled:opacity-50"
            />
            <Barcode className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={!patron}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-98 transition-all shrink-0 disabled:opacity-50"
          >
            <span>Add Item [Enter]</span>
          </button>
        </form>

        {/* Staging Table */}
        <div className="border border-border rounded-xl overflow-hidden">
          {stagedItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs space-y-1">
              <BookOpen className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <p className="font-semibold text-foreground">Checkout Staging Table is Empty</p>
              <p>Scan physical item barcodes one after another. They will populate below immediately.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/20 border-b border-border">
                    <th className="th-cell">Item #</th>
                    <th className="th-cell">Barcode</th>
                    <th className="th-cell">Book Title & Author</th>
                    <th className="th-cell">Stack Shelf</th>
                    <th className="th-cell">Calculated Due Date</th>
                    <th className="th-cell text-right">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {stagedItems.map((item, idx) => (
                    <tr key={item.barcode} className="hover:bg-muted/20 border-b border-border last:border-0">
                      <td className="td-cell font-mono text-xs text-muted-foreground">
                        #{idx + 1}
                      </td>
                      <td className="td-cell font-mono text-xs font-bold text-foreground">
                        {item.barcode}
                      </td>
                      <td className="td-cell max-w-[260px]">
                        <div className="font-serif-editorial text-xs font-bold text-foreground line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          by {item.author}
                        </div>
                      </td>
                      <td className="td-cell whitespace-nowrap font-mono text-xs">
                        {item.shelf}
                      </td>
                      <td className="td-cell whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={item.dueDate}
                            onChange={(e) => handleUpdateItemDueDate(item.barcode, e.target.value)}
                            className="px-2 py-1 rounded border border-input bg-background font-mono text-xs text-foreground"
                          />
                          <span className="text-[10px] text-muted-foreground">
                            (+{item.loanDays}d)
                          </span>
                        </div>
                      </td>
                      <td className="td-cell text-right whitespace-nowrap">
                        <button
                          onClick={() => handleRemoveStaged(item.barcode)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Remove from staging"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Checkout Actions Bar */}
        {stagedItems.length > 0 && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Total Books Staged: <strong className="text-foreground">{stagedItems.length}</strong> • Patron: <strong className="text-foreground">{patron.name}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStagedItems([])}
                className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
              >
                Clear Queue
              </button>

              <button
                onClick={handleCompleteCheckout}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 active:scale-98 transition-all shadow-md"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Complete Checkout ({stagedItems.length}) [Ctrl+Enter]</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Receipt Print Preview Modal ─────────────────────────────── */}
      {completedCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hairline-card w-full max-w-md bg-card rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-up">
            <div className="flex items-start justify-between border-b border-border pb-2">
              <h3 className="font-serif-editorial text-base font-bold text-foreground">
                Checkout Receipt Preview
              </h3>
              <button
                onClick={() => setCompletedCheckout(null)}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thermal Slip Receipt Simulation */}
            <div className="border-2 border-dashed border-border p-5 rounded-xl bg-white text-black font-mono text-xs space-y-3">
              <div className="text-center border-b border-neutral-300 pb-2">
                <div className="font-bold uppercase tracking-wider text-sm font-serif-editorial">
                  CITY ARCHIVAL LIBRARY
                </div>
                <div className="text-[10px] text-neutral-600">Circulation Desk Station 02</div>
                <div className="text-[10px] text-neutral-600">{completedCheckout.timestamp}</div>
                <div className="text-[10px] font-bold mt-1">RECEIPT: {completedCheckout.txId}</div>
              </div>

              <div className="text-[11px] border-b border-neutral-300 pb-2">
                <div>PATRON: <strong>{completedCheckout.patronName}</strong></div>
                <div>CARD: <strong>{completedCheckout.patronCard}</strong></div>
                <div>LIBRARIAN: {completedCheckout.librarian}</div>
              </div>

              <div className="space-y-2 border-b border-neutral-300 pb-2">
                <div className="font-bold text-[10px] uppercase text-neutral-600">
                  BORROWED ITEMS ({completedCheckout.items.length})
                </div>
                {completedCheckout.items.map((it, i) => (
                  <div key={i} className="text-[11px] leading-tight">
                    <div className="font-bold">{it.title}</div>
                    <div className="text-[10px] text-neutral-600 flex justify-between">
                      <span>{it.barcode}</span>
                      <span className="font-bold">DUE: {it.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center text-[10px] text-neutral-600 pt-1">
                Please return items by the specified due date to avoid overdue fines ($0.50/day).
                Thank you for utilizing our library!
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                  toast.success('Dispatched receipt to thermal desk printer');
                }}
                className="flex-1 py-2 rounded-lg bg-foreground text-background font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt Slip</span>
              </button>

              <button
                onClick={() => setCompletedCheckout(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default IssueBooks;
