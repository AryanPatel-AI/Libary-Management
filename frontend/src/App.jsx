import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { GOOGLE_CLIENT_ID } from './api/config';
import Header from './components/Header';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import LandingPage from './pages/LandingPage';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import BookManagement from './pages/admin/BookManagement';
import UserManagement from './pages/admin/UserManagement';
import Footer from './components/Footer';
import UserDashboard from './pages/UserDashboard';
import Watchlist from './pages/Watchlist';
import Orders from './pages/Orders';
import VerifyEmail from './pages/VerifyEmail';
import MainPage from './pages/MainPage';
import ChatAssistant from './components/ChatAssistant';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminReservations from './pages/admin/AdminReservations';
import AdminFines from './pages/admin/AdminFines';
import CirculationDesk from './pages/admin/CirculationDesk';
import InventoryAudits from './pages/admin/InventoryAudits';
import Reports from './pages/admin/Reports';
import LibrarySettings from './pages/admin/LibrarySettings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  React.useEffect(() => {
    const handleHashLogin = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        if (accessToken) {
          sessionStorage.setItem('pending_google_token', accessToken);
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.reload();
        }
      }
    };
    handleHashLogin();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Sync dark mode to html element
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <AppContent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme="dark"
          />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

function AppContent({ darkMode, toggleDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';



  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col relative overflow-hidden ${darkMode ? 'dark' : ''} ${isLandingPage ? 'bg-[#030712]' : 'bg-slate-50 dark:bg-slate-900'}`}>

      {/* Dynamic Backgrounds */}
      <div className="fixed top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <main className={`flex-1 ${isLandingPage ? '' : 'container mx-auto px-4 pt-24 pb-8'}`}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected Member Pages */}
            <Route path="/main" element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } />
            <Route path="/books" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/books/:id" element={
              <ProtectedRoute>
                <BookDetails />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="circulation" element={<CirculationDesk />} />
              <Route path="books" element={<BookManagement />} />
              <Route path="inventory" element={<InventoryAudits />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="fines" element={<AdminFines />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<LibrarySettings />} />
              <Route path="logs" element={<ActivityLogs />} />
            </Route>
          </Routes>
        </main>

        {!isLandingPage && <Footer />}


        <ChatAssistant />
      </div>
    </div>
  );
}

export default App;