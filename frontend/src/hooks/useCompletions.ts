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

  /** Called after a proof is approved — appends the server-confirmed completion to local state. */
  const addCompletion = useCallback((completion: Completion) => {
    setCompletions(prev => {
      if (prev.some(c => c.id === completion.id)) return prev
      return [...prev, completion]
    })
  }, [])

  const isCompleted = useCallback(
    (habitId: string) => completions.some(c => c.habit_id === habitId),
    [completions],
  )

  return { completions, loading, addCompletion, isCompleted }
}
