import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'
import { PlusCircle, LogOut, Ticket, Inbox, RefreshCw, LayoutDashboard } from 'lucide-react'

export function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">Tickify</span>
              {/* <span className="hidden text-xs text-slate-400 sm:inline ml-1 font-normal">Desk</span> */}
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
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className={`h-4 w-4 ${isActive('/dashboard') ? 'text-blue-600' : 'text-slate-400'}`} />
                    Dashboard
                  </Link>

                  <Link
                    to="/my-tickets"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/my-tickets')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Ticket className={`h-4 w-4 ${isActive('/my-tickets') ? 'text-blue-600' : 'text-slate-400'}`} />
                    My Tickets
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/admin"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/admin')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className={`h-4 w-4 ${isActive('/admin') ? 'text-blue-600' : 'text-slate-400'}`} />
                    Support Overview
                  </Link>

                  <Link
                    to="/admin/review"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/admin/review')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Inbox className={`h-4 w-4 ${isActive('/admin/review') ? 'text-blue-600' : 'text-slate-400'}`} />
                    Review Queue
                  </Link>

                  <Link
                    to="/admin/reassignments"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/admin/reassignments')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 ${isActive('/admin/reassignments') ? 'text-blue-600' : 'text-slate-400'}`} />
                    Reassignments
                  </Link>

                  <span className="h-4 w-px bg-slate-200 mx-1" />

                  <Link
                    to="/my-tickets"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive('/my-tickets')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Ticket className={`h-4 w-4 ${isActive('/my-tickets') ? 'text-blue-600' : 'text-slate-400'}`} />
                    My Tickets
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/tickets/new"
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive('/tickets/new')
                    ? 'bg-blue-700 text-white shadow-xs ring-2 ring-blue-300'
                    : 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                New Ticket
              </Link>

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
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  isActive('/login')
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  isActive('/register')
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
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

export default Navbar
