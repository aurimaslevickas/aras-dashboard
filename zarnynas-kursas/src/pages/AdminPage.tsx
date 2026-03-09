import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { fetchLessons, updateLesson, createLesson, deleteLesson, reorderLessons } from '../lib/courses'
import type { Lesson } from '../lib/courses'
import { ArrowLeft, Users, BarChart3, BookOpen, Clock, TrendingUp, Trash2, Plus, Save, X, ArrowUp, ArrowDown, Settings } from 'lucide-react'

interface UserProgress {
  user_id: string
  email: string
  completed: number
  total: number
  percent: number
  last_active: string
}

const ADMIN_EMAILS = ['aurimas.levickas@gmail.com', 'info@gyvenimoklubas.lt']

export default function AdminPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'stats' | 'lessons'>('stats')
  const [users, setUsers] = useState<UserProgress[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Lesson>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newLesson, setNewLesson] = useState({ title: '', content_type: 'video' as string, video_url: '', description: '', content_html: '' })
  const [saving, setSaving] = useState(false)

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '')

  useEffect(() => {
    if (!isAdmin) return
    loadStats()
    loadLessons()
  }, [isAdmin])

  async function loadLessons() {
    const data = await fetchLessons('sveikas-zarnynas')
    setLessons(data)
  }

  async function loadStats() {
    const { data: progress } = await supabase
      .from('course_progress')
      .select('user_id, lesson_order, created_at')
      .eq('course_id', 'sveikas-zarnynas')
      .order('created_at', { ascending: false })

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id, user_email, created_at')
      .eq('course_id', 'sveikas-zarnynas')

    const totalLessons = lessons.length || 8
    const userMap = new Map<string, UserProgress>()

    enrollments?.forEach(e => {
      if (!userMap.has(e.user_id)) {
        userMap.set(e.user_id, {
          user_id: e.user_id, email: e.user_email || 'Nežinomas',
          completed: 0, total: totalLessons, percent: 0, last_active: e.created_at
        })
      }
    })

    progress?.forEach(p => {
      const u = userMap.get(p.user_id)
      if (u) { u.completed++; if (p.created_at > u.last_active) u.last_active = p.created_at }
    })

    const userList = Array.from(userMap.values())
      .map(u => ({ ...u, percent: Math.round((u.completed / u.total) * 100) }))
      .sort((a, b) => b.percent - a.percent)

    setUsers(userList)
    setTotalUsers(userList.length)
    setLoading(false)
  }

  async function handleSave(id: string) {
    setSaving(true)
    await updateLesson(id, editForm)
    setEditingId(null)
    setEditForm({})
    await loadLessons()
    setSaving(false)
  }

  async function handleAdd() {
    setSaving(true)
    const maxOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.sort_order)) : 0
    await createLesson({
      course_id: 'sveikas-zarnynas',
      sort_order: maxOrder + 1,
      title: newLesson.title,
      description: newLesson.description,
      content_type: newLesson.content_type as any,
      video_url: newLesson.video_url || null,
      content_html: newLesson.content_html
    })
    setShowAdd(false)
    setNewLesson({ title: '', content_type: 'video', video_url: '', description: '', content_html: '' })
    await loadLessons()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tikrai norite ištrinti šią pamoką?')) return
    await deleteLesson(id)
    await loadLessons()
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= lessons.length) return
    const updated = [...lessons]
    const tempOrder = updated[index].sort_order
    updated[index].sort_order = updated[swapIndex].sort_order
    updated[swapIndex].sort_order = tempOrder
    await reorderLessons([
      { id: updated[index].id, sort_order: updated[index].sort_order },
      { id: updated[swapIndex].id, sort_order: updated[swapIndex].sort_order }
    ])
    await loadLessons()
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Prieiga uždrausta</h2>
          <p className="text-gray-500 mb-4">Tik administratoriai gali matyti šį puslapį.</p>
          <button onClick={() => navigate('/kursai')} className="text-emerald-600 font-medium">Grįžti į kursus</button>
        </div>
      </div>
    )
  }

  const avgProgress = users.length > 0 ? Math.round(users.reduce((s, u) => s + u.percent, 0) / users.length) : 0
  const completedAll = users.filter(u => u.percent === 100).length
  const activeToday = users.filter(u => new Date(u.last_active).toDateString() === new Date().toDateString()).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/kursai')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          <ArrowLeft size={18} /> Grįžti
        </button>
        <h1 className="font-bold text-gray-900">Admin Dashboard</h1>
        <button onClick={signOut} className="text-sm text-gray-500">Atsijungti</button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => setTab('stats')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'stats' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <BarChart3 size={16} className="inline mr-1.5" />Statistika
          </button>
          <button
            onClick={() => setTab('lessons')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'lessons' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Settings size={16} className="inline mr-1.5" />Pamokų valdymas
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {tab === 'stats' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KPICard icon={<Users size={20} />} label="Viso narių" value={totalUsers} color="blue" />
              <KPICard icon={<TrendingUp size={20} />} label="Vid. progresas" value={`${avgProgress}%`} color="emerald" />
              <KPICard icon={<BookOpen size={20} />} label="Baigė kursą" value={completedAll} color="purple" />
              <KPICard icon={<Clock size={20} />} label="Aktyvūs šiandien" value={activeToday} color="amber" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Narių progresas</h3>
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-400">Kraunama...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Kol kas nėra narių</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                        <th className="px-6 py-3 text-left">Naudotojas</th>
                        <th className="px-6 py-3 text-center">Pamokos</th>
                        <th className="px-6 py-3 text-center">Progresas</th>
                        <th className="px-6 py-3 text-right">Paskutinė veikla</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u.user_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.email}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{u.completed}/{u.total}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 bg-gray-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${u.percent}%` }} />
                              </div>
                              <span className="text-xs font-medium text-gray-500">{u.percent}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-400">
                            {new Date(u.last_active).toLocaleDateString('lt-LT')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'lessons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Pamokos ({lessons.length})</h3>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <Plus size={16} /> Pridėti pamoką
              </button>
            </div>

            {/* Add lesson form */}
            {showAdd && (
              <div className="bg-white rounded-2xl border border-emerald-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">Nauja pamoka</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pavadinimas</label>
                    <input value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Pamokos pavadinimas" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tipas</label>
                    <select value={newLesson.content_type} onChange={e => setNewLesson({ ...newLesson, content_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="text">Tekstas</option>
                    </select>
                  </div>
                  {newLesson.content_type !== 'text' && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Video/PDF URL</label>
                      <input value={newLesson.video_url} onChange={e => setNewLesson({ ...newLesson, video_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="https://..." />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Aprašymas / Tekstas po video</label>
                    <textarea value={newLesson.content_html} onChange={e => setNewLesson({ ...newLesson, content_html: e.target.value })}
                      rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="HTML arba paprastas tekstas" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleAdd} disabled={!newLesson.title || saving}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                    {saving ? 'Saugoma...' : 'Pridėti'}
                  </button>
                  <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">
                    Atšaukti
                  </button>
                </div>
              </div>
            )}

            {/* Lesson list */}
            {lessons.map((l, i) => (
              <div key={l.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {editingId === l.id ? (
                  /* Edit mode */
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Pavadinimas</label>
                        <input value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tipas</label>
                        <select value={editForm.content_type || 'video'} onChange={e => setEditForm({ ...editForm, content_type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                          <option value="text">Tekstas</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Video/PDF URL</label>
                        <input value={editForm.video_url || ''} onChange={e => setEditForm({ ...editForm, video_url: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Aprašymas</label>
                        <input value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Turinys (HTML) — rodomas po video arba vietoj jo</label>
                        <textarea value={editForm.content_html || ''} onChange={e => setEditForm({ ...editForm, content_html: e.target.value })}
                          rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleSave(l.id)} disabled={saving}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 disabled:opacity-50">
                        <Save size={14} /> {saving ? 'Saugoma...' : 'Išsaugoti'}
                      </button>
                      <button onClick={() => { setEditingId(null); setEditForm({}) }}
                        className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 flex items-center gap-1.5">
                        <X size={14} /> Atšaukti
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="px-6 py-4 flex items-center gap-4">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => handleMove(i, 'up')} disabled={i === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"><ArrowUp size={14} /></button>
                      <button onClick={() => handleMove(i, 'down')} disabled={i === lessons.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"><ArrowDown size={14} /></button>
                    </div>
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                      {l.sort_order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{l.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {l.content_type === 'video' ? '🎥 Video' : l.content_type === 'pdf' ? '📄 PDF' : '📝 Tekstas'}
                        {l.description && ` — ${l.description.substring(0, 60)}`}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => { setEditingId(l.id); setEditForm(l) }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
                      >
                        Redaguoti
                      </button>
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KPICard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600', amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
