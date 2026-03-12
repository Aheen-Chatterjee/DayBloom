import { useState, useEffect, useCallback } from 'react'
import { habitsApi } from '@/lib/api/habits'
import { useToast } from '@/context/ToastContext'
import type { Habit, CreateHabit, UpdateHabit } from '@/types/habits'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await habitsApi.list()
      setHabits(data)
    } catch {
      showToast('Failed to load habits', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (data: CreateHabit) => {
    const habit = await habitsApi.create(data)
    setHabits(prev => [...prev, habit])
    showToast('Habit created! ✿')
    return habit
  }, [showToast])

  const update = useCallback(async (id: string, data: UpdateHabit) => {
    const habit = await habitsApi.update(id, data)
    setHabits(prev => prev.map(h => h.id === id ? habit : h))
    showToast('Habit updated!')
    return habit
  }, [showToast])

  const archive = useCallback(async (id: string) => {
    await habitsApi.archive(id)
    setHabits(prev => prev.filter(h => h.id !== id))
    showToast('Habit archived')
  }, [showToast])

  return { habits, loading, create, update, archive, reload: load }
}
