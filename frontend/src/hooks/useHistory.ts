import { useState, useCallback } from 'react'
import { historyApi } from '@/lib/api/history'
import type { DayHistory } from '@/types/streaks'
import { daysAgoISO, todayISO } from '@/lib/utils/dates'

export function useHistory() {
  const [days, setDays] = useState<DayHistory[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (from?: string, to?: string) => {
    setLoading(true)
    try {
      const fromDate = from || daysAgoISO(89)
      const toDate = to || todayISO()
      const result = await historyApi.getRange(fromDate, toDate)
      setDays(result.days)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  return { days, loading, load }
}
