import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    // Redirect non-admin users to their appropriate dashboard
    if (user.role === 'doctor') {
      return <Navigate to="/doctor/appointments" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
