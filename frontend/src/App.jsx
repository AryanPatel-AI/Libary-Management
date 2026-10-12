import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { GOOGLE_CLIENT_ID } from './api/config';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import ProtectedRoute from './components/ProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Public Pages
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import Authors from './pages/Authors';
import Categories from './pages/Categories';
import Collections from './pages/Collections';
import Events from './pages/Events';
import LibraryInfo from './pages/LibraryInfo';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ShadcnDemo from './pages/ShadcnDemo';

// Member Experience Pages
import MainPage from './pages/MainPage';
import UserDashboard from './pages/UserDashboard';
import Watchlist from './pages/Watchlist';
import Orders from './pages/Orders';
import CurrentLoans from './pages/member/CurrentLoans';
import BorrowingHistory from './pages/member/BorrowingHistory';
import MemberReservations from './pages/member/MemberReservations';
import MemberFines from './pages/member/MemberFines';
import Notifications from './pages/member/Notifications';
import Profile from './pages/member/Profile';

// Admin Pages & Layout
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import BookManagement from './pages/admin/BookManagement';
import UserManagement from './pages/admin/UserManagement';
import CirculationDesk from './pages/admin/CirculationDesk';
import InventoryAudits from './pages/admin/InventoryAudits';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminReservations from './pages/admin/AdminReservations';
import AdminFines from './pages/admin/AdminFines';
import Reports from './pages/admin/Reports';
import LibrarySettings from './pages/admin/LibrarySettings';
import ActivityLogs from './pages/admin/ActivityLogs';
import Staff from './pages/admin/Staff';
import Roles from './pages/admin/Roles';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAuthors from './pages/admin/AdminAuthors';
import AdminPublishers from './pages/admin/AdminPublishers';

// Librarian Pages & Layout
import LibrarianLayout from './layouts/LibrarianLayout';
import LibrarianDashboard from './pages/librarian/LibrarianDashboard';
import LibrarianBooks from './pages/librarian/LibrarianBooks';
import BookCopies from './pages/librarian/BookCopies';
import LibrarianMembers from './pages/librarian/LibrarianMembers';
import IssueBooks from './pages/librarian/IssueBooks';
import ReturnBooks from './pages/librarian/ReturnBooks';
import LibrarianReservations from './pages/librarian/LibrarianReservations';
import LibrarianFines from './pages/librarian/LibrarianFines';
import LibrarianActivity from './pages/librarian/LibrarianActivity';
import LibrarianReports from './pages/librarian/LibrarianReports';

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
  const isLandingPage = location.pathname === '/';
  const isShadcnDemo = location.pathname === '/shadcn-demo';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLibrarianPage = location.pathname.startsWith('/librarian');

  const skipOuterPadding = isLandingPage || isShadcnDemo || isAdminPage || isLibrarianPage;

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col relative overflow-hidden ${darkMode ? 'dark' : ''} bg-background text-foreground`}>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <main className={`flex-1 ${skipOuterPadding ? '' : 'container mx-auto px-4 pt-24 pb-8'}`}>
          <Routes>
            {/* ── Public Library Exploration ────────────────────────────── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/books" element={<Home />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/events" element={<Events />} />
            <Route path="/library-info" element={<LibraryInfo />} />

            {/* ── Authentication ────────────────────────────────────────── */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/shadcn-demo" element={<ShadcnDemo />} />

            {/* ── Member Experience ─────────────────────────────────────── */}
            <Route path="/main" element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/loans" element={
              <ProtectedRoute>
                <CurrentLoans />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <BorrowingHistory />
              </ProtectedRoute>
            } />
            <Route path="/reservations" element={
              <ProtectedRoute>
                <MemberReservations />
              </ProtectedRoute>
            } />
            <Route path="/fines" element={
              <ProtectedRoute>
                <MemberFines />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
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

            {/* ── Librarian Experience ──────────────────────────────────── */}
            <Route path="/librarian" element={
              <ProtectedRoute requiredRole={['admin', 'librarian']}>
                <LibrarianLayout />
              </ProtectedRoute>
            }>
              <Route index element={<LibrarianDashboard />} />
              <Route path="books" element={<LibrarianBooks />} />
              <Route path="copies" element={<BookCopies />} />
              <Route path="members" element={<LibrarianMembers />} />
              <Route path="issue" element={<IssueBooks />} />
              <Route path="return" element={<ReturnBooks />} />
              <Route path="reservations" element={<LibrarianReservations />} />
              <Route path="fines" element={<LibrarianFines />} />
              <Route path="activity" element={<LibrarianActivity />} />
              <Route path="reports" element={<LibrarianReports />} />
            </Route>

            {/* ── Admin Experience ──────────────────────────────────────── */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="circulation" element={<CirculationDesk />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="fines" element={<AdminFines />} />
              <Route path="inventory" element={<InventoryAudits />} />
              <Route path="books" element={<BookManagement />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="authors" element={<AdminAuthors />} />
              <Route path="publishers" element={<AdminPublishers />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="staff" element={<Staff />} />
              <Route path="roles" element={<Roles />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<LibrarySettings />} />
              <Route path="logs" element={<ActivityLogs />} />
            </Route>
          </Routes>
        </main>

        {!isLandingPage && !isAdminPage && !isLibrarianPage && <Footer />}

        <ChatAssistant />
      </div>
    </div>
  );
}

export default App;