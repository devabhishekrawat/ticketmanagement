import { Link, useRouteError } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function ErrorPage() {
  const error = useRouteError()

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-1 text-sm text-slate-500 max-w-md">
        {error?.statusText || error?.message || 'The page you requested was not found or an error occurred.'}
      </p>
      <Link to="/" className="btn btn-primary mt-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}

export { ErrorPage }

