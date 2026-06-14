import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { User } from '../types'

export interface MemberProfile {
  uid: string
  name: string
  email: string
  avatarUrl: string | null
}

interface UseMembersResult {
  members: Record<string, MemberProfile>
  loading: boolean
}

/**
 * Resolves user profiles for a set of member uids from the `users` collection.
 * Returns a uid -> profile map. Missing users fall back to the raw uid.
 */
export function useMembers(uids: string[]): UseMembersResult {
  const [members, setMembers] = useState<Record<string, MemberProfile>>({})
  const [loading, setLoading] = useState(true)

  // Stable key so the effect only re-runs when the set of uids changes.
  const key = [...uids].sort().join(',')

  useEffect(() => {
    let cancelled = false
    const ids = key ? key.split(',') : []

    if (ids.length === 0) {
      setMembers({})
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all(
      ids.map(async (uid) => {
        try {
          const snap = await getDoc(doc(db, 'users', uid))
          if (snap.exists()) {
            const data = snap.data() as User
            return [
              uid,
              {
                uid,
                name: data.name || data.email || uid,
                email: data.email || '',
                avatarUrl: data.avatarUrl ?? null,
              },
            ] as const
          }
        } catch (err) {
          console.error('useMembers fetch error:', err)
        }
        return [uid, { uid, name: uid, email: '', avatarUrl: null }] as const
      }),
    ).then((entries) => {
      if (cancelled) return
      setMembers(Object.fromEntries(entries))
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [key])

  return { members, loading }
}
