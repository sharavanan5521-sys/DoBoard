import { useNavigate } from 'react-router-dom'
import type { Board } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { useTaskCounts } from '../../hooks/useTasks'
import { useMembers } from '../../hooks/useMembers'
import { usePresence } from '../../hooks/usePresence'
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

  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  const visibleMembers = board.members.slice(0, 3)
  const extraMembers = board.members.length - visibleMembers.length
  const onlineCount = onlineUserIds.length

  function memberName(uid: string): string {
    if (currentUser && uid === currentUser.uid) {
      return currentUser.displayName ?? currentUser.email ?? 'You'
    }
    return members[uid]?.name ?? uid
  }

  return (
    <button
      type="button"
      onClick={() => navigate(`/board/${board.id}`)}
      className="group w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: board.color }}
        />
        <h3 className="truncate text-base font-semibold text-gray-900">
          {board.name}
        </h3>
        {onlineCount > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {onlineCount} online
          </span>
        )}
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
      </div>
    </button>
  )
}
