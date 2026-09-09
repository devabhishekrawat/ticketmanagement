export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <p className="text-xs font-medium text-slate-500">{text}</p>
    </div>
  )
}
