import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useBoard } from '../hooks/useBoards'
import { useArchivedTasks, useTasks } from '../hooks/useTasks'
import { useMembers } from '../hooks/useMembers'
import { usePresence } from '../hooks/usePresence'
import Avatar from '../components/shared/Avatar'
import AddTaskInput from '../components/tasks/AddTaskInput'
import TaskList, { type TaskFilter } from '../components/tasks/TaskList'
import TaskDetailPanel from '../components/tasks/TaskDetailPanel'
import InviteModal from '../components/boards/InviteModal'
import MembersModal from '../components/boards/MembersModal'
import InsightsPanel from '../components/insights/InsightsPanel'

type View = TaskFilter | 'insights'

export default function BoardDetail() {
  const { boardId = '' } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { board, loading: boardLoading } = useBoard(boardId)
  const {
    tasks,
    loading: tasksLoading,
    addTask,
    toggleDone,
    deleteTask,
    updateTask,
    setArchived,
    archiveAllDone,
  } = useTasks(boardId)
  const { tasks: archivedTasks, loading: archivedLoading } =
    useArchivedTasks(boardId)
  const { members } = useMembers(board?.members ?? [])
  const onlineUserIds = usePresence(boardId)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [view, setView] = useState<View>('all')

  const accent = board?.color ?? '#6366f1'
  const doneCount = tasks.filter((t) => t.done).length
  const online = new Set(onlineUserIds)

  const tabs: { key: View; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'active', label: 'Active', count: tasks.filter((t) => !t.done).length },
    { key: 'done', label: 'Done', count: doneCount },
    { key: 'archived', label: 'Archived', count: archivedTasks.length },
    { key: 'insights', label: 'Insights' },
  ]

  function memberName(uid: string): string {
    if (currentUser && uid === currentUser.uid) {
      return currentUser.displayName ?? currentUser.email ?? 'You'
    }
    return members[uid]?.name ?? uid
  }

  // Derive the live task object for the open panel from the latest snapshots.
  const selectedTask =
    selectedTaskId !== null
      ? (tasks.find((t) => t.id === selectedTaskId) ??
        archivedTasks.find((t) => t.id === selectedTaskId) ??
        null)
      : null

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
    <div className="min-h-screen bg-gray-50 pb-[env(safe-area-inset-bottom)]">
      <header className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800"
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

        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <h1 className="text-xl font-bold text-gray-900">
              {board?.name ?? 'Loading…'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {doneCount > 0 && (
              <button
                type="button"
                onClick={() => archiveAllDone()}
                className="hidden min-h-[44px] rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:inline-flex sm:items-center"
              >
                Archive all done ({doneCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              Invite
            </button>
            {board && (
              <button
                type="button"
                onClick={() => setShowMembers(true)}
                className="flex -space-x-2 rounded-full transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Manage members"
              >
                {board.members.slice(0, 4).map((uid) => (
                  <Avatar
                    key={uid}
                    name={memberName(uid)}
                    size="sm"
                    color={accent}
                    online={online.has(uid)}
                  />
                ))}
                {board.members.length > 4 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-600 ring-2 ring-white">
                    +{board.members.length - 4}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main
        className={`mx-auto px-4 py-6 sm:px-6 sm:py-8 ${
          view === 'insights' ? 'max-w-4xl' : 'max-w-2xl'
        }`}
      >
        {view !== 'insights' && (
          <AddTaskInput onAdd={addTask} accentColor={accent} />
        )}

        {/* Tab bar */}
        <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setView(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    view === tab.key
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {view === 'insights' ? (
            <InsightsPanel
              tasks={tasks}
              members={board?.members ?? []}
              memberName={memberName}
              accentColor={accent}
            />
          ) : (
            <TaskList
              filter={view}
              tasks={tasks}
              loading={tasksLoading}
              archivedTasks={archivedTasks}
              archivedLoading={archivedLoading}
              accentColor={accent}
              memberName={memberName}
              onToggle={toggleDone}
              onDelete={deleteTask}
              onTaskClick={(task) => setSelectedTaskId(task.id)}
            />
          )}
        </div>
      </main>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          members={board?.members ?? []}
          memberName={memberName}
          accentColor={accent}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={updateTask}
          onSetArchived={setArchived}
        />
      )}

      {showInvite && board && (
        <InviteModal
          boardId={board.id}
          boardName={board.name}
          members={board.members}
          onClose={() => setShowInvite(false)}
        />
      )}

      {showMembers && board && (
        <MembersModal
          board={board}
          onlineUserIds={onlineUserIds}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  )
}
