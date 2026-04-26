import React, { useState, useContext } from 'react';
import API_URL from '../api/config';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';

const BookCard = ({ book, index }) => {
  const [loading, setLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const isAvailable = book.availableCopies > 0;
  
  // user might be structured as { success: true, data: { ... } }
  const currentUser = user?.data || user;
  const hasPurchased = currentUser?.purchasedBooks?.includes(book._id);

  const handleIssueBook = async () => {
    try {
      setLoading(true);
      let userInfo;
      try {
        userInfo = JSON.parse(localStorage.getItem('userInfo'));
      } catch (parseError) {
        console.error('Failed to parse userInfo from localStorage:', parseError);
        toast.error('Session data corrupted. Please login again.');
        navigate('/login');
        return;
      }
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
      // Re-fetch or handle state via parent component
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyBook = async (e) => {
    e.preventDefault();
    try {
      setBuyLoading(true);
      let userInfo;
      try {
        userInfo = JSON.parse(localStorage.getItem('userInfo'));
      } catch (parseError) {
        console.error('Failed to parse userInfo from localStorage:', parseError);
        toast.error('Session data corrupted. Please login again.');
        navigate('/login');
        return;
      }
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
        // Fallback reload if structure is unexpected
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to buy book. Please try again.');
    } finally {
      setBuyLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full group"
    >
      <Link to={`/books/${book._id}`} className="flex-1 flex flex-col block">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl h-48 mb-4 flex items-center justify-center text-slate-300 dark:text-slate-600 overflow-hidden relative group-hover:shadow-inner">
          {book.image ? (
            <img 
              src={book.image} 
              alt={`Cover for ${book.title}`} 
              loading="lazy" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
          ) : (
            <BookOpen className="w-16 h-16 group-hover:scale-110 transition-transform duration-500" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md truncate max-w-[50%]">
              {book.category}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-md shrink-0 ${isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
              {isAvailable ? `${book.availableCopies} Left` : 'Out of Stock'}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate">
            by {book.author}
          </p>
        </div>
      </Link>

      {book.isPaid ? (
        hasPurchased ? (
          <button
            className="w-full py-2.5 rounded-xl font-medium text-sm transition-all flex justify-center items-center gap-2 bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              toast.success(`Accessing PDF / Content for ${book.title}`);
            }}
          >
            Read Content
          </button>
        ) : (
          <button
            onClick={handleBuyBook}
            disabled={buyLoading}
            className="w-full py-2.5 rounded-xl font-medium text-sm transition-all flex justify-center items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg"
          >
            {buyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {buyLoading ? 'Processing...' : `Buy ₹${book.price}`}
          </button>
        )
      ) : (
        <button
          onClick={handleIssueBook}
          disabled={!isAvailable || loading}
          className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all flex justify-center items-center gap-2
            ${isAvailable && !loading
              ? 'bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
            }`}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Processing...' : (isAvailable ? 'Read Free' : 'Not Available')}
        </button>
      )}
    </motion.div>
  );
};

export default BookCard;
