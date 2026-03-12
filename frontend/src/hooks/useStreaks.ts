import { useState, useEffect, useCallback } from 'react'
import { streaksApi } from '@/lib/api/streaks'
import type { StreakData } from '@/types/streaks'

export function useAllStreaks() {
  const [streaks, setStreaks] = useState<Record<string, StreakData>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { streaks: list } = await streaksApi.getAll()
      const map: Record<string, StreakData> = {}
      list.forEach(s => { map[s.habit_id] = s })
      setStreaks(map)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { streaks, loading, reload: load }
}

export function useHabitStreak(habitId: string) {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    streaksApi.getForHabit(habitId)
      .then(setStreak)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [habitId])

  return { streak, loading }
}
