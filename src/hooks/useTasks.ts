import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import type { Task } from '../types'

/** Fields of a Task a user can edit from the detail panel. */
export type TaskUpdate = Partial<
  Pick<Task, 'title' | 'description' | 'assignee' | 'priority' | 'dueDate'>
>

export interface TaskCounts {
  total: number
  done: number
  loading: boolean
}

/**
 * Basic per-board task counts (total + done) for the dashboard progress bars.
 * Subscribes to non-archived tasks of a single board.
 *
 * Phase 3 adds the full `useTasks(boardId)` hook (list + mutations) alongside this.
 */
export function useTaskCounts(boardId: string): TaskCounts {
  const [counts, setCounts] = useState<TaskCounts>({
    total: 0,
    done: 0,
    loading: true,
  })

  useEffect(() => {
    if (!boardId) {
      setCounts({ total: 0, done: 0, loading: false })
      return
    }

    const q = query(
      collection(db, 'tasks'),
      where('boardId', '==', boardId),
      where('archived', '==', false),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const total = snapshot.size
        const done = snapshot.docs.filter((d) => d.data().done === true).length
        setCounts({ total, done, loading: false })
      },
      (err) => {
        console.error('useTaskCounts snapshot error:', err)
        setCounts({ total: 0, done: 0, loading: false })
      },
    )

    return unsubscribe
  }, [boardId])

  return counts
}

interface UseTasksResult {
  tasks: Task[]
  loading: boolean
  addTask: (title: string) => Promise<void>
  toggleDone: (task: Task) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  updateTask: (taskId: string, fields: TaskUpdate) => Promise<void>
  setArchived: (taskId: string, archived: boolean) => Promise<void>
  archiveAllDone: () => Promise<void>
}

/**
 * Full task list + mutations for a single board.
 * Subscribes to non-archived tasks, sorted by createdAt ascending.
 */
export function useTasks(boardId: string): UseTasksResult {
  const { currentUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(
      collection(db, 'tasks'),
      where('boardId', '==', boardId),
      where('archived', '==', false),
      orderBy('createdAt', 'asc'),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Task,
        )
        setTasks(next)
        setLoading(false)
      },
      (err) => {
        console.error('useTasks snapshot error:', err)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [boardId])

  async function addTask(title: string): Promise<void> {
    const trimmed = title.trim()
    if (!trimmed || !currentUser) return
    try {
      await addDoc(collection(db, 'tasks'), {
        boardId,
        title: trimmed,
        description: null,
        done: false,
        doneAt: null,
        assignee: null,
        priority: null,
        dueDate: null,
        archived: false,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      toast.success('Task added')
    } catch (err) {
      console.error('addTask failed:', err)
      toast.error('Could not add task')
      throw err
    }
  }

  async function toggleDone(task: Task): Promise<void> {
    const nextDone = !task.done
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        done: nextDone,
        doneAt: nextDone ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('toggleDone failed:', err)
      toast.error('Could not update task')
    }
  }

  async function deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tasks', taskId))
      toast.success('Task deleted')
    } catch (err) {
      console.error('deleteTask failed:', err)
      toast.error('Could not delete task')
    }
  }

  async function updateTask(taskId: string, fields: TaskUpdate): Promise<void> {
    await updateDoc(doc(db, 'tasks', taskId), {
      ...fields,
      updatedAt: serverTimestamp(),
    })
  }

  async function setArchived(
    taskId: string,
    archived: boolean,
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        archived,
        updatedAt: serverTimestamp(),
      })
      toast.success(archived ? 'Task archived' : 'Task restored')
    } catch (err) {
      console.error('setArchived failed:', err)
      toast.error('Could not update task')
    }
  }

  async function archiveAllDone(): Promise<void> {
    const doneTasks = tasks.filter((t) => t.done)
    if (doneTasks.length === 0) return
    try {
      const batch = writeBatch(db)
      doneTasks.forEach((t) => {
        batch.update(doc(db, 'tasks', t.id), {
          archived: true,
          updatedAt: serverTimestamp(),
        })
      })
      await batch.commit()
      toast.success(`Archived ${doneTasks.length} done`)
    } catch (err) {
      console.error('archiveAllDone failed:', err)
      toast.error('Could not archive tasks')
    }
  }

  return {
    tasks,
    loading,
    addTask,
    toggleDone,
    deleteTask,
    updateTask,
    setArchived,
    archiveAllDone,
  }
}

interface UseArchivedTasksResult {
  tasks: Task[]
  loading: boolean
}

/**
 * Live subscription to archived tasks of a single board.
 * Kept separate from `useTasks` so the active list stays lean.
 */
export function useArchivedTasks(boardId: string): UseArchivedTasksResult {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(
      collection(db, 'tasks'),
      where('boardId', '==', boardId),
      where('archived', '==', true),
      orderBy('createdAt', 'asc'),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Task,
        )
        setTasks(next)
        setLoading(false)
      },
      (err) => {
        console.error('useArchivedTasks snapshot error:', err)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [boardId])

  return { tasks, loading }
}
