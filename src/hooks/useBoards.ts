import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import type { Board } from '../types'

interface UseBoardsResult {
  boards: Board[]
  loading: boolean
  createBoard: (name: string, color: string) => Promise<string>
}

export function useBoards(): UseBoardsResult {
  const { currentUser } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setBoards([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(
      collection(db, 'boards'),
      where('members', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc'),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Board,
        )
        setBoards(next)
        setLoading(false)
      },
      (err) => {
        console.error('useBoards snapshot error:', err)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [currentUser])

  async function createBoard(name: string, color: string): Promise<string> {
    if (!currentUser) throw new Error('Must be signed in to create a board')
    const ref = await addDoc(collection(db, 'boards'), {
      name: name.trim(),
      color,
      members: [currentUser.uid],
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  }

  return { boards, loading, createBoard }
}

interface UseBoardResult {
  board: Board | null
  loading: boolean
}

/** Live subscription to a single board document. */
export function useBoard(boardId: string): UseBoardResult {
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!boardId) {
      setBoard(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = onSnapshot(
      doc(db, 'boards', boardId),
      (snapshot) => {
        setBoard(
          snapshot.exists()
            ? ({ id: snapshot.id, ...snapshot.data() } as Board)
            : null,
        )
        setLoading(false)
      },
      (err) => {
        console.error('useBoard snapshot error:', err)
        setBoard(null)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [boardId])

  return { board, loading }
}
