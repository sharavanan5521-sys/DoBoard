import type { Task } from '../../types'
import TaskItem from './TaskItem'

export type TaskFilter = 'all' | 'active' | 'done' | 'archived'

interface TaskListProps {
  filter: TaskFilter
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

const EMPTY_TEXT: Record<TaskFilter, string> = {
  all: 'No tasks yet — add one above',
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
  filter,
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
  const filtered =
    filter === 'active'
      ? tasks.filter((t) => !t.done)
      : filter === 'done'
        ? tasks.filter((t) => t.done)
        : filter === 'archived'
          ? archivedTasks
          : tasks

  const isLoading = filter === 'archived' ? archivedLoading : loading

  return (
    <div className="space-y-2">
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
  )
}
