import type { Task } from '../../types'

interface TaskItemProps {
  task: Task
  accentColor?: string
  onToggle: (task: Task) => void
  onDelete: (taskId: string) => void
  onClick?: (task: Task) => void
}

export default function TaskItem({
  task,
  accentColor = '#6366f1',
  onToggle,
  onDelete,
  onClick,
}: TaskItemProps) {
  return (
    <div
      className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-gray-300"
      onClick={() => onClick?.(task)}
      role={onClick ? 'button' : undefined}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggle(task)
        }}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
          task.done ? 'border-transparent' : 'border-gray-300 hover:border-gray-400'
        }`}
        style={task.done ? { backgroundColor: accentColor } : undefined}
        aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          className={`text-white transition-all duration-200 ${
            task.done ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <span
        className={`flex-1 text-sm transition-all duration-200 ${
          task.done
            ? 'text-gray-400 line-through opacity-60'
            : 'text-gray-900'
        }`}
      >
        {task.title}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(task.id)
        }}
        className="shrink-0 rounded-lg p-1.5 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        aria-label="Delete task"
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
    </div>
  )
}
