import React, { useState, useContext } from 'react';
import API_URL from '../api/config';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Bookmark, Check, BookOpen } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import BookCover from './BookCover';

/**
 * Reusable BookCard component
 * Displays:
 * - Cover (via BookCover)
 * - Title (prominent editorial serif)
 * - Author
 * - Category
 * - Availability
 * - Publication Year (where useful)
 */
const BookCard = ({ book, index = 0 }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const isAvailable = (book.availableCopies ?? 1) > 0;
  const coverImage = book.image || book.coverImage;
  const pubYear = book.year || book.publishedYear || (book.createdAt ? new Date(book.createdAt).getFullYear() : null);

  const handleIssueBook = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please sign in to request or borrow volumes.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/transactions/issue`,
        { bookId: book._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Successfully issued "${book.title}"`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to issue volume at this time'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className="group hairline-card rounded-2xl bg-card border border-border p-4 hover:border-amber-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      <Link to={`/books/${book._id}`} className="block space-y-3.5 flex-1">
        
        {/* Cover presentation */}
        <div className="flex justify-center pt-1 pb-1">
          <BookCover
            src={coverImage}
            title={book.title}
            author={book.author}
            size="full"
            className="h-56 max-w-[170px] mx-auto group-hover:scale-[1.03] transition-transform duration-300"
          />
        </div>

        {/* Category & Availability tags */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 truncate max-w-[65%]">
            {book.category || 'Collection'}
          </span>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isAvailable
                ? 'badge-success'
                : 'badge-danger'
            }`}
          >
            {isAvailable ? 'Available' : 'Circulated'}
          </span>
        </div>

        {/* Title & Author (Strong editorial serif treatment) */}
        <div className="space-y-1">
          <h3 className="font-serif-editorial text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {book.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p className="truncate font-sans font-medium">
              {book.author || 'Anonymous'}
            </p>
            {pubYear && (
              <span className="font-mono text-[11px] text-muted-foreground shrink-0 ml-2">
                {pubYear}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Quick Action Button */}
      <div className="pt-3.5 mt-3 border-t border-border">
        <button
          onClick={handleIssueBook}
          disabled={!isAvailable || loading}
          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            isAvailable && !loading
              ? 'bg-foreground text-background hover:opacity-90 shadow-2xs'
              : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
          }`}
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
          {loading ? 'Processing...' : isAvailable ? 'Borrow Volume' : 'Join Waitlist'}
        </button>
      </div>
    </motion.div>
  );
};

export default BookCard;
