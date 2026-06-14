import { useAuth } from '../contexts/AuthContext'
import { getInitials } from '../lib/utils'

export default function Dashboard() {
  const { currentUser, signOut } = useAuth()
  const displayName = currentUser?.displayName ?? currentUser?.email ?? 'there'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            DB
          </div>
          <span className="text-lg font-semibold text-gray-900">DoBoard</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {getInitials(displayName)}
          </div>
          <span className="hidden text-sm text-gray-700 sm:inline">
            {displayName}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your boards will appear here.
        </p>
      </main>
    </div>
  )
}
