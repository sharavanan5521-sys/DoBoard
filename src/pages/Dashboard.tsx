import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBoards } from '../hooks/useBoards'
import { getInitials } from '../lib/utils'
import BoardCard from '../components/boards/BoardCard'
import CreateBoardModal from '../components/boards/CreateBoardModal'

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>
      <div className="mt-4 h-3 w-20 rounded bg-gray-200" />
      <div className="mt-3 h-2 w-full rounded-full bg-gray-200" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-6 rounded-full bg-gray-200" />
        <div className="h-6 w-6 rounded-full bg-gray-200" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { currentUser, signOut } = useAuth()
  const { boards, loading, createBoard } = useBoards()
  const [showModal, setShowModal] = useState(false)

  const displayName = currentUser?.displayName ?? currentUser?.email ?? 'there'

  async function handleCreate(name: string, color: string) {
    await createBoard(name, color)
  }

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
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            + New Board
          </button>
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

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Your boards</h1>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : boards.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
              📋
            </div>
            <p className="mt-4 text-base font-medium text-gray-900">
              No boards yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create one to get started.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              + New Board
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateBoardModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
