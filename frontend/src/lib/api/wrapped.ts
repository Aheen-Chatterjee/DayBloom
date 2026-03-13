import { apiFetch } from './client'
import type { WrappedReport } from '@/types/wrapped'

export const wrappedApi = {
  generate: (period: 'week' | 'month', startDate: string) =>
    apiFetch<WrappedReport>('/api/v1/wrapped/generate', {
      method: 'POST',
      body: JSON.stringify({ period, start_date: startDate }),
    }),

  getLatest: (period: 'week' | 'month') =>
    apiFetch<WrappedReport>(`/api/v1/wrapped/latest?period=${period}`),

  get: (id: string) =>
    apiFetch<WrappedReport>(`/api/v1/wrapped/${id}`),
}
