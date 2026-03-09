import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import NewPasswordPage from './pages/NewPasswordPage'
import CoursesPage from './pages/CoursesPage'
import LessonPage from './pages/LessonPage'
import AdminPage from './pages/AdminPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/registruotis" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (user) return <Navigate to="/kursai" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registruotis" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/prisijungti" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/slaptazodis" element={<ResetPasswordPage />} />
        <Route path="/naujas-slaptazodis" element={<NewPasswordPage />} />
        <Route path="/kursai" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
        <Route path="/kursai/:courseId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/registruotis" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
