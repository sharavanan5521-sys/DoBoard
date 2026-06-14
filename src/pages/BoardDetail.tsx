import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useBoard } from '../hooks/useBoards'
import { useTasks } from '../hooks/useTasks'
import Avatar from '../components/shared/Avatar'
import AddTaskInput from '../components/tasks/AddTaskInput'
import TaskList from '../components/tasks/TaskList'

export default function BoardDetail() {
  const { boardId = '' } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { board, loading: boardLoading } = useBoard(boardId)
  const { tasks, loading: tasksLoading, addTask, toggleDone, deleteTask } =
    useTasks(boardId)

  const accent = board?.color ?? '#6366f1'

  function memberName(uid: string): string {
    if (currentUser && uid === currentUser.uid) {
      return currentUser.displayName ?? currentUser.email ?? 'You'
    }
    return uid
  }

  if (!boardLoading && !board) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <p className="text-base font-medium text-gray-900">Board not found</p>
        <p className="mt-1 text-sm text-gray-500">
          It may have been deleted or you no longer have access.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Dashboard
        </button>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <h1 className="text-xl font-bold text-gray-900">
              {board?.name ?? 'Loading…'}
            </h1>
          </div>

          {board && (
            <div className="flex -space-x-2">
              {board.members.map((uid) => (
                <Avatar
                  key={uid}
                  name={memberName(uid)}
                  size="sm"
                  color={accent}
                />
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <AddTaskInput onAdd={addTask} accentColor={accent} />
        <div className="mt-6">
          <TaskList
            tasks={tasks}
            loading={tasksLoading}
            accentColor={accent}
            onToggle={toggleDone}
            onDelete={deleteTask}
          />
        </div>
      </main>
    </div>
  )
}
