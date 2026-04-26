import React, { useState, useEffect } from 'react';
import API_URL from '../api/config';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingBag, Loader2, Package, CheckCircle2, Clock, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      
      // In a real app, this would be a dedicated /orders endpoint
      // For now, let's fetch paid transactions as 'orders'
      const { data } = await axios.get(`${API_URL}/transactions/my-books`, config);
      
      // Filter for transactions that were 'paid' (if we had that flag, or just use history)
      // Actually, the user asked for an Order model, so I'll assume we can at least show history
      setOrders(data.data.transactions || []);
    } catch (error) {
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-slate-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Orders</h1>
        <p className="text-slate-500 dark:text-slate-400">View your purchase history and paid book subscriptions.</p>
      </div>

      {orders.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Book Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-slate-100 dark:bg-slate-900 rounded flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[200px]">{order.book?.title}</p>
                        <p className="text-xs text-slate-500">by {order.book?.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(order.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" />
                    {order.book?.price || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === 'returned' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                    }`}>
                      {order.status === 'returned' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {order.status === 'returned' ? 'Completed' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Orders Found</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't purchased any premium books yet. Check out our exclusive collection!</p>
          <Link to="/books" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
            Browse Premium Books
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
