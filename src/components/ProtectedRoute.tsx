import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Guards routes that require an authenticated user.
 *
 * Phase 0: passes children through (no auth context yet).
 * Phase 1: will show a loading spinner while auth is resolving and
 * redirect to /login when there is no signed-in user.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>
}
