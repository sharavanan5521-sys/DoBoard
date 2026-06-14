import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

/** Adds a user to a board's members. */
export async function joinBoard(boardId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, 'boards', boardId), {
    members: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  })
}

/** Removes a user from a board's members. */
export async function removeMember(
  boardId: string,
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, 'boards', boardId), {
    members: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  })
}

export type InviteResult =
  | { status: 'added'; name: string }
  | { status: 'already-member' }
  | { status: 'not-found' }

/**
 * Looks up a user by email and adds them to the board.
 * Returns a result describing the outcome.
 */
export async function addMemberByEmail(
  boardId: string,
  email: string,
  currentMembers: string[],
): Promise<InviteResult> {
  const normalized = email.trim().toLowerCase()
  const q = query(
    collection(db, 'users'),
    where('email', '==', normalized),
    limit(1),
  )
  const snap = await getDocs(q)
  if (snap.empty) return { status: 'not-found' }

  const userDoc = snap.docs[0]
  const uid = userDoc.id
  if (currentMembers.includes(uid)) return { status: 'already-member' }

  await joinBoard(boardId, uid)
  const data = userDoc.data() as { name?: string; email?: string }
  return { status: 'added', name: data.name || data.email || 'User' }
}
