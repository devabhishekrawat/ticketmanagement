import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { ROUTES } from '../../shared/constants/routes'
import { notify } from '../../shared/utils/toast'
import { Ticket, ArrowRight, ShieldCheck, User } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, demoLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      notify.warn('Please fill in both email and password.')
      return
    }

    setSubmitting(true)
    try {
      await signIn(email, password)
      notify.success('Welcome back!')
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      notify.error(err.message || 'Unable to sign in. Check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoSignIn = (role) => {
    demoLogin(role)
    notify.success(`Logged in as Demo ${role === 'ADMIN' ? 'Admin' : 'Employee'}`)
    navigate(role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="card w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Ticket className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-900">Sign in to IT Support</h2>
          <p className="text-xs text-slate-500 mt-1">
            Internal IT Helpdesk & Ticket Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary w-full py-2.5">
            {submitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Quick Reviewer Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('USER')}
              className="btn btn-sm btn-secondary"
            >
              <User className="h-3.5 w-3.5 text-blue-600" />
              Demo Employee
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('ADMIN')}
              className="btn btn-sm btn-secondary"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
              Demo Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
