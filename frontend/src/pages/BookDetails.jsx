import React, { useState, useEffect, useContext } from 'react';
import API_URL from '../api/config';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Loader2, Calendar, User, Tag, Info, CheckCircle2, XCircle, Bookmark } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import PdfViewer from '../components/PdfViewer';
import ReviewsSection from '../components/ReviewsSection';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issueLoading, setIssueLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  const currentUser = user?.data || user;
  const hasPurchased = book ? currentUser?.purchasedBooks?.includes(book._id) : false;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/books/${id}`);
        setBook(data.data.book);
      } catch (error) {
        toast.error('Failed to load book details.');
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleIssueBook = async () => {
    try {
      setIssueLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.data?.token || userInfo?.token;
      
      if (!token) {
        toast.error('Please login to issue a book.');
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.post(
        `${API_URL}/transactions/issue`,
        { bookId: book._id },
        config
      );

      toast.success(`Successfully issued "${book.title}"!`);
      // Update local state to reflect the change
      setBook(prev => ({
        ...prev,
        availableCopies: prev.availableCopies - 1
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue book. Please try again.');
    } finally {
      setIssueLoading(false);
    }
  };

  const handleBuyBook = async () => {
    try {
      setBuyLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.data?.token || userInfo?.token;
      
      if (!token) {
        toast.error('Please login to buy a book.');
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.post(
        `${API_URL}/transactions/buy`,
        { bookId: book._id },
        config
      );

      toast.success(`Successfully purchased "${book.title}"!`);
      
      // Update local user context
      if (currentUser && currentUser.purchasedBooks) {
        const updatedUser = { ...user };
        if (updatedUser.data) {
           updatedUser.data.purchasedBooks = [...updatedUser.data.purchasedBooks, book._id];
        } else {
           updatedUser.purchasedBooks = [...updatedUser.purchasedBooks, book._id];
        }
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        if (setUser) setUser(updatedUser);
      } else {
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to buy book. Please try again.');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        toast.error('Please login to add books to your watchlist.');
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      await axios.post(
        `${API_URL}/watchlist/${book._id}`,
        {},
        config
      );

      toast.success(`"${book.title}" added to your watchlist!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to watchlist.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Book Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">The book you are looking for does not exist or has been removed.</p>
        <Link to="/books" className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pt-4 pb-12"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row">
        {/* Book Image */}
        <div className="w-full md:w-1/3 lg:w-2/5 bg-slate-50 dark:bg-slate-900 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 relative">
          {book.image ? (
            <img 
              src={book.image} 
              alt={`Cover for ${book.title}`} 
              className="max-w-full h-auto rounded-xl shadow-lg object-contain max-h-[500px]"
            />
          ) : (
            <BookOpen className="w-32 h-32 text-slate-300 dark:text-slate-600" />
          )}
        </div>

        {/* Book Details */}
        <div className="w-full md:w-2/3 lg:w-3/5 p-8 lg:p-12 flex flex-col">
          <div className="mb-6 flex flex-wrap gap-3 items-center">
            <span className="px-3 py-1 bg-primary/10 text-primary font-semibold text-sm rounded-lg uppercase tracking-wider">
              {book.category}
            </span>
            <span className={`px-3 py-1 flex items-center gap-1.5 font-medium text-sm rounded-lg ${
              isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
            }`}>
              {isAvailable ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {isAvailable ? `${book.availableCopies} Available` : 'Out of Stock'}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
            {book.title}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mb-8 flex items-center gap-2">
            <User className="w-5 h-5" />
            by {book.author}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Published Year
              </span>
              <span className="font-medium text-slate-900 dark:text-white">{book.publishedYear || 'Unknown'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Tag className="w-4 h-4" /> ISBN
              </span>
              <span className="font-medium text-slate-900 dark:text-white">{book.isbn || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Info className="w-4 h-4" /> Total Copies
              </span>
              <span className="font-medium text-slate-900 dark:text-white">{book.totalCopies}</span>
            </div>
          </div>

          <div className="mb-10 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Description</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {book.description || 'No description available for this book.'}
            </p>
          </div>

          <div className="mt-auto border-t border-slate-200 dark:border-slate-700 pt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-4">
              {book.isPaid ? (
                hasPurchased ? (
                  <button
                    className="flex-1 py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 shadow-md bg-green-500 text-white hover:bg-green-600 hover:shadow-lg"
                    onClick={() => book.pdfUrl ? setIsPdfOpen(true) : toast.info('Digital copy not available yet')}
                  >
                    Read Digital Edition
                  </button>
                ) : (
                  <button
                    className="flex-1 py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 shadow-md bg-primary text-white hover:bg-primary-hover hover:shadow-lg"
                    onClick={handleBuyBook}
                    disabled={buyLoading}
                  >
                    {buyLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {buyLoading ? 'Processing...' : `Buy ₹${book.price}`}
                  </button>
                )
              ) : (
                <button
                  onClick={() => {
                    if (book.pdfUrl) {
                      setIsPdfOpen(true);
                    } else {
                      handleIssueBook();
                    }
                  }}
                  disabled={(!isAvailable && !book.pdfUrl) || issueLoading}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 shadow-md
                    ${(isAvailable || book.pdfUrl) && !issueLoading
                      ? 'bg-primary text-white hover:bg-primary-hover hover:shadow-lg' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500 shadow-none'
                    }`}
                >
                  {issueLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {issueLoading ? 'Processing...' : (book.pdfUrl ? 'Read Digital' : (isAvailable ? 'Issue Free' : 'Currently Unavailable'))}
                </button>
              )}
            </div>
            
            <button
              onClick={handleAddToWatchlist}
              className="px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
              <span>Watchlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection bookId={book._id} currentUser={currentUser} />

      {/* PDF Viewer Modal */}
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