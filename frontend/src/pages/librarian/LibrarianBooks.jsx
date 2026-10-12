import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Copy,
  Layers,
  MapPin,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Barcode,
  Eye,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import API_URL from '../../api/config';

const INITIAL_BOOKS = [
  {
    _id: 'b-101',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    category: 'Computer Science',
    shelfLocation: '2nd Floor Science [2F-CS-04A]',
    callNumber: 'QA76.9.D3 K54 2017',
    totalCopies: 4,
    availableCopies: 3,
    loanedCopies: 1,
    holdQueueLength: 1,
    copies: [
      { barcode: 'LIB-2026-MAIN-001042', accessionNumber: 'ACC-2026-000411', condition: 'Pristine', binding: 'Hardcover', shelf: '2F-CS-04A', status: 'AVAILABLE' },
      { barcode: 'LIB-2026-MAIN-001043', accessionNumber: 'ACC-2026-000412', condition: 'Good', binding: 'Paperback', shelf: '2F-CS-04A', status: 'AVAILABLE' },
      { barcode: 'LIB-2026-MAIN-001044', accessionNumber: 'ACC-2026-000413', condition: 'Good', binding: 'Paperback', shelf: '2F-CS-04A', status: 'LOANED', borrower: 'Elena Rostova', due: '2026-09-28' },
      { barcode: 'LIB-2026-MAIN-001045', accessionNumber: 'ACC-2026-000414', condition: 'Pristine', binding: 'Hardcover', shelf: '2F-CS-04A', status: 'AVAILABLE' },
    ]
  },
  {
    _id: 'b-102',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Computer Science',
    shelfLocation: '2nd Floor Science [2F-CS-02C]',
    callNumber: 'QA76.76.C68 M37 2008',
    totalCopies: 5,
    availableCopies: 0,
    loanedCopies: 5,
    holdQueueLength: 4,
    copies: [
      { barcode: 'LIB-2026-MAIN-000871', accessionNumber: 'ACC-2026-000301', condition: 'Good', binding: 'Paperback', shelf: '2F-CS-02C', status: 'LOANED', borrower: 'Marcus Vance', due: '2026-09-22' },
      { barcode: 'LIB-2026-MAIN-000872', accessionNumber: 'ACC-2026-000302', condition: 'Fair', binding: 'Paperback', shelf: '2F-CS-02C', status: 'LOANED', borrower: 'John Smith', due: '2026-09-20' },
      { barcode: 'LIB-2026-MAIN-000873', accessionNumber: 'ACC-2026-000303', condition: 'Pristine', binding: 'Hardcover', shelf: '2F-CS-02C', status: 'LOANED', borrower: 'Clara Oswald', due: '2026-09-25' },
      { barcode: 'LIB-2026-MAIN-000874', accessionNumber: 'ACC-2026-000304', condition: 'Good', binding: 'Paperback', shelf: '2F-CS-02C', status: 'RESERVED', borrower: 'Hold for David C.', due: 'Pickup hold' },
      { barcode: 'LIB-2026-MAIN-000875', accessionNumber: 'ACC-2026-000305', condition: 'Fair', binding: 'Paperback', shelf: '2F-CS-02C', status: 'LOANED', borrower: 'Priya Sharma', due: '2026-09-30' },
    ]
  },
  {
    _id: 'b-103',
    title: 'The Great Gatsby: Archival Critical Edition',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Classic Literature',
    shelfLocation: '1st Floor Fiction [1F-FIC-09B]',
    callNumber: 'PS3511.I9 G7 2004',
    totalCopies: 3,
    availableCopies: 2,
    loanedCopies: 1,
    holdQueueLength: 0,
    copies: [
      { barcode: 'LIB-2026-MAIN-000210', accessionNumber: 'ACC-2026-000089', condition: 'Pristine', binding: 'Archival Binding', shelf: '1F-FIC-09B', status: 'AVAILABLE' },
      { barcode: 'LIB-2026-MAIN-000211', accessionNumber: 'ACC-2026-000090', condition: 'Good', binding: 'Hardcover', shelf: '1F-FIC-09B', status: 'AVAILABLE' },
      { barcode: 'LIB-2026-MAIN-000212', accessionNumber: 'ACC-2026-000091', condition: 'Fair', binding: 'Paperback', shelf: '1F-FIC-09B', status: 'LOANED', borrower: 'Liam Gallagher', due: '2026-10-01' },
    ]
  },
  {
    _id: 'b-104',
    title: 'Artificial Intelligence: A Modern Approach (4th Ed.)',
    author: 'Stuart Russell & Peter Norvig',
    isbn: '978-0134610993',
    category: 'Computer Science',
    shelfLocation: '2nd Floor Science [2F-AI-01A]',
    callNumber: 'Q335 .R86 2020',
    totalCopies: 2,
    availableCopies: 1,
    loanedCopies: 1,
    holdQueueLength: 2,
    copies: [
      { barcode: 'LIB-2026-MAIN-000450', accessionNumber: 'ACC-2026-000155', condition: 'Pristine', binding: 'Hardcover', shelf: '2F-AI-01A', status: 'AVAILABLE' },
      { barcode: 'LIB-2026-MAIN-000451', accessionNumber: 'ACC-2026-000156', condition: 'Good', binding: 'Hardcover', shelf: '2F-AI-01A', status: 'LOANED', borrower: 'Nadia Petrova', due: '2026-09-24' },
    ]
  },
  {
    _id: 'b-105',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    category: 'History',
    shelfLocation: '1st Floor Humanities [1F-HIST-05C]',
    callNumber: 'CB113.H37 2015',
    totalCopies: 6,
    availableCopies: 4,
    loanedCopies: 2,
    holdQueueLength: 0,
    copies: [
      { barcode: 'LIB-2026-MAIN-000601', accessionNumber: 'ACC-2026-000210', condition: 'Good', binding: 'Paperback', shelf: '1F-HIST-05C', status: 'AVAILABLE' },
      { barcode: 'LIB-2026-MAIN-000602', accessionNumber: 'ACC-2026-000211', condition: 'Pristine', binding: 'Hardcover', shelf: '1F-HIST-05C', status: 'AVAILABLE' },
      { barcode: 'LIB-2026-MAIN-000603', accessionNumber: 'ACC-2026-000212', condition: 'Good', binding: 'Paperback', shelf: '1F-HIST-05C', status: 'AVAILABLE' },
      { barcode: 'LIB-2026-MAIN-000604', accessionNumber: 'ACC-2026-000213', condition: 'Fair', binding: 'Paperback', shelf: '1F-HIST-05C', status: 'AVAILABLE' },
      { barcode: 'LIB-2026-MAIN-000605', accessionNumber: 'ACC-2026-000214', condition: 'Good', binding: 'Paperback', shelf: '1F-HIST-05C', status: 'LOANED', borrower: 'Arthur Dent', due: '2026-09-29' },
      { barcode: 'LIB-2026-MAIN-000606', accessionNumber: 'ACC-2026-000215', condition: 'Pristine', binding: 'Hardcover', shelf: '1F-HIST-05C', status: 'LOANED', borrower: 'Ford Prefect', due: '2026-09-27' },
    ]
  }
];

const LibrarianBooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL'); // ALL, IN_STOCK, OUT_OF_STOCK
  const [selectedBookForCopies, setSelectedBookForCopies] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef(null);

  // Focus search bar on '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch from server if possible
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/books?limit=50`);
        const json = await res.json();
        if (json.success && json.data && json.data.books && json.data.books.length > 0) {
          // Merge API books with realistic shelf & copy simulation
          const merged = json.data.books.map((b, idx) => ({
            _id: b._id,
            title: b.title,
            author: b.author,
            isbn: b.isbn || `978-0${idx}1234567`,
            category: b.category || 'General',
            shelfLocation: b.shelfLocation || `Stack ${((idx % 8) + 1)} [Floor ${((idx % 3) + 1)}]`,
            callNumber: b.callNumber || `GEN.${(100 + idx)} .A${idx} 2024`,
            totalCopies: b.totalCopies || 3,
            availableCopies: b.availableCopies !== undefined ? b.availableCopies : 2,
            loanedCopies: (b.totalCopies || 3) - (b.availableCopies !== undefined ? b.availableCopies : 2),
            holdQueueLength: idx % 3 === 0 ? 1 : 0,
            copies: [
              {
                barcode: `LIB-2026-MAIN-${String(idx * 10 + 1).padStart(6, '0')}`,
                accessionNumber: `ACC-2026-${String(idx * 10 + 1).padStart(6, '0')}`,
                condition: 'Pristine',
                binding: 'Hardcover',
                shelf: `Floor ${((idx % 3) + 1)}`,
                status: 'AVAILABLE'
              }
            ]
          }));
          setBooks(merged);
        }
      } catch {
        // Retain initial books
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Filter logic
  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery) ||
      (book.callNumber && book.callNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.shelfLocation && book.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory =
      selectedCategory === 'ALL' || book.category === selectedCategory;

    const matchAvailability =
      availabilityFilter === 'ALL'
        ? true
        : availabilityFilter === 'IN_STOCK'
        ? book.availableCopies > 0
        : book.availableCopies === 0;

    return matchSearch && matchCategory && matchAvailability;
  });

  const categories = ['ALL', ...new Set(books.map((b) => b.category))];

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-editorial tracking-tight text-foreground">
              Catalog & Shelf Navigator
            </h1>
            <span className="badge-info px-2.5 py-0.5 rounded-full text-xs font-mono font-medium">
              {filteredBooks.length} Titles Listed
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Rapid catalog search, shelf-location lookup, and copy status for desk librarians.
          </p>
        </div>

        {/* Quick Stacks shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/librarian/copies')}
            className="px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors"
          >
            <Barcode className="w-3.5 h-3.5 text-amber-500" />
            <span>Manage Physical Copies</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Ergonomics ─────────────────────────────── */}
      <div className="hairline-card p-4 rounded-xl bg-card space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, ISBN, call number, or shelf stack..."
              className="w-full pl-9 pr-14 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground pointer-events-none" />
            <kbd className="absolute right-3 top-3 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border text-muted-foreground pointer-events-none">
              /
            </kbd>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Availability</option>
              <option value="IN_STOCK">In Stock (Available)</option>
              <option value="OUT_OF_STOCK">All Loaned Out</option>
            </select>
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span>Showing {filteredBooks.length} titles matching criteria</span>
          <span>Click any row or "Inspect Copies" to view individual accession barcodes</span>
        </div>
      </div>

      {/* ── Catalog Table ──────────────────────────────────────────── */}
      <div className="hairline-card rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="th-cell">Title & Author</th>
                <th className="th-cell">ISBN / Call No</th>
                <th className="th-cell">Shelf Location</th>
                <th className="th-cell">Availability</th>
                <th className="th-cell">Hold Queue</th>
                <th className="th-cell text-right">Desk Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => {
                const isAllLoaned = book.availableCopies === 0;
                const isLow = book.availableCopies === 1;

                return (
                  <tr
                    key={book._id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Title & Author */}
                    <td className="td-cell max-w-[280px]">
                      <div className="font-serif-editorial text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {book.title}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        by {book.author}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
                        {book.category}
                      </span>
                    </td>

                    {/* ISBN / Call No */}
                    <td className="td-cell whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {book.isbn}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {book.callNumber}
                      </div>
                    </td>

                    {/* Shelf Location */}
                    <td className="td-cell">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{book.shelfLocation}</span>
                      </div>
                    </td>

                    {/* Availability */}
                    <td className="td-cell whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                            isAllLoaned
                              ? 'badge-danger'
                              : isLow
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                        >
                          {book.availableCopies} / {book.totalCopies} Available
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        {book.loanedCopies} on loan
                      </div>
                    </td>

                    {/* Hold Queue */}
                    <td className="td-cell whitespace-nowrap">
                      {book.holdQueueLength > 0 ? (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{book.holdQueueLength} waiting</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="td-cell text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBookForCopies(book)}
                          className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-colors"
                          title="Inspect Physical Copies"
                        >
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Copies ({book.copies?.length || book.totalCopies})</span>
                        </button>

                        <button
                          onClick={() => navigate(`/librarian/issue?isbn=${book.isbn}`)}
                          disabled={isAllLoaned}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            isAllLoaned
                              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                              : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-98'
                          }`}
                          title={isAllLoaned ? 'No physical copies available to issue' : 'Quick Issue'}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Issue</span>
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

      {/* ── Slide-Over / Modal: Physical Copies Inspector ──────────── */}
      {selectedBookForCopies && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hairline-card w-full max-w-2xl bg-card rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Physical Copy Manifest
                </span>
                <h3 className="font-serif-editorial text-lg font-bold text-foreground">
                  {selectedBookForCopies.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ISBN: <span className="font-mono">{selectedBookForCopies.isbn}</span> • Shelf: {selectedBookForCopies.shelfLocation}
                </p>
              </div>

              <button
                onClick={() => setSelectedBookForCopies(null)}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Copies Table */}
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="th-cell">Barcode</th>
                    <th className="th-cell">Condition</th>
                    <th className="th-cell">Binding</th>
                    <th className="th-cell">Status</th>
                    <th className="th-cell">Current Patron / Due</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBookForCopies.copies?.map((cp, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="td-cell font-mono text-xs font-semibold text-foreground">
                        {cp.barcode}
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {cp.accessionNumber}
                        </div>
                      </td>
                      <td className="td-cell text-xs font-medium">
                        {cp.condition}
                      </td>
                      <td className="td-cell text-xs text-muted-foreground">
                        {cp.binding}
                      </td>
                      <td className="td-cell">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            cp.status === 'AVAILABLE'
                              ? 'badge-success'
                              : cp.status === 'LOANED'
                              ? 'badge-info'
                              : 'badge-warning'
                          }`}
                        >
                          {cp.status}
                        </span>
                      </td>
                      <td className="td-cell text-xs">
                        {cp.borrower ? (
                          <div>
                            <span className="font-semibold text-foreground">{cp.borrower}</span>
                            <span className="text-muted-foreground block text-[10px]">Due: {cp.due}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-mono text-[11px]">On Shelf</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-muted-foreground">
                Stack Shelf: <span className="font-mono font-bold text-foreground">{selectedBookForCopies.shelfLocation}</span>
              </span>
              <button
                onClick={() => {
                  navigate(`/librarian/copies?search=${selectedBookForCopies.isbn}`);
                }}
                className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90"
              >
                Open Full Copies Ledger
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LibrarianBooks;
