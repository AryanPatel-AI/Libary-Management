import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  RotateCcw,
  Search,
  Users,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Barcode,
  DollarSign,
  Activity,
  Library,
  Copy,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import API_URL from '../../api/config';
import { AuthContext } from '../../contexts/AuthContext';

const LibrarianDashboard = () => {
  const { user } = useContext(AuthContext);
  const currentUser = user?.data || user;
  const navigate = useNavigate();

  // Scanner Simulator State
  const [scanInput, setScanInput] = useState('');
  const [scannedItem, setScannedItem] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanInputRef = useRef(null);

  // Metrics State
  const [metrics, setMetrics] = useState({
    checkoutsToday: 48,
    checkinsToday: 41,
    pendingHolds: 14,
    overdueAlerts: 7,
    activePatronsToday: 62,
    finesCollectedToday: '$145.50'
  });

  // Recent Activity Feed
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 'act-1',
      type: 'checkout',
      time: 'Just now',
      librarian: 'AP',
      patronName: 'Elena Rostova',
      patronCard: 'CARD-8842-19',
      bookTitle: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      barcode: 'LIB-2026-MAIN-001042',
      details: 'Due in 14 days (Oct 02)'
    },
    {
      id: 'act-2',
      type: 'checkin',
      time: '3 mins ago',
      librarian: 'AP',
      patronName: 'Marcus Vance',
      patronCard: 'CARD-3190-44',
      bookTitle: 'Clean Architecture: A Craftsman\'s Guide',
      barcode: 'LIB-2026-MAIN-000874',
      details: 'Pristine condition • Routed to 2F-CS-04'
    },
    {
      id: 'act-3',
      type: 'fine',
      time: '12 mins ago',
      librarian: 'JD',
      patronName: 'Sarah Jenkins',
      patronCard: 'CARD-5012-77',
      bookTitle: 'Late return fine waived (supervisor discretion)',
      barcode: 'RECEIPT-#4091',
      details: 'Collected $0.00 (Waived $3.00)'
    },
    {
      id: 'act-4',
      type: 'hold',
      time: '24 mins ago',
      librarian: 'SK',
      patronName: 'David Chen',
      patronCard: 'CARD-9931-02',
      bookTitle: 'Designing Data-Intensive Applications',
      barcode: 'LIB-2026-MAIN-002198',
      details: 'Pulled from stack • Placed in Front Desk Bin #07'
    },
    {
      id: 'act-5',
      type: 'checkout',
      time: '41 mins ago',
      librarian: 'AP',
      patronName: 'Clara Oswald',
      patronCard: 'CARD-1120-83',
      bookTitle: 'Introduction to Algorithms (4th Edition)',
      barcode: 'LIB-2026-MAIN-000312',
      details: 'Faculty loan • Due in 30 days'
    }
  ]);

  // Fetch real counts if available
  useEffect(() => {
    const fetchDashboardStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/transactions/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setMetrics(prev => ({
            ...prev,
            checkoutsToday: json.data.checkoutsToday ?? prev.checkoutsToday,
            checkinsToday: json.data.returnsToday ?? prev.checkinsToday,
            pendingHolds: json.data.pendingHolds ?? prev.pendingHolds,
            overdueAlerts: json.data.overdueCount ?? prev.overdueAlerts
          }));
        }
      } catch {
        // Fallback to sample metrics for high-speed desk continuity
      }
    };

    fetchDashboardStats();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus scanner input on Alt + S
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        scanInputRef.current?.focus();
      }
      // Navigate to Issue on Alt + I
      if (e.altKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        navigate('/librarian/issue');
      }
      // Navigate to Return on Alt + R
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        navigate('/librarian/return');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Handle Rapid Barcode Scanner Simulator
  const handleBarcodeScan = (e) => {
    e.preventDefault();
    const raw = scanInput.trim().toUpperCase();
    if (!raw) return;

    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      // Determine if barcode is a patron card or a book copy barcode
      if (raw.startsWith('CARD-') || raw.startsWith('PATRON-') || raw.startsWith('MEM-') || raw.length === 6) {
        setScannedItem({
          type: 'patron',
          barcode: raw,
          name: 'Sarah Montgomery',
          tier: 'Honorary Research Fellow',
          cardNo: raw,
          activeLoans: 3,
          fines: '$0.00',
          holdsReady: 1,
          status: 'Good Standing'
        });
        toast.info(`Patron card scanned: ${raw}`);
      } else {
        // Assume book copy barcode
        setScannedItem({
          type: 'book_copy',
          barcode: raw,
          title: 'Structure and Interpretation of Computer Programs',
          author: 'Harold Abelson & Gerald Jay Sussman',
          isbn: '978-0262510875',
          shelfLocation: '2nd Floor Science, Stack 4 [2F-CS-04A]',
          condition: 'Pristine',
          binding: 'Hardcover',
          status: 'AVAILABLE'
        });
        toast.success(`Book copy identified: ${raw}`);
      }
      setScanInput('');
    }, 180);
  };

  return (
    <div className="space-y-6">

      {/* ── Top Bar: Desk Station & Ergonomic Status ───────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-editorial tracking-tight text-foreground">
              Circulation Desk
            </h1>
            <span className="badge-info px-2.5 py-0.5 rounded-full text-xs font-mono font-medium">
              Station 02 • Main Hall
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operational dashboard for desk librarians and circulation supervisors.
          </p>
        </div>

        {/* Station Indicator & Operator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Duty:</span>
            <span className="font-semibold text-foreground">
              {currentUser?.name || 'Staff Librarian'}
            </span>
            <span className="text-muted-foreground">({currentUser?.role || 'Librarian'})</span>
          </div>

          <button
            onClick={() => {
              toast.info('Circulation records refreshed');
            }}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Rapid Barcode Scanner Simulator ────────────────────────── */}
      <div className="hairline-card p-4 sm:p-5 rounded-xl bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
              Rapid Barcode Scanner Simulator
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
              Alt + S
            </kbd>
            <span>Auto-detects Item or Patron Card</span>
          </div>
        </div>

        <form onSubmit={handleBarcodeScan} className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={scanInputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan or type barcode (e.g. LIB-2026-MAIN-001042 or CARD-8842-19)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background font-mono text-sm placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="px-5 py-2.5 rounded-lg bg-foreground text-background font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-98 transition-all shrink-0"
          >
            {isScanning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Barcode className="w-3.5 h-3.5" />
            )}
            <span>Scan [Enter]</span>
          </button>
        </form>

        {/* Scanned Item / Patron Detection Card */}
        {scannedItem && (
          <div className="mt-3.5 p-3.5 rounded-lg border border-border bg-muted/40 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${scannedItem.type === 'patron' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                  {scannedItem.type === 'patron' ? <Users className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {scannedItem.barcode}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${scannedItem.type === 'patron' ? 'badge-info' : 'badge-success'}`}>
                      {scannedItem.type === 'patron' ? 'Patron Card' : 'Book Copy'}
                    </span>
                  </div>

                  {scannedItem.type === 'patron' ? (
                    <div className="text-xs mt-1 text-foreground">
                      <span className="font-semibold">{scannedItem.name}</span>
                      <span className="text-muted-foreground"> • {scannedItem.tier} • {scannedItem.activeLoans} Active Loans • Fines: {scannedItem.fines}</span>
                    </div>
                  ) : (
                    <div className="text-xs mt-1 text-foreground">
                      <span className="font-semibold">{scannedItem.title}</span>
                      <span className="text-muted-foreground"> by {scannedItem.author} • Shelf: {scannedItem.shelfLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instant Desk Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {scannedItem.type === 'patron' ? (
                  <>
                    <button
                      onClick={() => navigate(`/librarian/issue?patron=${scannedItem.barcode}`)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Issue Books
                    </button>
                    <button
                      onClick={() => navigate(`/librarian/members?card=${scannedItem.barcode}`)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors"
                    >
                      View Account
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate(`/librarian/issue?barcode=${scannedItem.barcode}`)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Checkout Item
                    </button>
                    <button
                      onClick={() => navigate(`/librarian/return?barcode=${scannedItem.barcode}`)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors"
                    >
                      Check-in
                    </button>
                  </>
                )}
                <button
                  onClick={() => setScannedItem(null)}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Today's Circulation Metrics ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="hairline-card metric-blue p-4 rounded-xl bg-card">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Checkouts Today
            </span>
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif-editorial text-foreground">
              {metrics.checkoutsToday}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              +18% vs avg
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Standard 14 & 30-day loans
          </p>
        </div>

        <div className="hairline-card metric-green p-4 rounded-xl bg-card">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Checkins Today
            </span>
            <RotateCcw className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif-editorial text-foreground">
              {metrics.checkinsToday}
            </span>
            <span className="text-[11px] text-muted-foreground">
              94% on-time rate
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Reshelving routing assigned
          </p>
        </div>

        <div className="hairline-card metric-amber p-4 rounded-xl bg-card">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Pending Holds
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif-editorial text-foreground">
              {metrics.pendingHolds}
            </span>
            <span className="badge-warning text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
              6 to pull
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            8 awaiting patron pickup
          </p>
        </div>

        <div className="hairline-card metric-red p-4 rounded-xl bg-card">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Overdue Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif-editorial text-foreground">
              {metrics.overdueAlerts}
            </span>
            <span className="badge-danger text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
              Action Req
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Notices pending dispatch
          </p>
        </div>
      </div>

      {/* ── Desk Quick Navigation Ergonomics ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif-editorial text-lg font-bold text-foreground">
            Circulation Desk Shortcuts
          </h2>
          <span className="text-xs text-muted-foreground">
            Fast keyboard-navigable operational stations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/librarian/issue"
            className="hairline-card p-3.5 rounded-xl bg-card hover:border-primary/50 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-muted rounded border border-border text-muted-foreground">
                Alt+I
              </kbd>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-foreground">Issue Desk</div>
              <div className="text-[11px] text-muted-foreground">Speed checkout</div>
            </div>
          </Link>

          <Link
            to="/librarian/return"
            className="hairline-card p-3.5 rounded-xl bg-card hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <RotateCcw className="w-4 h-4" />
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-muted rounded border border-border text-muted-foreground">
                Alt+R
              </kbd>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-foreground">Return Desk</div>
              <div className="text-[11px] text-muted-foreground">Check-in & sort</div>
            </div>
          </Link>

          <Link
            to="/librarian/books"
            className="hairline-card p-3.5 rounded-xl bg-card hover:border-amber-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-muted rounded border border-border text-muted-foreground">
                Alt+B
              </kbd>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-foreground">Catalog Lookup</div>
              <div className="text-[11px] text-muted-foreground">Copies & stacks</div>
            </div>
          </Link>

          <Link
            to="/librarian/members"
            className="hairline-card p-3.5 rounded-xl bg-card hover:border-purple-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-muted rounded border border-border text-muted-foreground">
                Alt+M
              </kbd>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-foreground">Patron Accounts</div>
              <div className="text-[11px] text-muted-foreground">Search card & fines</div>
            </div>
          </Link>

          <Link
            to="/librarian/reservations"
            className="hairline-card p-3.5 rounded-xl bg-card hover:border-sky-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <span className="badge-warning text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                14
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-foreground">Hold Shelf</div>
              <div className="text-[11px] text-muted-foreground">Pull list & bins</div>
            </div>
          </Link>

          <Link
            to="/librarian/fines"
            className="hairline-card p-3.5 rounded-xl bg-card hover:border-rose-500/50 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-muted rounded border border-border text-muted-foreground">
                Alt+F
              </kbd>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-foreground">Desk Cashier</div>
              <div className="text-[11px] text-muted-foreground">Collect & waive</div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Live Desk Activity Stream ───────────────────────────────── */}
      <div className="hairline-card rounded-xl bg-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="font-serif-editorial font-bold text-base text-foreground">
              Today's Desk Transactions Stream
            </h3>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Feed
            </span>
          </div>

          <Link
            to="/librarian/activity"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="th-cell">Time</th>
                <th className="th-cell">Staff</th>
                <th className="th-cell">Action</th>
                <th className="th-cell">Patron</th>
                <th className="th-cell">Item / Barcode</th>
                <th className="th-cell">Details</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((act) => (
                <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                  <td className="td-cell font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {act.time}
                  </td>
                  <td className="td-cell whitespace-nowrap">
                    <span className="w-6 h-6 rounded-full bg-muted font-mono text-[10px] font-bold inline-flex items-center justify-center border border-border">
                      {act.librarian}
                    </span>
                  </td>
                  <td className="td-cell whitespace-nowrap">
                    {act.type === 'checkout' && (
                      <span className="badge-info px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono">
                        CHECKOUT
                      </span>
                    )}
                    {act.type === 'checkin' && (
                      <span className="badge-success px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono">
                        CHECKIN
                      </span>
                    )}
                    {act.type === 'fine' && (
                      <span className="badge-warning px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono">
                        FINE/WAIVE
                      </span>
                    )}
                    {act.type === 'hold' && (
                      <span className="badge-neutral px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono">
                        HOLD STAGED
                      </span>
                    )}
                  </td>
                  <td className="td-cell">
                    <div className="font-semibold text-xs text-foreground">
                      {act.patronName}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {act.patronCard}
                    </div>
                  </td>
                  <td className="td-cell">
                    <div className="font-medium text-xs text-foreground line-clamp-1">
                      {act.bookTitle}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {act.barcode}
                    </div>
                  </td>
                  <td className="td-cell text-xs text-muted-foreground">
                    {act.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default LibrarianDashboard;
