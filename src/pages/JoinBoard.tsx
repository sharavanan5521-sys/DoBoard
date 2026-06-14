import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useBoard } from '../hooks/useBoards'
import { joinBoard } from '../lib/boards'

function Spinner() {
  return (
    <svg
      className="h-8 w-8 animate-spin text-indigo-600"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export default function JoinBoard() {
  const { boardId = '' } = useParams()
  const navigate = useNavigate()
  const { currentUser, loading: authLoading } = useAuth()
  const { board, loading: boardLoading } = useBoard(boardId)
  const [joining, setJoining] = useState(false)

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    )
  }

  // Not signed in → send to login, remembering where to return.
  if (!currentUser) {
    return (
      <Navigate to="/login" replace state={{ from: `/join/${boardId}` }} />
    )
  }

  if (boardLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <p className="text-base font-medium text-gray-900">
          Invite link invalid
        </p>
        <p className="mt-1 text-sm text-gray-500">
          This board doesn't exist or was deleted.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Go to dashboard
        </button>
      </div>
    )
  }

  // Already a member → straight to the board.
  if (board.members.includes(currentUser.uid)) {
    return <Navigate to={`/board/${boardId}`} replace />
  }

  async function handleJoin() {
    if (!currentUser) return
    setJoining(true)
    try {
      await joinBoard(boardId, currentUser.uid)
      toast.success('Joined the board!')
      navigate(`/board/${boardId}`)
    } catch (err) {
      console.error('Join board failed:', err)
      toast.error('Could not join board')
      setJoining(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
          style={{ backgroundColor: board.color }}
        >
          {board.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm text-gray-500">You've been invited to</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{board.name}</h1>

        <button
          type="button"
          onClick={handleJoin}
          disabled={joining}
          className="mt-7 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {joining ? 'Joining…' : 'Join Board'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
