import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Book, Users, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import MetricCard from '../components/MetricCard';
import BookCard from '../components/BookCard';
import API_URL from '../api/config';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalBooks: 0, totalUsers: 0, issuedBooks: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch books
      const { data } = await axios.get(`${API_URL}/books?limit=20`);
      
      setBooks(data.data.books || []);
      
      // Calculate basic metrics from books for demo purposes
      // In a real app, you'd fetch these from an analytics endpoint
      const allBooks = data.data.books || [];
      const totalCount = allBooks.reduce((acc, book) => acc + book.totalCopies, 0);
      const availableCount = allBooks.reduce((acc, book) => acc + book.availableCopies, 0);
      const issuedCount = totalCount - availableCount;
      
      setMetrics({
        totalBooks: totalCount,
        totalUsers: 3, // Mock data from our seed
        issuedBooks: issuedCount
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Govt Exams', 'Engineering', 'Medical', 'Commerce', 'Science (B.Sc.)', 'Arts (B.A.)', 'Management', 'Fiction', 'Computer Science'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 pb-12">
      {/* Header & Search Section */}
      <section className="pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Welcome to Patel & Co. Knowledge Center
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
            Your trusted destination for managing, accessing, and exploring knowledge with ease. Patel & Co. Limited proudly presents a modern library service designed to simplify book management and deliver seamless access to information.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 md:text-lg bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all dark:text-white placeholder-slate-400"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>
      </section>

      {/* Metrics Dashboard */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            title="Total Books" 
            value={metrics.totalBooks} 
            icon={Book} 
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" 
            delay={0.1} 
          />
          <MetricCard 
            title="Registered Users" 
            value={metrics.totalUsers} 
            icon={Users} 
            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" 
            delay={0.2} 
          />
          <MetricCard 
            title="Books Issued" 
            value={metrics.issuedBooks} 
            icon={ClipboardList} 
            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" 
            delay={0.3} 
          />
        </div>
      </section>

      {/* Main Content Layout (Sidebar + Grid) */}
      <section className="flex flex-col lg:flex-row gap-8">
        
        {/* Advanced Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Categories</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Available Books Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {selectedCategory === 'All' ? 'Available Books' : `${selectedCategory} Books`}
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm py-1 px-3 rounded-full font-medium">
                {filteredBooks.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-100 dark:bg-slate-800 animate-pulse h-80 rounded-2xl"></div>
              ))}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book, index) => (
                <BookCard key={book._id} book={book} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 border-dashed">
              <Book className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No books found</h3>
              <p className="text-slate-500">We couldn't find any books matching your filters.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
