import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'
import { COURSES, fetchLessons } from '../lib/courses'
import { BookOpen, LogOut, Play, Settings } from 'lucide-react'

const ADMIN_EMAILS = ['aurimas.levickas@gmail.com', 'info@gyvenimoklubas.lt']

export default function CoursesPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '')
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Studentas'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">GK</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">GyvenimoKlubas</h1>
              <p className="text-xs text-gray-500">Mokymų platforma</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                <Settings size={16} /> Admin
              </button>
            )}
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button onClick={signOut} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <LogOut size={16} /> Atsijungti
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Sveiki, {firstName} 👋</h2>
          <p className="text-emerald-100 text-lg">Tęskite mokymąsi ten, kur baigėte.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BookOpen size={24} className="text-emerald-600" />
          Jūsų kursai
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map(course => (
            <CourseCard key={course.id} course={course} onOpen={() => navigate(`/kursai/${course.id}`)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course, onOpen }: { course: typeof COURSES[0], onOpen: () => void }) {
  const { completed } = useProgress(course.id)
  const [lessonCount, setLessonCount] = useState(8)

  useEffect(() => {
    fetchLessons(course.id).then(l => setLessonCount(l.length))
  }, [course.id])

  const percent = lessonCount > 0 ? Math.round((completed.length / lessonCount) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer" onClick={onOpen}>
      <div className="relative h-48 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
        <div className="text-center text-white px-6">
          <h4 className="font-bold text-2xl mb-2">{course.title}</h4>
          <p className="text-white/80 text-sm">{course.instructor}</p>
        </div>
        <div className="absolute top-4 right-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/40 transition-colors">
            <Play size={18} className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3">{lessonCount} pamokos</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-sm font-medium text-gray-600">{percent}%</span>
        </div>
      </div>
    </div>
  )
}
