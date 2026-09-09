import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin, profile } = useAuth()

  if (loading || (user && !profile)) {
    return <Loader text="Loading your workspace..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? children : <Outlet />
}

export { ProtectedRoute }
