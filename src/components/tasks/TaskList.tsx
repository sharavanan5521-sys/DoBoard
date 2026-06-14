import { useState } from 'react'
import type { Task } from '../../types'
import TaskItem from './TaskItem'

type Filter = 'all' | 'active' | 'done' | 'archived'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  archivedTasks?: Task[]
  archivedLoading?: boolean
  accentColor?: string
  memberName?: (uid: string) => string
  onToggle: (task: Task) => void
  onDelete: (taskId: string) => void
  onTaskClick?: (task: Task) => void
}

const EMPTY_TEXT: Record<Filter, string> = {
  all: 'No tasks yet',
  active: 'Nothing active',
  done: 'Nothing done yet',
  archived: 'Nothing archived',
}

function RowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
      <div className="h-5 w-5 rounded-full bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
    </div>
  )
}

export default function TaskList({
  tasks,
  loading,
  archivedTasks = [],
  archivedLoading = false,
  accentColor = '#6366f1',
  memberName,
  onToggle,
  onDelete,
  onTaskClick,
}: TaskListProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const activeTasks = tasks.filter((t) => !t.done)
  const doneTasks = tasks.filter((t) => t.done)

  const counts: Record<Filter, number> = {
    all: tasks.length,
    active: activeTasks.length,
    done: doneTasks.length,
    archived: archivedTasks.length,
  }

  const filtered =
    filter === 'active'
      ? activeTasks
      : filter === 'done'
        ? doneTasks
        : filter === 'archived'
          ? archivedTasks
          : tasks

  const isLoading = filter === 'archived' ? archivedLoading : loading

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'done', label: 'Done' },
    { key: 'archived', label: 'Archived' },
  ]

  return (
    <div>
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 text-xs ${
                filter === tab.key
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            {EMPTY_TEXT[filter]}
          </p>
        ) : (
          filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              accentColor={accentColor}
              memberName={memberName}
              onToggle={onToggle}
              onDelete={onDelete}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
