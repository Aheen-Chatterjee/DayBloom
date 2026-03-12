import { useState, useEffect, useCallback } from 'react'
import { journalApi } from '@/lib/api/journal'
import { useToast } from '@/context/ToastContext'
import type { JournalEntry, JournalListResponse } from '@/types/journal'

export function useJournalList() {
  const [data, setData] = useState<JournalListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const load = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const result = await journalApi.list(page)
      setData(result)
    } catch {
      showToast('Failed to load journal entries', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  return { data, loading, load }
}

export function useJournalEntry(id: string) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    journalApi.get(id)
      .then(setEntry)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  return { entry, setEntry, loading }
}
