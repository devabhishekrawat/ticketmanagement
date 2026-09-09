import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin, profile } = useAuth()

  if (loading || (user && !profile)) {
    return <Loader text="Verifying administrator permissions..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? children : <Outlet />
}

export { AdminRoute }

