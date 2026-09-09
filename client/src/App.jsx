import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import StudentFormPage from './pages/StudentFormPage';
import StudentDetailPage from './pages/StudentDetailPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { token, loading } = useAuth();

  // Don't render routes until we know the auth state
  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/signup"
        element={token ? <Navigate to="/dashboard" replace /> : <SignUpPage />}
      />
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <SignInPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/new"
        element={
          <ProtectedRoute>
            <StudentFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <ProtectedRoute>
            <StudentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id/edit"
        element={
          <ProtectedRoute>
            <StudentFormPage />
          </ProtectedRoute>
        }
      />
      {/* Default: redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
