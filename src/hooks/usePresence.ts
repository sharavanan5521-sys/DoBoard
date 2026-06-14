import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

const HEARTBEAT_MS = 30_000
const ONLINE_WINDOW_MS = 60_000

interface PresenceRecord {
  userId: string
  lastSeenMs: number | null
}

interface UsePresenceOptions {
  /** Whether to write this user's heartbeat. False for read-only views (cards). */
  heartbeat?: boolean
}

/**
 * Tracks online presence for a board.
 * When `heartbeat` is true, writes presence/{uid}_{boardId} every 30s.
 * Always listens to all presence docs for the board and returns the
 * userIds seen within the last 60 seconds.
 */
export function usePresence(
  boardId: string,
  { heartbeat = true }: UsePresenceOptions = {},
): string[] {
  const { currentUser } = useAuth()
  const [records, setRecords] = useState<PresenceRecord[]>([])
  // Re-evaluated periodically so presence expires without a new snapshot.
  const [now, setNow] = useState(() => Date.now())

  // Heartbeat writer.
  useEffect(() => {
    if (!heartbeat || !boardId || !currentUser) return

    const ref = doc(db, 'presence', `${currentUser.uid}_${boardId}`)
    const beat = () => {
      setDoc(ref, {
        userId: currentUser.uid,
        boardId,
        lastSeen: serverTimestamp(),
      }).catch((err) => console.error('presence heartbeat failed:', err))
    }

    beat()
    const interval = setInterval(beat, HEARTBEAT_MS)
    return () => clearInterval(interval)
  }, [heartbeat, boardId, currentUser])

  // Ticker to expire stale presence between snapshots.
  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 20_000)
    return () => clearInterval(ticker)
  }, [])

  // Listener for all presence docs of this board.
  useEffect(() => {
    if (!boardId) {
      setRecords([])
      return
    }

    const q = query(collection(db, 'presence'), where('boardId', '==', boardId))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setRecords(
          snapshot.docs.map((d) => {
            const data = d.data() as {
              userId: string
              lastSeen: Timestamp | null
            }
            return {
              userId: data.userId,
              lastSeenMs: data.lastSeen ? data.lastSeen.toMillis() : null,
            }
          }),
        )
      },
      (err) => console.error('usePresence snapshot error:', err),
    )

    return unsubscribe
  }, [boardId])

  return useMemo(() => {
    const cutoff = now - ONLINE_WINDOW_MS
    const ids = records
      .filter((r) => r.lastSeenMs !== null && r.lastSeenMs >= cutoff)
      .map((r) => r.userId)
    return Array.from(new Set(ids))
  }, [records, now])
}
