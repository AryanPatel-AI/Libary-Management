import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight, Loader2, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API_URL from '../api/config';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/ai/recommendations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Recommendations</h2>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended for You</h2>
        </div>
        <Link to="/books" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
          Explore All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recommendations.map((book, index) => (
          <motion.div
            key={book._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              to={`/books/${book._id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group"
            >
              <div className="w-12 h-16 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                {book.image ? (
                  <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                  <Book className="w-full h-full p-2 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 transition-colors">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-500 truncate">{book.author}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < Math.round(book.rating || 0) ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">({book.numReviews || 0})</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AIRecommendations;
