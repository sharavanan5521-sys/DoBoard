import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const LoginPage = lazy(() => import('./components/auth/LoginPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const BoardDetail = lazy(() => import('./pages/BoardDetail'))
const JoinBoard = lazy(() => import('./pages/JoinBoard'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <svg
        className="h-8 w-8 animate-spin text-indigo-600"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-center" />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board/:boardId"
              element={
                <ProtectedRoute>
                  <BoardDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/join/:boardId" element={<JoinBoard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
