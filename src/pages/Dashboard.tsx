import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useBoards } from '../hooks/useBoards'
import { getInitials } from '../lib/utils'
import BoardCard from '../components/boards/BoardCard'
import CreateBoardModal from '../components/boards/CreateBoardModal'
import { CardSkeleton } from '../components/shared/Skeleton'

export default function Dashboard() {
  const { currentUser, signOut } = useAuth()
  const { boards, loading, createBoard } = useBoards()
  const [showModal, setShowModal] = useState(false)

  const displayName = currentUser?.displayName ?? currentUser?.email ?? 'there'

  async function handleCreate(name: string, color: string) {
    try {
      await createBoard(name, color)
      toast.success('Board created')
    } catch (err) {
      console.error('createBoard failed:', err)
      toast.error('Could not create board')
      throw err
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            DB
          </div>
          <span className="text-lg font-semibold text-gray-900">DoBoard</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex min-h-[44px] items-center rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <span className="sm:hidden">+ New</span>
            <span className="hidden sm:inline">+ New Board</span>
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
            className="flex min-h-[44px] items-center rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-bold text-gray-900">Your boards</h1>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : boards.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-4xl">
              📋
            </div>
            <p className="mt-5 text-lg font-semibold text-gray-900">
              No boards yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create your first board to get started.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-6 min-h-[44px] rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700"
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
