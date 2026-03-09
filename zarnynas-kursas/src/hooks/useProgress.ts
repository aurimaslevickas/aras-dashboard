import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProgress(courseId: string) {
  const [completed, setCompleted] = useState<number[]>([])

  useEffect(() => {
    if (!courseId) return
    loadProgress()
  }, [courseId])

  async function loadProgress() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('course_progress')
      .select('lesson_order')
      .eq('user_id', user.id)
      .eq('course_id', courseId)

    setCompleted(data?.map(d => d.lesson_order) || [])
  }

  const toggleLesson = useCallback(async (lessonOrder: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (completed.includes(lessonOrder)) {
      await supabase
        .from('course_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('lesson_order', lessonOrder)
      setCompleted(prev => prev.filter(o => o !== lessonOrder))
    } else {
      await supabase
        .from('course_progress')
        .insert({ user_id: user.id, course_id: courseId, lesson_order: lessonOrder })
      setCompleted(prev => [...prev, lessonOrder])
    }
  }, [courseId, completed])

  return { completed, toggleLesson }
}
