import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Send, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import API_URL from '../api/config';

const ReviewsSection = ({ bookId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/reviews/book/${bookId}`);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to leave a review');
        return;
      }

      await axios.post(`${API_URL}/reviews`, {
        bookId,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-500" />
          User Reviews
        </h3>
        <div className="flex items-center gap-1 text-amber-500 font-bold">
          <Star className="w-5 h-5 fill-amber-500" />
          <span>{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
          <span className="text-slate-400 font-normal text-sm">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Add Review Form */}
      {currentUser && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Leave a Review</h4>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={`p-1 transition-transform hover:scale-110 ${rating >= num ? 'text-amber-500' : 'text-slate-300'}`}
              >
                <Star className={`w-8 h-8 ${rating >= num ? 'fill-amber-500' : ''}`} />
              </button>
            ))}
          </div>
          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this book..."
              className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-4 min-h-[100px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white"
            />
            <button
              type="submit"
              disabled={submitting}
              className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                {review.user?.avatar ? (
                  <img src={review.user.avatar} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  review.user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-bold text-slate-900 dark:text-white">{review.user?.name}</h5>
                  <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
              {(currentUser?._id === review.user?._id || currentUser?.role === 'admin') && (
                <button 
                  onClick={() => handleDelete(review._id)}
                  className="text-slate-300 hover:text-red-500 transition-colors self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
