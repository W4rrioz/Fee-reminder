import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard — redirects to /login if there's no active session.
 * Shows nothing while the initial session check is loading.
 */
export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-page">
        <div className="spinner" style={{ borderColor: 'rgba(30,79,203,0.2)', borderTopColor: '#1E4FCB' }} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
