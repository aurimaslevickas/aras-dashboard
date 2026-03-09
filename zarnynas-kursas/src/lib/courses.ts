import { supabase } from './supabase'

export interface Lesson {
  id: string
  course_id: string
  sort_order: number
  title: string
  description: string
  content_type: 'video' | 'pdf' | 'text'
  video_url: string | null
  content_html: string
  has_certificate: boolean
}

export interface Course {
  id: string
  title: string
  instructor: string
  description: string
}

export const COURSES: Course[] = [
  {
    id: 'sveikas-zarnynas',
    title: 'SVEIKAS ŽARNYNAS',
    instructor: 'Indrė Misiūnienė, Gydytoja',
    description: 'Išmokite rūpintis savo žarnyno sveikata su gydytojos Indrės Misiūnienės patarimais.'
  }
]

export async function fetchLessons(courseId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching lessons:', error)
    return []
  }
  return data || []
}

export async function updateLesson(id: string, updates: Partial<Lesson>) {
  const { error } = await supabase
    .from('lessons')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  return { error }
}

export async function createLesson(lesson: Omit<Lesson, 'id' | 'has_certificate'>) {
  const { data, error } = await supabase
    .from('lessons')
    .insert(lesson)
    .select()
    .single()
  return { data, error }
}

export async function deleteLesson(id: string) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id)
  return { error }
}

export async function reorderLessons(lessons: { id: string; sort_order: number }[]) {
  for (const l of lessons) {
    await supabase
      .from('lessons')
      .update({ sort_order: l.sort_order })
      .eq('id', l.id)
  }
}
