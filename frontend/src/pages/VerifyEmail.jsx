import React, { useEffect, useState } from 'react';
import API_URL from '../api/config';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const { data } = await axios.get(`${API_URL}/auth/verify/${token}`);
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. Token may be expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-12 text-center"
      >
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verifying Email</h2>
            <p className="text-slate-500 dark:text-slate-400">Please wait while we confirm your account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Success!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors"
            >
              <span>Continue to Login</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>
            <div className="space-y-4">
              <Link 
                to="/register" 
                className="block w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Try Registering Again
              </Link>
              <Link to="/" className="block text-primary font-semibold text-sm">
                Back to Home
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
