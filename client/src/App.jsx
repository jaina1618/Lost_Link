import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Public
import LandingPage from './pages/public/LandingPage';
import BrowseLost from './pages/public/BrowseLost';
import BrowseFound from './pages/public/BrowseFound';
import ItemDetail from './pages/public/ItemDetail';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard
import DashboardHome from './pages/dashboard/DashboardHome';
import CreateLostReport from './pages/dashboard/CreateLostReport';
import CreateFoundReport from './pages/dashboard/CreateFoundReport';
import MyReports from './pages/dashboard/MyReports';
import Matches from './pages/dashboard/Matches';
import MatchDetail from './pages/dashboard/MatchDetail';
import RecoveryRequests from './pages/dashboard/RecoveryRequests';
import RequestDetail from './pages/dashboard/RequestDetail';
import Messages from './pages/dashboard/Messages';
import Conversation from './pages/dashboard/Conversation';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import ProfilePage from './pages/dashboard/ProfilePage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ItemManagement from './pages/admin/ItemManagement';
import ModerationQueue from './pages/admin/ModerationQueue';
import AdminRequests from './pages/admin/AdminRequests';

import LoadingScreen from './components/common/LoadingScreen';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/auth/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/items/lost" element={<BrowseLost />} />
        <Route path="/items/found" element={<BrowseFound />} />
        <Route path="/items/:type/:id" element={<ItemDetail />} />
      </Route>

      {/* Auth */}
      <Route path="/auth/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="reports/lost/create" element={<CreateLostReport />} />
        <Route path="reports/found/create" element={<CreateFoundReport />} />
        <Route path="reports" element={<MyReports />} />
        <Route path="matches" element={<Matches />} />
        <Route path="matches/:id" element={<MatchDetail />} />
        <Route path="requests" element={<RecoveryRequests />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:requestId" element={<Conversation />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="items" element={<ItemManagement />} />
        <Route path="reports" element={<ModerationQueue />} />
        <Route path="requests" element={<AdminRequests />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a28',
              color: '#fff',
              border: '1px solid #2a2a40',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
