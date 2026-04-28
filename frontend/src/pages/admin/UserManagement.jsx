import React, { useState, useEffect } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { Search, Edit2, Shield, ShieldAlert, Trash2, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import UserModal from '../../components/UserModal';
import Swal from 'sweetalert2';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/users?page=${page}&limit=10&search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data.data.users);
      setTotalPages(data.data.pages);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const handleUpdateUser = async (formData) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/users/${selectedUser._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User updated successfully');
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === JSON.parse(localStorage.getItem('user'))?.id) {
      return toast.error('You cannot delete your own account');
    }

    const result = await Swal.fire({
      title: 'Remove User?',
      text: "All associated transaction history will remain, but the user will lose access.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, remove',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('User removed successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to remove user');
      }
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage members, librarians, and their permissions</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
            />
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Total {users.length * totalPages} registered members
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-6 font-bold">User Identity</th>
                <th className="p-6 font-bold">Email Address</th>
                <th className="p-6 font-bold">Access Level</th>
                <th className="p-6 font-bold">Membership</th>
                <th className="p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-slate-500 font-medium text-sm">Fetching user records...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">No users found.</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600 font-black">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">{user.email}</td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${user.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                        : user.role === 'librarian' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}
                    >
                      {user.role === 'admin' ? <ShieldAlert className="w-3.5 h-3.5" /> : user.role === 'librarian' ? <Shield className="w-3.5 h-3.5" /> : null}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="text-xs font-bold text-slate-400">Since</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 font-bold">{new Date(user.membershipDate || user.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                        title="Edit Permissions"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                        title="Remove User"
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

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdateUser}
        user={selectedUser}
        loading={actionLoading}
      />
    </div>
  );
};

export default UserManagement;

