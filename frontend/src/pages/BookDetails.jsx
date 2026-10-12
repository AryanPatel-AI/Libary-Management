import { useState, useEffect, useContext } from 'react';
import API_URL from '../api/config';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Loader2,
  CheckCircle2, XCircle, Bookmark, Building2,
  Copy, Check, FileText, Calendar, Globe,
  Hash, Layers, File, ArrowUpRight, ShieldAlert,
  Clock, Edit, BookCopy
} from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import PdfViewer from '../components/PdfViewer';
import ReviewsSection from '../components/ReviewsSection';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issueLoading, setIssueLoading] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  const currentUser = user?.data || user;
  const isLibrarianOrAdmin = currentUser?.role === 'librarian' || currentUser?.role === 'admin';

  const handleReadDigital = async () => {
    try {
      setAccessLoading(true);
      const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo'))?.data?.token);

      if (!token) {
        toast.error('Please sign in to read the digital edition.');
        return;
      }

      const { data } = await axios.get(`${API_URL}/books/${id}/verify-access`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.hasAccess) {
        setIsPdfOpen(true);
      } else {
        toast.warning(data.message || 'You do not have access to this digital edition.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error verifying digital access.');
    } finally {
      setAccessLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchBook = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/books/${id}`);
        if (isMounted) {
          setBook(data.data.book);

          if (data.data.book?.category) {
            const relRes = await axios.get(
              `${API_URL}/books?category=${encodeURIComponent(data.data.book.category)}&limit=4`
            );
            const related = relRes.data?.data?.books || [];
            if (isMounted) {
              setRelatedBooks(related.filter((b) => b._id !== id));
            }
          }
        }
      } catch (error) {
        toast.error('Failed to load volume details.');
        console.error('Error fetching book:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBook();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleIssueBook = async () => {
    try {
      setIssueLoading(true);
      const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo'))?.data?.token);

      if (!token) {
        toast.error('Please sign in to borrow this volume.');
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_URL}/transactions/issue`,
        { bookId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Successfully borrowed "${book.title}"!`);
      const { data } = await axios.get(`${API_URL}/books/${id}`);
      setBook(data.data.book);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to borrow volume.');
    } finally {
      setIssueLoading(false);
    }
  };

  const handleReserveBook = async () => {
    try {
      setReserveLoading(true);
      const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo'))?.data?.token);

      if (!token) {
        toast.error('Please sign in to reserve this volume.');
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_URL}/transactions/reserve`,
        { bookId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Successfully reserved "${book.title}". You will be notified when ready.`);
      const { data } = await axios.get(`${API_URL}/books/${id}`);
      setBook(data.data.book);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reserve volume.');
    } finally {
      setReserveLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    try {
      const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('userInfo'))?.data?.token);

      if (!token) {
        toast.error('Please sign in to add folios to your favorites.');
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_URL}/watchlist/${book._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`"${book.title}" added to your favorites!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to favorites.');
    }
  };

  const copyCitation = () => {
    if (!book) return;
    const citation = `${book.author}. (${book.publishedYear || 'n.d.'}). ${book.title}. ${book.publisher || 'Patel & Co. Knowledge Center'}.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
    toast.info('Archival APA Citation copied to clipboard.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Retrieving Archival Folio Records...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <BookOpen className="w-14 h-14 text-slate-400 opacity-40 mb-4" />
        <h2 className="font-serif-editorial text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Folio Record Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          The requested catalog volume may have been re-indexed, archived, or removed from active circulation.
        </p>
        <Link
          to="/books"
          className="px-5 py-2.5 bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs"
        >
          Return to Archive Index
        </Link>
      </div>
    );
  }

  const isAvailable = (book.availableCopies ?? 1) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pt-4 pb-16 font-sans space-y-12"
    >
      {/* ── BREADCRUMB & BACK ────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Catalog</span>
        </button>

        {isLibrarianOrAdmin && (
          <div className="flex items-center gap-3">
            <Link
              to={`/librarian/issue?barcode=${book.isbn}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold text-xs transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Issue
            </Link>
            <Link
              to={`/librarian/copies?book=${book._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-semibold text-xs transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/20"
            >
              <BookCopy className="w-3.5 h-3.5" />
              Manage Copies
            </Link>
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 font-semibold text-xs transition-colors hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        )}
      </div>

      {/* ── FOLIO DOSSIER CARD ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111523] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Tactile Hardcover Presentation */}
        <div className="w-full md:w-2/5 p-8 lg:p-12 bg-slate-100/70 dark:bg-[#0c0f18] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-white/[0.08] relative">
          <div className="relative w-56 sm:w-64 h-80 sm:h-96 rounded-r-2xl rounded-l-xs overflow-hidden book-shadow book-spine-crease bg-slate-900 border-y border-r border-white/15 group">
            
            {/* Silk Bookmark Ribbon */}
            <div
              className="absolute -top-1 right-6 w-3.5 h-14 shadow-md z-20 bg-amber-500 group-hover:h-16 transition-all duration-300"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
            />

            {book.image ? (
              <img
                src={book.image}
                alt={`Cover for ${book.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full p-6 flex flex-col justify-between text-white relative z-10 bg-gradient-to-br from-[#1c2438] via-[#111726] to-[#090b11]">
                <div className="flex items-center justify-between font-mono text-[10px] text-amber-400">
                  <span>DEWEY 004</span>
                  <Bookmark className="w-4 h-4 opacity-60" />
                </div>
                <div className="space-y-2 my-auto">
                  <h3 className="font-serif-editorial text-2xl font-bold text-white leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-400 italic">by {book.author}</p>
                </div>
                <div className="pt-2 border-t border-white/10 font-mono text-[9px] text-slate-500 flex justify-between">
                  <span>PATEL &amp; CO.</span>
                  <span>{book.publishedYear || 'ARCHIVE'}</span>
                </div>
              </div>
            )}

            {/* Paper Edge Strip */}
            <div className="absolute top-1 bottom-1 right-0 w-1 bg-stone-300 dark:bg-stone-500 rounded-r-xs opacity-75" />
          </div>
          
          <div className="mt-8 w-full">
            {/* Availability Strict Indicator */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isAvailable 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' 
                : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
            }`}>
              <div>
                <p className={`font-bold uppercase tracking-wider text-sm ${isAvailable ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {isAvailable ? 'AVAILABLE' : 'ISSUED'}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${isAvailable ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                  {book.availableCopies} of {book.totalCopies} copies available
                </p>
              </div>
              {isAvailable ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <Clock className="w-6 h-6 text-rose-500" />
              )}
            </div>
          </div>
        </div>

        {/* Right: Archival Record Metadata & Actions */}
        <div className="w-full md:w-3/5 p-8 lg:p-12 flex flex-col justify-between space-y-8 relative">
          <div>
            {/* Title & Author */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                {book.category || 'General Collection'}
              </div>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                {book.title}
              </h1>
              <p className="font-serif-editorial text-xl text-slate-600 dark:text-slate-400 italic">
                by <span className="font-semibold not-italic font-sans text-slate-800 dark:text-slate-200">{book.author}</span>
              </p>
            </div>

            {/* High-Density Metadata Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 mb-8 text-sm">
              <div>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Hash className="w-3.5 h-3.5"/> ISBN</span>
                <span className="font-mono text-slate-900 dark:text-white">{book.isbn || 'N/A'}</span>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Building2 className="w-3.5 h-3.5"/> Publisher</span>
                <span className="font-medium text-slate-900 dark:text-white truncate" title={book.publisher}>{book.publisher || 'Independent'}</span>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Calendar className="w-3.5 h-3.5"/> Published</span>
                <span className="font-medium text-slate-900 dark:text-white">{book.publishedYear || 'Unknown'}</span>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Layers className="w-3.5 h-3.5"/> Edition</span>
                <span className="font-medium text-slate-900 dark:text-white">1st Edition</span>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Globe className="w-3.5 h-3.5"/> Language</span>
                <span className="font-medium text-slate-900 dark:text-white">English</span>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><File className="w-3.5 h-3.5"/> Pages</span>
                <span className="font-medium text-slate-900 dark:text-white">342</span>
              </div>
              <div className="col-span-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><ShieldAlert className="w-3.5 h-3.5"/> Location</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {book.branchAvailability ? Object.entries(book.branchAvailability).map(([branch, info]) => `${branch} (Shelf ${info.copies?.[0]?.shelf || 'General'})`).join(', ') : 'Main Library (2F-STK)'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-8">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Description</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {book.description || 'No detailed synopsis has been recorded for this volume. Please refer to the physical copy for jacket descriptions and index summaries.'}
              </p>
            </div>
          </div>

          {/* Action Buttons (Member/Patron View) */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center gap-3">
            {book.pdfUrl && (
              <button
                onClick={handleReadDigital}
                disabled={accessLoading}
                className="w-full sm:flex-1 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Read Digital</span>
              </button>
            )}

            <button
              onClick={handleIssueBook}
              disabled={!isAvailable || issueLoading || accessLoading}
              className={`w-full sm:flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                ${
                  isAvailable && !issueLoading
                    ? 'bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90 shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
            >
              {issueLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{issueLoading ? 'Processing...' : 'Borrow'}</span>
            </button>

            {!isAvailable && (
              <button
                onClick={handleReserveBook}
                disabled={reserveLoading}
                className="w-full sm:flex-1 py-3 rounded-xl font-bold text-sm bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90 transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {reserveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Reserve</span>
              </button>
            )}

            <button
              onClick={handleAddToFavorites}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              <span className="sm:hidden lg:inline">Favorites</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        {/* Left Column: Author & Info */}
        <div className="space-y-8">
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-slate-200/80 dark:border-white/5">
            <h3 className="font-serif-editorial text-xl font-bold text-slate-900 dark:text-white mb-3">About the Author</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-800 dark:text-slate-200">{book.author}</span> is recognized within the catalog as a seminal contributor to their field. Their works have been preserved and indexed for scholarly reference and active circulation within the Patel & Co. Knowledge Center.
            </p>
            <Link to={`/authors?q=${encodeURIComponent(book.author)}`} className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-4 hover:underline">
              View all works by {book.author} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-slate-200/80 dark:border-white/5">
            <h3 className="font-serif-editorial text-xl font-bold text-slate-900 dark:text-white mb-3">Borrowing Information</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Standard loan period is 14 days for this category.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Overdue items accrue fines of ₹5.00 per day.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Reservations will be held at the Circulation Desk for 48 hours upon return.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Reviews */}
        <div className="lg:col-span-2">
          <ReviewsSection bookId={book._id} currentUser={currentUser} />
        </div>
      </div>

      {/* ── RELATED ARCHIVAL ACQUISITIONS ───────────────────────────── */}
      {relatedBooks.length > 0 && (
        <div className="pt-12 border-t border-slate-200/80 dark:border-white/[0.08]">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                EXPLORE FURTHER
              </span>
              <h3 className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Related Books
              </h3>
            </div>
            <Link to={`/books?category=${encodeURIComponent(book.category)}`} className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => (
              <Link
                key={relBook._id}
                to={`/books/${relBook._id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#111523] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-900 rounded-r-xl rounded-l-xs overflow-hidden mb-4 book-shadow book-spine-crease relative">
                  {relBook.image ? (
                    <img
                      src={relBook.image}
                      alt={relBook.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col justify-between text-white text-xs bg-slate-800 font-serif-editorial">
                      <span className="font-mono text-[9px] text-amber-400">PATEL &amp; CO.</span>
                      <p className="font-bold line-clamp-2">{relBook.title}</p>
                      <p className="text-[10px] text-slate-400 italic">by {relBook.author}</p>
                    </div>
                  )}
                  {/* Knowledge Glass Hover Indicator */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="knowledge-glass p-2 rounded-full text-white">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-serif-editorial font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-base">
                    {relBook.title}
                  </h5>
                  <p className="text-xs text-slate-500 italic truncate mt-0.5">by {relBook.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── IN-BROWSER PDF VIEWER MODAL ──────────────────────────────── */}
      {isPdfOpen && (
        <PdfViewer
          url={book.pdfUrl}
          title={book.title}
          onClose={() => setIsPdfOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default BookDetails;