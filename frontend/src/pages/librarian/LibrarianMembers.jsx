import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  CreditCard,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RotateCcw,
  Calendar,
  ShieldCheck,
  Printer,
  Edit2,
  X,
  Mail,
  Phone,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import API_URL from '../../api/config';

const SAMPLE_PATRONS = [
  {
    id: 'usr-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@university.edu',
    phone: '+1 (555) 234-5678',
    cardBarcode: 'CARD-8842-19',
    tier: 'Postgraduate Researcher',
    status: 'ACTIVE',
    membershipExpires: '2027-04-15',
    maxLoans: 8,
    activeLoans: [
      {
        barcode: 'LIB-2026-MAIN-001044',
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        issuedDate: '2026-09-08',
        dueDate: '2026-09-28',
        status: 'ON_TIME',
        daysLeft: 14
      },
      {
        barcode: 'LIB-2026-MAIN-000312',
        title: 'Introduction to Algorithms (4th Edition)',
        author: 'Thomas H. Cormen',
        issuedDate: '2026-08-25',
        dueDate: '2026-09-12',
        status: 'OVERDUE',
        daysOverdue: 2
      }
    ],
    holds: [
      {
        holdId: 'HLD-901',
        title: 'Artificial Intelligence: A Modern Approach',
        queuePosition: 1,
        status: 'READY_FOR_PICKUP',
        pickupBin: 'Bin #04 (Front Desk)',
        expiresAt: '2026-09-17'
      }
    ],
    fines: [
      {
        fineId: 'FN-302',
        reason: 'Overdue return: Intro to Algorithms',
        amount: 2.50,
        date: '2026-09-13',
        status: 'UNPAID'
      }
    ]
  },
  {
    id: 'usr-2',
    name: 'Marcus Vance',
    email: 'm.vance@techcorp.io',
    phone: '+1 (555) 987-6543',
    cardBarcode: 'CARD-3190-44',
    tier: 'Community Scholar',
    status: 'ACTIVE',
    membershipExpires: '2026-12-31',
    maxLoans: 5,
    activeLoans: [
      {
        barcode: 'LIB-2026-MAIN-000871',
        title: 'Clean Code: A Handbook of Agile Craftsmanship',
        author: 'Robert C. Martin',
        issuedDate: '2026-09-05',
        dueDate: '2026-09-22',
        status: 'ON_TIME',
        daysLeft: 8
      }
    ],
    holds: [],
    fines: []
  },
  {
    id: 'usr-3',
    name: 'Sarah Jenkins',
    email: 'sjenkins@archival.org',
    phone: '+1 (555) 345-9012',
    cardBarcode: 'CARD-5012-77',
    tier: 'Faculty Staff',
    status: 'SUSPENDED_FINES',
    membershipExpires: '2026-10-01',
    maxLoans: 10,
    activeLoans: [],
    holds: [],
    fines: [
      {
        fineId: 'FN-199',
        reason: 'Lost copy replacement: Advanced TypeScript',
        amount: 34.00,
        date: '2026-08-20',
        status: 'UNPAID'
      },
      {
        fineId: 'FN-205',
        reason: 'Overdue notice processing',
        amount: 5.00,
        date: '2026-09-01',
        status: 'UNPAID'
      }
    ]
  }
];

const LibrarianMembers = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCard = searchParams.get('card') || '';

  const [searchQuery, setSearchQuery] = useState(initialCard);
  const [patrons, setPatrons] = useState(SAMPLE_PATRONS);
  const [selectedPatron, setSelectedPatron] = useState(SAMPLE_PATRONS[0]);
  const [activeTab, setActiveTab] = useState('loans'); // 'loans' | 'holds' | 'fines'
  const [waiveModal, setWaiveModal] = useState(null);
  const [waiveReason, setWaiveReason] = useState('First-time Courtesy');
  const [waiveSupervisorNote, setWaiveSupervisorNote] = useState('');

  const searchInputRef = useRef(null);

  // Focus search input on mount
  useEffect(() => {
    if (initialCard) {
      const match = patrons.find(p => p.cardBarcode === initialCard);
      if (match) setSelectedPatron(match);
    }
  }, [initialCard, patrons]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = patrons.find(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.cardBarcode.toLowerCase().includes(query)
    );

    if (found) {
      setSelectedPatron(found);
      toast.success(`Loaded profile for ${found.name}`);
    } else {
      toast.warning('No member found with that name, email, or card barcode');
    }
  };

  // Renew Loan Action
  const handleRenewLoan = (barcode) => {
    setSelectedPatron(prev => {
      const updatedLoans = prev.activeLoans.map(loan => {
        if (loan.barcode === barcode) {
          return {
            ...loan,
            dueDate: '2026-10-14',
            status: 'ON_TIME',
            daysLeft: 30
          };
        }
        return loan;
      });
      return { ...prev, activeLoans: updatedLoans };
    });
    toast.success(`Renewed loan for copy ${barcode} (+14 days)`);
  };

  // Extend Membership Action
  const handleExtendMembership = () => {
    setSelectedPatron(prev => ({
      ...prev,
      membershipExpires: '2028-01-01',
      status: 'ACTIVE'
    }));
    toast.success(`Membership for ${selectedPatron.name} extended to 2028!`);
  };

  // Waive Fine Action
  const handleConfirmWaive = (e) => {
    e.preventDefault();
    if (!waiveModal) return;

    setSelectedPatron(prev => {
      const updatedFines = prev.fines.filter(f => f.fineId !== waiveModal.fineId);
      const isNowClear = updatedFines.length === 0;
      return {
        ...prev,
        fines: updatedFines,
        status: isNowClear && prev.status === 'SUSPENDED_FINES' ? 'ACTIVE' : prev.status
      };
    });

    toast.success(`Waived $${waiveModal.amount.toFixed(2)} (${waiveReason})`);
    setWaiveModal(null);
  };

  const totalFines = selectedPatron?.fines?.reduce((s, f) => s + f.amount, 0) || 0;

  return (
    <div className="space-y-6">

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-editorial tracking-tight text-foreground">
              Member Dossier & Accounts
            </h1>
            <span className="badge-info px-2.5 py-0.5 rounded-full text-xs font-mono font-medium">
              Desk Lookup
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Search patron card barcodes, inspect current loans, clear fines, and extend membership.
          </p>
        </div>

        {/* Quick Staging Action */}
        {selectedPatron && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/librarian/issue?patron=${selectedPatron.cardBarcode}`)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-98 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Issue Book to Member</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <div className="hairline-card p-4 rounded-xl bg-card">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patron name, email address, or barcode (e.g. CARD-8842-19)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background font-mono text-sm placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-foreground text-background font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-98 transition-all shrink-0"
          >
            <span>Search [Enter]</span>
          </button>
        </form>

        {/* Quick Selector Pills for Testing / Fast desk lookup */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50 overflow-x-auto">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            Frequent Patrons:
          </span>
          {patrons.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPatron(p);
                setSearchQuery(p.cardBarcode);
              }}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                selectedPatron?.id === p.id
                  ? 'bg-foreground text-background font-bold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.name} ({p.cardBarcode})
            </button>
          ))}
        </div>
      </div>

      {/* ── Patron Dossier Panel ────────────────────────────────────── */}
      {selectedPatron && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Patron ID Card & Desk Quick-Actions */}
          <div className="space-y-4">
            <div className="hairline-card p-5 rounded-xl bg-card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Library Patron Dossier
                  </span>
                  <h2 className="text-xl font-bold font-serif-editorial text-foreground mt-0.5">
                    {selectedPatron.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                      {selectedPatron.cardBarcode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        selectedPatron.status === 'ACTIVE'
                          ? 'badge-success'
                          : 'badge-danger'
                      }`}
                    >
                      {selectedPatron.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 text-xs text-muted-foreground border-t border-b border-border py-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{selectedPatron.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{selectedPatron.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Tier: <strong className="text-foreground">{selectedPatron.tier}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Expires: <strong className="text-foreground">{selectedPatron.membershipExpires}</strong></span>
                </div>
              </div>

              {/* Quick Actions Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleExtendMembership}
                  className="w-full py-2 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Extend Membership (+1 Year)</span>
                </button>

                {totalFines > 0 && (
                  <button
                    onClick={() => navigate(`/librarian/fines?member=${selectedPatron.cardBarcode}`)}
                    className="w-full py-2 px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-rose-700 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Collect Fines (${totalFines.toFixed(2)})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    window.print();
                    toast.info('Printing patron borrowing statement');
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Account Statement</span>
                </button>
              </div>
            </div>

            {/* Metrics Widget */}
            <div className="grid grid-cols-2 gap-3">
              <div className="hairline-card p-3.5 rounded-xl bg-card text-center">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  Active Loans
                </span>
                <div className="text-xl font-bold font-serif-editorial text-foreground mt-0.5">
                  {selectedPatron.activeLoans.length} / {selectedPatron.maxLoans}
                </div>
              </div>

              <div className="hairline-card p-3.5 rounded-xl bg-card text-center">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  Unpaid Fines
                </span>
                <div className={`text-xl font-bold font-serif-editorial mt-0.5 ${totalFines > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  ${totalFines.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Activity Ledger (Loans, Holds, Fines) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-border gap-2">
              <button
                onClick={() => setActiveTab('loans')}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'loans'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Current Loans ({selectedPatron.activeLoans.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('holds')}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'holds'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Holds Pending ({selectedPatron.holds.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('fines')}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'fines'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Fines & Fees ({selectedPatron.fines.length})</span>
              </button>
            </div>

            {/* TAB 1: Current Loans */}
            {activeTab === 'loans' && (
              <div className="hairline-card rounded-xl bg-card overflow-hidden">
                {selectedPatron.activeLoans.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    No books currently checked out to this patron.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/20 border-b border-border">
                          <th className="th-cell">Barcode & Book</th>
                          <th className="th-cell">Due Date</th>
                          <th className="th-cell">Status</th>
                          <th className="th-cell text-right">Desk Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPatron.activeLoans.map((loan) => (
                          <tr key={loan.barcode} className="hover:bg-muted/20 border-b border-border last:border-0">
                            <td className="td-cell max-w-[260px]">
                              <div className="font-serif-editorial text-xs font-bold text-foreground line-clamp-1">
                                {loan.title}
                              </div>
                              <div className="font-mono text-[10px] text-muted-foreground">
                                {loan.barcode} • by {loan.author}
                              </div>
                            </td>

                            <td className="td-cell whitespace-nowrap font-mono text-xs">
                              {loan.dueDate}
                            </td>

                            <td className="td-cell whitespace-nowrap">
                              {loan.status === 'OVERDUE' ? (
                                <span className="badge-danger px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                                  {loan.daysOverdue}d OVERDUE
                                </span>
                              ) : (
                                <span className="badge-success px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                                  Due in {loan.daysLeft}d
                                </span>
                              )}
                            </td>

                            <td className="td-cell text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleRenewLoan(loan.barcode)}
                                  className="px-2.5 py-1 rounded border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                  title="Renew due date by 14 days"
                                >
                                  Renew (+14d)
                                </button>
                                <button
                                  onClick={() => navigate(`/librarian/return?barcode=${loan.barcode}`)}
                                  className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                                  title="Process Return"
                                >
                                  Return
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Holds */}
            {activeTab === 'holds' && (
              <div className="hairline-card rounded-xl bg-card overflow-hidden">
                {selectedPatron.holds.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    No active holds or reservation requests for this patron.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/20 border-b border-border">
                          <th className="th-cell">Hold ID</th>
                          <th className="th-cell">Title</th>
                          <th className="th-cell">Location / Bin</th>
                          <th className="th-cell">Expires</th>
                          <th className="th-cell text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPatron.holds.map((h) => (
                          <tr key={h.holdId} className="hover:bg-muted/20 border-b border-border last:border-0">
                            <td className="td-cell font-mono text-xs font-semibold">
                              {h.holdId}
                            </td>
                            <td className="td-cell font-serif-editorial text-xs font-bold text-foreground">
                              {h.title}
                            </td>
                            <td className="td-cell whitespace-nowrap">
                              <span className="badge-warning px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                                {h.pickupBin}
                              </span>
                            </td>
                            <td className="td-cell font-mono text-xs text-muted-foreground whitespace-nowrap">
                              {h.expiresAt}
                            </td>
                            <td className="td-cell text-right whitespace-nowrap">
                              <button
                                onClick={() => navigate(`/librarian/issue?patron=${selectedPatron.cardBarcode}`)}
                                className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
                              >
                                Checkout Hold
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Fines & Fees */}
            {activeTab === 'fines' && (
              <div className="hairline-card rounded-xl bg-card overflow-hidden">
                {selectedPatron.fines.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    Patron has a clean financial standing ($0.00 outstanding).
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/20 border-b border-border">
                          <th className="th-cell">Fine ID</th>
                          <th className="th-cell">Reason / Description</th>
                          <th className="th-cell">Date</th>
                          <th className="th-cell">Amount</th>
                          <th className="th-cell text-right">Desk Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPatron.fines.map((fn) => (
                          <tr key={fn.fineId} className="hover:bg-muted/20 border-b border-border last:border-0">
                            <td className="td-cell font-mono text-xs font-semibold">
                              {fn.fineId}
                            </td>
                            <td className="td-cell text-xs font-medium text-foreground">
                              {fn.reason}
                            </td>
                            <td className="td-cell font-mono text-xs text-muted-foreground whitespace-nowrap">
                              {fn.date}
                            </td>
                            <td className="td-cell font-mono text-xs font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                              ${fn.amount.toFixed(2)}
                            </td>
                            <td className="td-cell text-right whitespace-nowrap">
                              <button
                                onClick={() => setWaiveModal(fn)}
                                className="px-2.5 py-1 rounded border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                              >
                                Waive Fine
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ── Modal: Waive Fine Supervisor Reason ─────────────────────── */}
      {waiveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hairline-card w-full max-w-md bg-card rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-up">
            <div className="flex items-start justify-between border-b border-border pb-2">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Policy Override
                </span>
                <h3 className="font-serif-editorial text-lg font-bold text-foreground">
                  Waive Fine: ${waiveModal.amount.toFixed(2)}
                </h3>
              </div>
              <button
                onClick={() => setWaiveModal(null)}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmWaive} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Reason for Fee Waiver
                </label>
                <select
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs font-medium"
                >
                  <option value="First-time Courtesy">First-time Courtesy Waiver</option>
                  <option value="Medical Illness/Emergency">Documented Medical Leave</option>
                  <option value="Library Weather Closure">Library Emergency/Weather Closure</option>
                  <option value="Administrative Review">Administrative Staff Discretion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Supervisor Justification / Notes
                </label>
                <textarea
                  rows={2}
                  required
                  value={waiveSupervisorNote}
                  onChange={(e) => setWaiveSupervisorNote(e.target.value)}
                  placeholder="Mandatory notes for audit trail..."
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setWaiveModal(null)}
                  className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  Authorize Waiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LibrarianMembers;
