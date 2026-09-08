import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'
import { Shield, PlusCircle, LogOut, Ticket, Inbox, RefreshCw, LayoutDashboard } from 'lucide-react'

export function Navbar() {
  const { user, profile, signOut, isAdmin, switchDemoRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">IT Support</span>
              <span className="hidden text-xs text-slate-400 sm:inline ml-1 font-normal">Desk</span>
            </div>
          </Link>

                    {user && (
            <nav className="hidden md:flex items-center gap-1">
              {!isAdmin ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/dashboard')
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-slate-400" />
                    Dashboard
                  </Link>

                  <Link
                    to="/my-tickets"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/my-tickets')
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Ticket className="h-4 w-4 text-slate-400" />
                    My Tickets
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/admin"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/admin')
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-slate-400" />
                    Support Overview
                  </Link>

                  <Link
                    to="/admin/review"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/admin/review')
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Inbox className="h-4 w-4 text-slate-400" />
                    Review Queue
                  </Link>

                  <Link
                    to="/admin/reassignments"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/admin/reassignments')
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <RefreshCw className="h-4 w-4 text-slate-400" />
                    Reassignments
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

                <div className="flex items-center gap-3">
          {user ? (
            <>
                            {!isAdmin && (
                <Link
                  to="/tickets/new"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-xs hover:bg-blue-700 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Ticket
                </Link>
              )}

                            <div className="hidden lg:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
                <button
                  type="button"
                  onClick={() => switchDemoRole('USER')}
                  className={`px-2 py-1 rounded-md transition font-medium ${
                    !isAdmin ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Switch view to normal employee"
                >
                  User View
                </button>
                <button
                  type="button"
                  onClick={() => switchDemoRole('ADMIN')}
                  className={`px-2 py-1 rounded-md transition font-medium ${
                    isAdmin ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Switch view to administrator"
                >
                  Admin View
                </button>
              </div>

                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-xs">
                <Avatar name={profile?.full_name || user.email} size="sm" />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                    {profile?.role || 'USER'}
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="ml-1 text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
