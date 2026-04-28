import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

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
import LoginModal from './components/LoginModal';
import ChatAssistant from './components/ChatAssistant';
import ActivityLogs from './pages/admin/ActivityLogs';

import { GoogleOAuthProvider } from '@react-oauth/google';

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

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <GoogleOAuthProvider clientId="475792246807-vdvmuphc9ntb58e0rsjfs2uu519bfvlk.apps.googleusercontent.com">
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
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
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
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
        
        <main className={`flex-1 ${isLandingPage ? '' : 'container mx-auto px-4 pt-24 pb-8'}`}>
          <Routes>
            <Route path="/" element={<LandingPage onOpenLogin={() => setIsLoginModalOpen(true)} />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/books" element={<Home />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<BookManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="logs" element={<ActivityLogs />} />
            </Route>
          </Routes>
        </main>

        {!isLandingPage && <Footer />}

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
        <ChatAssistant />
      </div>
    </div>
  );
}

export default App;