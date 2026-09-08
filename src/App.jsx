import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider, useAuth } from '../shared/context/AuthContext'
import { ROUTES } from '../shared/constants/routes'
import { Navbar } from '../shared/components/Navbar'
import { ProtectedRoute } from '../shared/components/ProtectedRoute'

import { LoginPage } from '../src1/pages/LoginPage'
import { RegisterPage } from '../src1/pages/RegisterPage'
import { UserDashboardPage } from '../src1/pages/UserDashboardPage'
import { CreateTicketPage } from '../src1/pages/CreateTicketPage'
import { MyTicketsPage } from '../src1/pages/MyTicketsPage'
import { UserTicketDetailsPage } from '../src1/pages/UserTicketDetailsPage'

import { AdminDashboardPage } from '../src2/pages/AdminDashboardPage'
import { PendingReviewPage } from '../src2/pages/PendingReviewPage'
import { ReassignmentInboxPage } from '../src2/pages/ReassignmentInboxPage'
import { AdminTicketDetailsPage } from '../src2/pages/AdminTicketDetailsPage'

function AppRoutes() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Connecting to workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {}
          <Route
            path={ROUTES.LOGIN}
            element={user ? <Navigate to={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD} replace /> : <LoginPage />}
          />
          <Route
            path={ROUTES.REGISTER}
            element={user ? <Navigate to={ROUTES.DASHBOARD} replace /> : <RegisterPage />}
          />

          {}
          <Route
            path="/"
            element={<Navigate to={user ? (isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD) : ROUTES.LOGIN} replace />}
          />

          {}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.DASHBOARD} element={<UserDashboardPage />} />
            <Route path={ROUTES.MY_TICKETS} element={<MyTicketsPage />} />
            <Route path={ROUTES.CREATE_TICKET} element={<CreateTicketPage />} />
            <Route path={ROUTES.TICKET_DETAILS} element={<UserTicketDetailsPage />} />
          </Route>

          {}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_PENDING_REVIEW} element={<PendingReviewPage />} />
            <Route path={ROUTES.ADMIN_REASSIGNMENTS} element={<ReassignmentInboxPage />} />
            <Route path={ROUTES.ADMIN_TICKET_DETAILS} element={<AdminTicketDetailsPage />} />
          </Route>

          {}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
