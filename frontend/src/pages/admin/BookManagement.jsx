import React, { useState, useEffect } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import BookModal from '../../components/BookModal';
import Swal from 'sweetalert2';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/books?page=${page}&limit=10&search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(data.data.books);
      setTotalPages(data.data.pages);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, searchTerm]);

  const handleSaveBook = async (formData) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (selectedBook) {
        await axios.put(`${API_URL}/books/${selectedBook._id}`, formData, { headers });
        toast.success('Book updated successfully');
      } else {
        await axios.post(`${API_URL}/books`, formData, { headers });
        toast.success('Book added successfully');
      }
      
      setIsModalOpen(false);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save book');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently remove the book from the system.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Book deleted successfully');
        fetchBooks();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete book');
      }
    }
  };

  const openAddModal = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Book Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Add, update, or remove books from the library</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Book
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title, author, ISBN..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
            />
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Showing {books.length} of {totalPages * 10} books
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-6 font-bold">Book Info</th>
                <th className="p-6 font-bold">Category</th>
                <th className="p-6 font-bold">Stock Status</th>
                <th className="p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-slate-500 font-medium text-sm">Synchronizing inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">No books found matching your criteria.</td>
                </tr>
              ) : books.map((book) => (
                <tr key={book._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                        {book.image ? <img src={book.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">NO IMG</div>}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{book.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{book.author}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>ISBN: {book.isbn}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
                      {book.category}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <span>Availability</span>
                        <span>{book.availableCopies}/{book.totalCopies}</span>
                      </div>
                      <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${book.availableCopies === 0 ? 'bg-red-500' : 'bg-indigo-500'}`}
                          style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => openEditModal(book)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                        title="Edit Details"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(book._id)}
                        className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                        title="Delete Book"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Page <span className="text-slate-900 dark:text-white">{page}</span> of {totalPages || 1}
          </div>
          <div className="flex gap-3">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-slate-300 transition-all shadow-sm"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages || totalPages === 0} 
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-slate-300 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <BookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBook}
        book={selectedBook}
        loading={actionLoading}
      />
    </div>
  );
};

export default BookManagement;

