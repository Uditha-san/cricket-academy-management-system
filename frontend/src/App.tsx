import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StatsProvider } from './contexts/StatsContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import GuestDashboard from './pages/guest/GuestDashboard';
import PlayerDashboard from './pages/player/PlayerDashboard';
import CoachDashboard from './pages/coach/CoachDashboard';
import AttendancePage from './pages/coach/AttendancePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CourBookingPage from './pages/shared/CourtBookingPage';
import MachineRentalPage from './pages/shared/MachineRentalPage';
import EquipmentShopPage from './pages/shared/EquipmentShopPage';
import PlayerStatsPage from './pages/player/PlayerStatsPage';
import PlayerProfilePage from './pages/player/PlayerProfilePage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';
import ManageEquipmentPage from './pages/admin/ManageEquipmentPage';
import ManagePlayersPage from './pages/admin/ManagePlayersPage';
import ReportsPage from './pages/admin/ReportsPage';
import Header from './components/layout/Header';
import MobileNavigation from './components/layout/MobileNavigation';

function Dashboard() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Note: user is null here if not logged in, but MainApp handles that logic usually.
  // However, we need to handle the case where we are at / but not logged in.

  if (!user) return <Navigate to="/login" replace />;

  const renderPage = () => {
    if (user.role === 'guest') {
      switch (currentPage) {
        case 'dashboard':
          return <GuestDashboard onNavigate={setCurrentPage} />;
        case 'booking':
          return <CourBookingPage onNavigate={setCurrentPage} />;
        case 'rental':
          return <MachineRentalPage onNavigate={setCurrentPage} />;
        case 'shop':
          return <EquipmentShopPage onNavigate={setCurrentPage} />;
        default:
          return <GuestDashboard onNavigate={setCurrentPage} />;
      }
    }

    if (user.role === 'player') {
      switch (currentPage) {
        case 'dashboard':
          return <PlayerDashboard onNavigate={setCurrentPage} />;
        case 'booking':
          return <CourBookingPage onNavigate={setCurrentPage} />;
        case 'rental':
          return <MachineRentalPage onNavigate={setCurrentPage} />;
        case 'shop':
          return <EquipmentShopPage onNavigate={setCurrentPage} />;
        case 'stats':
          return <PlayerStatsPage onNavigate={setCurrentPage} />;
        case 'profile':
          return <PlayerProfilePage onNavigate={setCurrentPage} />;
        default:
          return <PlayerDashboard onNavigate={setCurrentPage} />;
      }
    }

    if (user.role === 'coach') {
      switch (currentPage) {
        case 'dashboard':
          return <CoachDashboard />;
        case 'attendance':
          return <AttendancePage onNavigate={setCurrentPage} />;
        default:
          return <CoachDashboard />;
      }
    }

    if (user.role === 'admin') {
      switch (currentPage) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setCurrentPage} />;
        case 'bookings':
          return <ManageBookingsPage onNavigate={setCurrentPage} />;
        case 'equipment':
          return <ManageEquipmentPage onNavigate={setCurrentPage} />;
        case 'players':
          return <ManagePlayersPage onNavigate={setCurrentPage} />;
        case 'reports':
          return <ReportsPage onNavigate={setCurrentPage} />;
        default:
          return <AdminDashboard onNavigate={setCurrentPage} />;
      }
    }
  };

  const showMobileNav = user.role === 'player';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onLogout={logout}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <main className={showMobileNav ? 'pb-20' : ''}>
        {renderPage()}
      </main>
      {showMobileNav && (
        <MobileNavigation
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
      )}
    </div>
  );
}

function AuthScreens() {
  const { user } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  if (showForgotPassword) {
    return <ForgotPasswordPage onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return showRegistration ? (
    <RegistrationPage onSwitchToLogin={() => setShowRegistration(false)} />
  ) : (
    <LoginPage
      onSwitchToRegistration={() => setShowRegistration(true)}
      onSwitchToForgotPassword={() => setShowForgotPassword(true)}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <StatsProvider>
            <Routes>
              <Route path="/login" element={<AuthScreens />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/" element={<Dashboard />} />
              {/* Catch all redirect to root (which redirects to login if needed) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </StatsProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;