import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Board } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { useMembers } from '../../hooks/useMembers'
import { removeMember } from '../../lib/boards'
import Avatar from '../shared/Avatar'

interface MembersModalProps {
  board: Board
  onlineUserIds: string[]
  onClose: () => void
}

export default function MembersModal({
  board,
  onlineUserIds,
  onClose,
}: MembersModalProps) {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { members } = useMembers(board.members)
  const [busyUid, setBusyUid] = useState<string | null>(null)

  const isCreator = currentUser?.uid === board.createdBy
  const online = new Set(onlineUserIds)

  async function handleRemove(uid: string) {
    setBusyUid(uid)
    try {
      await removeMember(board.id, uid)
      toast.success('Member removed')
    } catch (err) {
      console.error('Remove member failed:', err)
      toast.error('Could not remove member')
    } finally {
      setBusyUid(null)
    }
  }

  async function handleLeave() {
    if (!currentUser) return
    setBusyUid(currentUser.uid)
    try {
      await removeMember(board.id, currentUser.uid)
      toast.success('You left the board')
      navigate('/')
    } catch (err) {
      console.error('Leave board failed:', err)
      toast.error('Could not leave board')
      setBusyUid(null)
    }
  }

  function nameFor(uid: string): string {
    if (uid === currentUser?.uid) return 'You'
    return members[uid]?.name ?? uid
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Members ({board.members.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ul className="mt-5 space-y-2">
          {board.members.map((uid) => {
            const isOnline = online.has(uid)
            const isSelf = uid === currentUser?.uid
            return (
              <li
                key={uid}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2"
              >
                <Avatar
                  name={nameFor(uid)}
                  size="md"
                  color={board.color}
                  online={isOnline}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {nameFor(uid)}
                    {uid === board.createdBy && (
                      <span className="ml-1.5 text-xs font-normal text-gray-400">
                        Owner
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {isOnline ? 'Online' : members[uid]?.email || 'Offline'}
                  </p>
                </div>

                {isCreator && !isSelf && (
                  <button
                    type="button"
                    onClick={() => handleRemove(uid)}
                    disabled={busyUid === uid}
                    className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        {!isCreator && (
          <button
            type="button"
            onClick={handleLeave}
            disabled={busyUid === currentUser?.uid}
            className="mt-5 w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            Leave board
          </button>
        )}
      </div>
    </div>
  )
}
