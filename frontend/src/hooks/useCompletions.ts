import { useState, useEffect, useCallback } from 'react'
import { completionsApi } from '@/lib/api/completions'
import { useToast } from '@/context/ToastContext'
import type { Completion } from '@/types/completions'
import { todayISO } from '@/lib/utils/dates'

export function useCompletions(date: string = todayISO()) {
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const load = useCallback(async () => {
    try {
      const data = await completionsApi.listByDate(date)
      setCompletions(data)
    } catch {
      showToast('Failed to load completions', 'error')
    } finally {
      setLoading(false)
    }
  }, [date, showToast])

  useEffect(() => { load() }, [load])

  const toggle = useCallback(async (habitId: string) => {
    const existing = completions.find(c => c.habit_id === habitId)

    if (existing) {
      setCompletions(prev => prev.filter(c => c.id !== existing.id))
      try {
        await completionsApi.delete(existing.id)
      } catch {
        setCompletions(prev => [...prev, existing])
        showToast('Failed to update', 'error')
      }
    } else {
      const optimistic: Completion = {
        id: 'temp-' + habitId,
        habit_id: habitId,
        user_id: '',
        completion_date: date,
        completed_at: new Date().toISOString(),
        note: null,
      }
      setCompletions(prev => [...prev, optimistic])
      try {
        const real = await completionsApi.create({ habit_id: habitId, completion_date: date })
        setCompletions(prev => prev.map(c => c.id === optimistic.id ? real : c))
      } catch {
        setCompletions(prev => prev.filter(c => c.id !== optimistic.id))
        showToast('Failed to update', 'error')
      }
    }
  }, [completions, date, showToast])

  const isCompleted = useCallback((habitId: string) => {
    return completions.some(c => c.habit_id === habitId)
  }, [completions])

  return { completions, loading, toggle, isCompleted }
}
