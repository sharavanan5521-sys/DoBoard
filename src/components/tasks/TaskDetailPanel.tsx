import { useEffect, useRef, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { format } from 'date-fns'
import type { Priority, Task } from '../../types'
import type { TaskUpdate } from '../../hooks/useTasks'
import { formatDueDate, PRIORITY_META } from '../../lib/utils'
import Avatar from '../shared/Avatar'

interface TaskDetailPanelProps {
  task: Task
  members: string[]
  memberName: (uid: string) => string
  accentColor?: string
  onClose: () => void
  onUpdate: (taskId: string, fields: TaskUpdate) => void
  onSetArchived: (taskId: string, archived: boolean) => void
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high']

/** yyyy-MM-dd string for a date input from a Firestore Timestamp. */
function toDateInputValue(ts: Timestamp | null): string {
  if (!ts) return ''
  return format(ts.toDate(), 'yyyy-MM-dd')
}

export default function TaskDetailPanel({
  task,
  members,
  memberName,
  accentColor = '#6366f1',
  onClose,
  onUpdate,
  onSetArchived,
}: TaskDetailPanelProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')

  // Re-seed local text fields when switching to a different task.
  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id])

  // Debounced save for the free-text fields (500ms).
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  function debouncedUpdate(fields: TaskUpdate) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onUpdate(task.id, fields)
    }, 500)
  }
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const due = task.dueDate ? formatDueDate(task.dueDate.toDate()) : null

  function handleDueChange(value: string) {
    const next = value
      ? Timestamp.fromDate(new Date(`${value}T00:00:00`))
      : null
    onUpdate(task.id, { dueDate: next })
  }

  function handleArchiveToggle() {
    onSetArchived(task.id, !task.archived)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 animate-fade-in md:items-stretch md:justify-end"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full animate-slide-in-up flex-col overflow-y-auto rounded-t-2xl bg-white shadow-xl md:max-h-full md:max-w-md md:animate-slide-in-right md:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Task details
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

        <div className="space-y-6 px-5 py-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                debouncedUpdate({ title: e.target.value.trim() })
              }}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Notes
            </label>
            <textarea
              value={description}
              rows={4}
              onChange={(e) => {
                setDescription(e.target.value)
                debouncedUpdate({
                  description: e.target.value.trim() || null,
                })
              }}
              placeholder="Add notes…"
              className="mt-1.5 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Assignee
            </label>
            <div className="mt-2 flex items-center gap-2">
              {task.assignee && (
                <Avatar
                  name={memberName(task.assignee)}
                  size="sm"
                  color={accentColor}
                />
              )}
              <select
                value={task.assignee ?? ''}
                onChange={(e) =>
                  onUpdate(task.id, { assignee: e.target.value || null })
                }
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {members.map((uid) => (
                  <option key={uid} value={uid}>
                    {memberName(uid)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Due date
            </label>
            <input
              type="date"
              value={toDateInputValue(task.dueDate)}
              onChange={(e) => handleDueChange(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {due && (
              <p
                className={`mt-1.5 text-xs font-medium ${
                  due.overdue && !task.done ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {due.text}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Priority
            </label>
            <div className="mt-2 flex gap-2">
              {PRIORITIES.map((p) => {
                const meta = PRIORITY_META[p]
                const active = task.priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      onUpdate(task.id, { priority: active ? null : p })
                    }
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? `${meta.bg} ${meta.text} border-transparent`
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Archive */}
        <div className="mt-auto border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={handleArchiveToggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {task.archived ? 'Restore from archive' : 'Archive task'}
          </button>
        </div>
      </div>
    </div>
  )
}
