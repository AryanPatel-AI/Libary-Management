import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Library, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccessfulRedirect = (userData) => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');

    if (userData?.data?.role === 'admin') {
      navigate('/admin');
    } else if (redirect) {
      navigate(redirect);
    } else {
      navigate('/books');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Successfully logged in!');
      handleSuccessfulRedirect(data);
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await googleLogin(credentialResponse.credential);
      toast.success('Successfully logged in with Google!');
      handleSuccessfulRedirect(data);
    } catch (err) {
      toast.error(err.message || 'Google Login failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Login failed');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white dark:bg-[#111523] p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs relative"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center mb-4 shadow-xs">
            <Library className="w-6 h-6 text-amber-500 dark:text-amber-600" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold block mb-1">
            SCHOLAR ACCESS DESK
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            Sign In to Repository
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Access your active loans, saved folios, and digital vaults.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 font-bold">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-amber-500 outline-none transition-colors text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="scholar@university.edu"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
                Passphrase
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
              >
                Reset Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-amber-500 outline-none transition-colors text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white dark:text-slate-950 bg-slate-950 dark:bg-amber-500 hover:opacity-90 transition-all shadow-xs active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate'}</span>
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="px-2 bg-white dark:bg-[#111523] text-slate-400">
                Or Federated Identity
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              shape="pill"
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Not yet registered in the archive?{' '}
          <Link to="/signup" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">
            Enroll as Scholar
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;