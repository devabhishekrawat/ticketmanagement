import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import App from '../App'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'
import Loader from '../components/Loader'

import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import UserDashboardPage from '../pages/UserDashboardPage'
import MyTicketsPage from '../pages/MyTicketsPage'
import CreateTicketPage from '../pages/CreateTicketPage'
import UserTicketDetailsPage from '../pages/UserTicketDetailsPage'
import ErrorPage from '../pages/ErrorPage'

const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'))
const PendingReviewPage = lazy(() => import('../pages/PendingReviewPage'))
const ReassignmentInboxPage = lazy(() => import('../pages/ReassignmentInboxPage'))
const AdminTicketDetailsPage = lazy(() => import('../pages/AdminTicketDetailsPage'))

function RootRedirect() {
  const { user, profile, isAdmin, loading } = useAuth()
  if (loading || (user && !profile)) {
    return <Loader text="Loading workspace..." />
  }
  return isAdmin ? <Navigate to="/admin" replace /> : <UserDashboardPage />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <RootRedirect />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <UserDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-tickets',
        element: (
          <ProtectedRoute>
            <MyTicketsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tickets/new',
        element: (
          <ProtectedRoute>
            <CreateTicketPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tickets/:id',
        element: (
          <ProtectedRoute>
            <UserTicketDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Suspense fallback={<Loader text="Loading Admin..." />}>
              <AdminDashboardPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/review',
        element: (
          <AdminRoute>
            <Suspense fallback={<Loader text="Loading Review Queue..." />}>
              <PendingReviewPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/reassignments',
        element: (
          <AdminRoute>
            <Suspense fallback={<Loader text="Loading Reassignments..." />}>
              <ReassignmentInboxPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/tickets/:id',
        element: (
          <AdminRoute>
            <Suspense fallback={<Loader text="Loading Ticket..." />}>
              <AdminTicketDetailsPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: '*',
        element: <ErrorPage />,
      },
    ],
  },
])

export default router

