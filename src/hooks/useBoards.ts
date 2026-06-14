import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
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
