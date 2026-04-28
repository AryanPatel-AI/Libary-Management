import React, { useState, useEffect } from 'react';
import API_URL from '../api/config';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bookmark, Loader2, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Watchlist = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/watchlist`, config);
      setBooks(data.data.books || []);
    } catch (error) {
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/watchlist/${id}`, config);
      setBooks(prev => prev.filter(b => b._id !== id));
      toast.success('Removed from watchlist');
    } catch (error) {
      toast.error('Failed to remove book');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-slate-500">Loading your watchlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Watchlist</h1>
        <p className="text-slate-500 dark:text-slate-400">Books you've saved to read or issue later.</p>
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <motion.div 
              key={book._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 flex gap-4">
                <div className="w-20 h-28 bg-slate-100 dark:bg-slate-900 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                  {book.image ? (
                    <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{book.title}</h3>
                  <p className="text-sm text-slate-500 mb-2 truncate">by {book.author}</p>
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                    {book.category}
                  </span>
                </div>
              </div>
              <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <Link 
                  to={`/books/${book._id}`}
                  className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => handleRemove(book._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Bookmark className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your Watchlist is Empty</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Found something interesting? Add it to your watchlist so you don't lose track of it!</p>
          <Link to="/books" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
            Explore Books
          </Link>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
