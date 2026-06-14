import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

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
