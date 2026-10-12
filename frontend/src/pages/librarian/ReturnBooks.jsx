import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, Scan, Search, CheckCircle2, AlertTriangle,
  MapPin, DollarSign, ArrowRight, ShieldCheck, Printer, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const SAMPLE_RETURN_CANDIDATES = [
  {
    barcode: 'PKC-104921-C',
    bookTitle: 'Structure & Interpretation of Computer Programs',
    author: 'Harold Abelson & Gerald Jay Sussman',
    borrowerName: 'Marcus Vance',
    borrowerEmail: 'm.vance@campus.edu',
    borrowerCard: 'PKC-MBR-192834',
    issueDate: '2026-05-18',
    dueDate: '2026-06-15',
    daysOverdue: 3,
    fineRate: 1.00,
    reshelvingLocation: 'Wing B &bull; 3rd Floor &bull; Computer Science &bull; Stack 4-B',
    condition: 'Good',
  },
  {
    barcode: 'PKC-087312-B',
    bookTitle: 'Gödel, Escher, Bach: An Eternal Golden Braid',
    author: 'Douglas R. Hofstadter',
    borrowerName: 'Elena Rostova',
    borrowerEmail: 'elena.r@scholars.net',
    borrowerCard: 'PKC-MBR-554210',
    issueDate: '2026-06-01',
    dueDate: '2026-06-29',
    daysOverdue: 0,
    fineRate: 1.00,
    reshelvingLocation: 'Wing A &bull; 2nd Floor &bull; Cognitive Science &bull; Stack 2-A',
    condition: 'Pristine',
  },
];

const ReturnBooks = () => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItem, setScannedItem] = useState(null);
  const [condition, setCondition] = useState('Good');
  const [damageFee, setDamageFee] = useState(0);
  const [recentReturns, setRecentReturns] = useState([]);

  const handleScan = (e) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    const found = SAMPLE_RETURN_CANDIDATES.find(
      c => c.barcode.toLowerCase() === query.toLowerCase() ||
           c.bookTitle.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setScannedItem(found);
      setCondition(found.condition);
      setDamageFee(0);
      toast.info(`Volume "${found.bookTitle}" identified`);
    } else {
      // Mock generated candidate
      const mock = {
        barcode: query.toUpperCase(),
        bookTitle: 'Archival Collection Folio',
        author: 'Patel & Co. Catalogued Author',
        borrowerName: 'Active Patron',
        borrowerEmail: 'patron@domain.org',
        borrowerCard: 'PKC-MBR-900123',
        issueDate: '2026-06-01',
        dueDate: '2026-06-20',
        daysOverdue: 0,
        fineRate: 1.00,
        reshelvingLocation: 'General Stacks &bull; 1st Floor &bull; Section G',
        condition: 'Good',
      };
      setScannedItem(mock);
      setCondition('Good');
      setDamageFee(0);
      toast.info(`Volume with barcode ${query.toUpperCase()} loaded`);
    }
  };

  const handleProcessReturn = () => {
    if (!scannedItem) return;

    const overdueFee = scannedItem.daysOverdue > 0 ? scannedItem.daysOverdue * scannedItem.fineRate : 0;
    const totalFee = overdueFee + Number(damageFee);

    const completedRecord = {
      id: Date.now(),
      barcode: scannedItem.barcode,
      title: scannedItem.bookTitle,
      borrower: scannedItem.borrowerName,
      location: scannedItem.reshelvingLocation,
      condition,
      totalFee,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRecentReturns(prev => [completedRecord, ...prev]);
    toast.success(`Check-in processed! Route to: ${scannedItem.reshelvingLocation}`);

    // Reset current
    setScannedItem(null);
    setBarcodeInput('');
  };

  const overdueFee = scannedItem && scannedItem.daysOverdue > 0
    ? scannedItem.daysOverdue * scannedItem.fineRate
    : 0;
  const totalCharge = overdueFee + Number(damageFee);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Eyebrow & Title */}
      <div>
        <span className="section-eyebrow mb-1.5">Librarian Desk &bull; Circulation</span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-editorial text-3xl font-bold text-foreground tracking-tight">
              Rapid Return &amp; Check-In Desk
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Rapid barcode scanning, physical copy triage, overdue fee assessment, and reshelving stack routing.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Scanner Ready
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Barcode Input & Active Item Processing */}
        <div className="lg:col-span-2 space-y-6">

          {/* Barcode Search Box */}
          <div className="hairline-card p-6 rounded-3xl bg-card border border-border shadow-xs">
            <form onSubmit={handleScan}>
              <label className="block font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Scan Volume Barcode / Accession ID
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Scan className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Enter or scan barcode (e.g. PKC-104921-C)..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-foreground text-background font-semibold text-xs rounded-xl hover:opacity-90 transition-all shrink-0 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Lookup
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>Quick test barcodes:</span>
              <button
                type="button"
                onClick={() => { setBarcodeInput('PKC-104921-C'); }}
                className="font-mono text-amber-600 dark:text-amber-400 hover:underline"
              >
                PKC-104921-C (Overdue)
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => { setBarcodeInput('PKC-087312-B'); }}
                className="font-mono text-amber-600 dark:text-amber-400 hover:underline"
              >
                PKC-087312-B (On Time)
              </button>
            </div>
          </div>

          {/* Scanned Volume Details Card */}
          <AnimatePresence>
            {scannedItem ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="hairline-card p-6 rounded-3xl bg-card border border-border shadow-md space-y-6"
              >
                <div className="flex items-start justify-between pb-4 border-b border-border">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Scanned Volume Details
                    </span>
                    <h2 className="font-serif-editorial text-2xl font-bold text-foreground mt-1">
                      {scannedItem.bookTitle}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      By {scannedItem.author} &bull; Barcode: <span className="font-mono font-bold text-foreground">{scannedItem.barcode}</span>
                    </p>
                  </div>

                  {scannedItem.daysOverdue > 0 ? (
                    <span className="badge-danger px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {scannedItem.daysOverdue} Days Overdue
                    </span>
                  ) : (
                    <span className="badge-success px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      On Time
                    </span>
                  )}
                </div>

                {/* Borrower & Circulation Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Circulated Patron</span>
                    <p className="font-semibold text-foreground mt-0.5">{scannedItem.borrowerName}</p>
                    <p className="font-mono text-muted-foreground text-[10px]">{scannedItem.borrowerCard}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Due Date</span>
                    <p className="font-semibold text-foreground mt-0.5">{scannedItem.dueDate}</p>
                    <p className="text-muted-foreground text-[10px]">Issued on {scannedItem.issueDate}</p>
                  </div>
                </div>

                {/* Condition & Damage Triage */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Physical Condition Assessment
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Pristine', 'Good', 'Minor Wear', 'Damaged'].map(cond => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => {
                          setCondition(cond);
                          if (cond === 'Damaged') setDamageFee(15.00);
                          else setDamageFee(0);
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                          condition === cond
                            ? 'bg-foreground text-background border-foreground shadow-xs'
                            : 'bg-background text-muted-foreground hover:text-foreground border-border'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>

                  {condition === 'Damaged' && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs">
                      <span className="text-rose-700 dark:text-rose-400 font-semibold">
                        Damage Fee Assessed:
                      </span>
                      <div className="flex items-center gap-1 font-mono">
                        <span>$</span>
                        <input
                          type="number"
                          value={damageFee}
                          onChange={(e) => setDamageFee(e.target.value)}
                          className="w-16 px-2 py-1 rounded bg-background border border-border text-foreground text-right"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Reshelving Routing Tag */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    Reshelving Routing Destination
                  </div>
                  <p className="font-serif-editorial font-bold text-base text-foreground mt-1"
                     dangerouslySetInnerHTML={{ __html: scannedItem.reshelvingLocation }}
                  />
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Place in sorting cart cart slot <span className="font-mono font-bold text-foreground">CART-A3</span>
                  </p>
                </div>

                {/* Total Charges & Final Action */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">Settlement Balance:</span>
                    <p className="font-serif-editorial text-xl font-bold text-foreground">
                      ${totalCharge.toFixed(2)}
                      {totalCharge > 0 && (
                        <span className="text-xs font-normal text-muted-foreground ml-1.5">
                          (${overdueFee.toFixed(2)} overdue + ${Number(damageFee).toFixed(2)} damage)
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={handleProcessReturn}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Check-In &amp; Route
                  </button>
                </div>

              </motion.div>
            ) : (
              <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/40">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <h3 className="font-serif-editorial text-xl font-bold text-foreground">No Volume Staged</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Scan a book's physical barcode or search accession numbers above to begin return processing.
                </p>
              </div>
            )}
          </AnimatePresence>

        </div>

        {/* Right 1 Col: Session Activity Ledger */}
        <div className="space-y-6">
          <div className="hairline-card p-5 rounded-3xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-serif-editorial text-base font-bold text-foreground">
                Desk Returns (This Shift)
              </h3>
              <span className="font-mono text-xs text-muted-foreground">
                {recentReturns.length} returned
              </span>
            </div>

            {recentReturns.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No check-ins processed in current session yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {recentReturns.map(rec => (
                  <div key={rec.id} className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="font-serif-editorial font-bold text-foreground truncate max-w-[160px]">
                        {rec.title}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">{rec.time}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Patron: {rec.borrower}</span>
                      <span>Cond: {rec.condition}</span>
                    </div>
                    {rec.totalFee > 0 && (
                      <div className="text-rose-600 dark:text-rose-400 font-mono text-[10px] font-semibold">
                        Fine: ${rec.totalFee.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReturnBooks;
