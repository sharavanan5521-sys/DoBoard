import { useState } from 'react'
import toast from 'react-hot-toast'
import { addMemberByEmail } from '../../lib/boards'

interface InviteModalProps {
  boardId: string
  boardName: string
  members: string[]
  onClose: () => void
}

export default function InviteModal({
  boardId,
  boardName,
  members,
  onClose,
}: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  const shareUrl = `${window.location.origin}/join/${boardId}`

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied!')
    } catch {
      toast.error('Could not copy link')
    }
  }

  async function handleEmailInvite() {
    const trimmed = email.trim()
    if (!trimmed || inviting) return
    setInviting(true)
    try {
      const result = await addMemberByEmail(boardId, trimmed, members)
      if (result.status === 'added') {
        toast.success(`${result.name} added to the board`)
        setEmail('')
      } else if (result.status === 'already-member') {
        toast('Already a member')
      } else {
        toast.error('User not found — they need to sign in first')
      }
    } catch (err) {
      console.error('Email invite failed:', err)
      toast.error('Failed to invite')
    } finally {
      setInviting(false)
    }
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
            Invite to {boardName}
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

        {/* Share link */}
        <p className="mt-5 text-sm font-medium text-gray-700">Share link</p>
        <div className="mt-1.5 flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
            className="flex-1 truncate rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Copy link
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Email invite */}
        <p className="text-sm font-medium text-gray-700">Invite by email</p>
        <div className="mt-1.5 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEmailInvite()
            }}
            placeholder="teammate@example.com"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleEmailInvite}
            disabled={!email.trim() || inviting}
            className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inviting ? 'Inviting…' : 'Invite'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          They must have signed in to DoBoard at least once.
        </p>
      </div>
    </div>
  )
}
