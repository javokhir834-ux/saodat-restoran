import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Foydalanish: <PrivateRoute rol="admin"> yoki <PrivateRoute> (har qanday rol)
export default function PrivateRoute({ children, rol }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (rol && user.rol !== rol) {
    // Kassirni admin sahifasiga kirishining oldini olish
    return <Navigate to={user.rol === 'kassir' ? '/kassir' : '/admin'} replace />;
  }
  return children;
}
