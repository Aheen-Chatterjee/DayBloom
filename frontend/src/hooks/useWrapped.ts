'use client'

import { useState, useCallback } from 'react'
import { wrappedApi } from '@/lib/api/wrapped'
import type { WrappedReport } from '@/types/wrapped'

export function useWrapped() {
  const [report, setReport] = useState<WrappedReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (period: 'week' | 'month', startDate: string) => {
    setLoading(true)
    setError(null)
    try {
      const r = await wrappedApi.generate(period, startDate)
      setReport(r)
      return r
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to generate wrapped'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const loadLatest = useCallback(async (period: 'week' | 'month') => {
    setLoading(true)
    setError(null)
    try {
      const r = await wrappedApi.getLatest(period)
      setReport(r)
      return r
    } catch {
      setError(null) // no latest is fine
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { report, loading, error, generate, loadLatest }
}
