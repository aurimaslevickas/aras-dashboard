import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'
import { fetchLessons, COURSES } from '../lib/courses'
import type { Lesson } from '../lib/courses'
import { ArrowLeft, Check, ChevronRight, Play, Type, Download } from 'lucide-react'

export default function LessonPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const course = COURSES.find(c => c.id === courseId)
  const { completed, toggleLesson } = useProgress(courseId || '')

  useEffect(() => {
    if (!courseId) return
    fetchLessons(courseId).then(data => {
      setLessons(data)
      setLoading(false)
    })
  }, [courseId])

  if (!course || loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const lesson = lessons[currentIndex]
  if (!lesson) return null

  const progress = lessons.length > 0 ? Math.round((completed.length / lessons.length) * 100) : 0
  const isCompleted = completed.includes(lesson.sort_order)
  const allCompleted = lessons.length > 0 && lessons.every(l => completed.includes(l.sort_order))

  const typeIcon = (type: string) => {
    if (type === 'video') return <Play size={14} />
    if (type === 'pdf') return <Download size={14} />
    return <Type size={14} />
  }

  const typeLabel = (type: string) => {
    if (type === 'video') return 'Video'
    if (type === 'pdf') return 'PDF'
    return 'Tekstas'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
        <button onClick={() => navigate('/kursai')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          <ArrowLeft size={18} /> Grįžti
        </button>
        <div className="text-center">
          <h1 className="font-bold text-gray-900 text-sm">{course.title}</h1>
          <p className="text-xs text-gray-500">{course.instructor}</p>
        </div>
        <span className="text-xs font-medium text-emerald-600">{progress}%</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-100 overflow-y-auto shrink-0 hidden md:block">
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-900">Pamokos</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {lessons.map((l, i) => {
              const done = completed.includes(l.sort_order)
              return (
                <button
                  key={l.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
                    i === currentIndex ? 'bg-emerald-50 border-l-2 border-emerald-500' : 'hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {done ? <Check size={14} /> : l.sort_order}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${i === currentIndex ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {l.title}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      {typeIcon(l.content_type)} {typeLabel(l.content_type)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Mobile lesson selector */}
            <div className="md:hidden mb-4">
              <select
                value={currentIndex}
                onChange={e => setCurrentIndex(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              >
                {lessons.map((l, i) => (
                  <option key={l.id} value={i}>
                    {l.sort_order}. {l.title}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">{lesson.title}</h2>

            {/* Video */}
            {lesson.content_type === 'video' && lesson.video_url && (
              <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6">
                <iframe
                  src={lesson.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* PDF */}
            {lesson.content_type === 'pdf' && lesson.video_url && (
              <div className="mb-6">
                <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-gray-200">
                  <iframe src={lesson.video_url} className="w-full h-full" />
                </div>
                {lesson.description && (
                  <p className="mt-3 text-sm text-gray-600">{lesson.description}</p>
                )}
              </div>
            )}

            {/* Text/HTML content */}
            {lesson.content_type === 'text' && lesson.content_html && (
              <div
                className="prose prose-emerald max-w-none mb-6 bg-white rounded-2xl p-6 border border-gray-100"
                dangerouslySetInnerHTML={{ __html: lesson.content_html }}
              />
            )}

            {/* Content below video (description / extra HTML) */}
            {lesson.content_type === 'video' && lesson.content_html && (
              <div
                className="prose prose-emerald max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: lesson.content_html }}
              />
            )}

            {lesson.description && lesson.content_type !== 'pdf' && (
              <p className="text-gray-600 mb-6">{lesson.description}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => toggleLesson(lesson.sort_order)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isCompleted ? '✓ Peržiūrėta' : 'Pažymėti kaip peržiūrėtą'}
              </button>

              {currentIndex < lessons.length - 1 && (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  Kita pamoka <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* Certificate */}
            {allCompleted && (
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                <h3 className="text-lg font-bold text-emerald-800 mb-2">🎉 Sveikiname! Jūs baigėte kursą!</h3>
                <p className="text-sm text-emerald-600 mb-4">Galite atsisiųsti savo sertifikatą.</p>
                <button
                  onClick={() => generateCertificate(user, course)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
                >
                  📜 Atsisiųsti sertifikatą
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function generateCertificate(user: any, course: any) {
  const name = user?.user_metadata?.full_name || user?.email || 'Studentas'
  const date = new Date().toLocaleDateString('lt-LT', { year: 'numeric', month: 'long', day: 'numeric' })
  
  const html = `
    <html>
    <head><style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500&display=swap');
      body { margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f0fdf4; }
      .cert { width:800px; padding:60px; background:white; border:3px solid #059669; text-align:center; font-family:Inter,sans-serif; }
      .cert h1 { font-family:'Playfair Display',serif; font-size:36px; color:#059669; margin-bottom:10px; }
      .cert h2 { font-size:14px; color:#6b7280; text-transform:uppercase; letter-spacing:3px; margin-bottom:40px; }
      .cert .name { font-family:'Playfair Display',serif; font-size:32px; color:#111827; margin:20px 0; border-bottom:2px solid #059669; display:inline-block; padding-bottom:5px; }
      .cert .course { font-size:18px; color:#374151; margin:20px 0; }
      .cert .date { font-size:14px; color:#6b7280; margin-top:40px; }
      .cert .logo { font-size:24px; font-weight:bold; color:#059669; margin-bottom:20px; }
      @media print { body { background:white; } .cert { border:3px solid #059669; } }
    </style></head>
    <body>
      <div class="cert">
        <div class="logo">GyvenimoKlubas</div>
        <h2>Mokymų baigimo sertifikatas</h2>
        <h1>Sertifikatas</h1>
        <p>Šiuo patvirtinama, kad</p>
        <div class="name">${name}</div>
        <p class="course">sėkmingai baigė kursą<br><strong>${course.title}</strong></p>
        <p>Lektorė: ${course.instructor}</p>
        <p class="date">${date}</p>
      </div>
    </body>
    </html>
  `
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }
}
