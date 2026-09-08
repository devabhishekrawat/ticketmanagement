import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notify } from '../utils/toast'
import { Ticket, UserPlus } from 'lucide-react'

export function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: 'Engineering',
    password: '',
    confirmPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      notify.warn('Passwords do not match.')
      return
    }

    if (formData.password.length < 6) {
      notify.warn('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        department: formData.department,
      })
      notify.success('Account created! You can now sign in.')
      navigate('/login')
    } catch (err) {
      notify.error(err.message || 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="card w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Ticket className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-900">Create your account</h2>
          <p className="text-xs text-slate-500 mt-1">Join internal IT Helpdesk</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Alex Johnson"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Company Email</label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex@company.internal"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Engineering">Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & Legal">Finance & Legal</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              required
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              className="form-input"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary w-full py-2.5">
            {submitting ? 'Creating account...' : 'Register'}
            <UserPlus className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
