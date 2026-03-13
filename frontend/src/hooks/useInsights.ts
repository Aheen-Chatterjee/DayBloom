'use client'

import { useState, useEffect, useCallback } from 'react'
import { insightsApi } from '@/lib/api/insights'
import type { InsightsSummary, HabitCorrelation } from '@/types/insights'

export function useInsights(days: number = 14) {
  const [summary, setSummary] = useState<InsightsSummary | null>(null)
  const [correlations, setCorrelations] = useState<HabitCorrelation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (d: number) => {
    setLoading(true)
    setError(null)
    try {
      const [s, c] = await Promise.all([
        insightsApi.getSummary(d),
        insightsApi.getCorrelations(),
      ])
      setSummary(s)
      setCorrelations(c)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(days) }, [days, load])

  return { summary, correlations, loading, error, reload: load }
}
