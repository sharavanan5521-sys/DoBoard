import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

interface AuthContextValue {
  currentUser: FirebaseUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Creates a `users/{uid}` document on first sign-in.
 * Uses setDoc with merge so existing profiles are never overwritten.
 */
async function ensureUserDoc(user: FirebaseUser): Promise<void> {
  const ref = doc(db, 'users', user.uid)
  const snapshot = await getDoc(ref)
  if (snapshot.exists()) return

  await setDoc(
    ref,
    {
      uid: user.uid,
      name: user.displayName ?? user.email ?? 'Anonymous',
      email: user.email ?? '',
      avatarUrl: user.photoURL ?? null,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await ensureUserDoc(user)
        } catch (err) {
          console.error('Failed to create user document:', err)
        }
      }
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signInWithGoogle(): Promise<void> {
    await signInWithPopup(auth, googleProvider)
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(auth)
  }

  const value: AuthContextValue = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
