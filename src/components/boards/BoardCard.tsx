import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Board } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { useTaskCounts } from '../../hooks/useTasks'
import { useMembers } from '../../hooks/useMembers'
import { usePresence } from '../../hooks/usePresence'
import { deleteBoard } from '../../lib/boards'
import Avatar from '../shared/Avatar'
import ProgressBar from '../shared/ProgressBar'

interface BoardCardProps {
  board: Board
}

export default function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { total, done } = useTaskCounts(board.id)
  const { members } = useMembers(board.members)
  const onlineUserIds = usePresence(board.id, { heartbeat: false })
  const [deleting, setDeleting] = useState(false)

  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  const visibleMembers = board.members.slice(0, 3)
  const extraMembers = board.members.length - visibleMembers.length
  const onlineCount = onlineUserIds.length
  const isOwner = currentUser?.uid === board.createdBy

  function memberName(uid: string): string {
    if (currentUser && uid === currentUser.uid) {
      return currentUser.displayName ?? currentUser.email ?? 'You'
    }
    return members[uid]?.name ?? uid
  }

  function open() {
    navigate(`/board/${board.id}`)
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm(`Delete "${board.name}" and all its tasks?`)) return
    setDeleting(true)
    try {
      await deleteBoard(board.id)
      toast.success('Board deleted')
    } catch (err) {
      console.error('deleteBoard failed:', err)
      toast.error('Could not delete board')
      setDeleting(false)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
      className={`group relative w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        deleting ? 'pointer-events-none opacity-50' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-2 pr-8">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: board.color }}
        />
        <h3 className="truncate text-base font-semibold text-gray-900">
          {board.name}
        </h3>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {done} of {total} done
      </p>
      <div className="mt-2">
        <ProgressBar value={percent} color={board.color} />
      </div>

      <div className="mt-4 flex items-center">
        <div className="flex -space-x-2">
          {visibleMembers.map((uid) => (
            <Avatar
              key={uid}
              name={memberName(uid)}
              size="sm"
              color={board.color}
              online={onlineUserIds.includes(uid)}
            />
          ))}
        </div>
        {extraMembers > 0 && (
          <span className="ml-2 text-xs font-medium text-gray-500">
            +{extraMembers}
          </span>
        )}
        {onlineCount > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {onlineCount} online
          </span>
        )}
      </div>

      {isOwner && (
        <button
          type="button"
          onClick={handleDelete}
          className="absolute right-2 top-2 rounded-lg p-2 text-gray-300 opacity-100 transition hover:bg-red-50 hover:text-red-500 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Delete board"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6h14z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
