import { apiFetch } from './client'
import type { Completion, CreateCompletion } from '@/types/completions'

export const completionsApi = {
  listByDate(date: string): Promise<Completion[]> {
    return apiFetch(`/api/v1/completions?date=${date}`)
  },

  create(data: CreateCompletion): Promise<Completion> {
    return apiFetch('/api/v1/completions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/api/v1/completions/${id}`, { method: 'DELETE' })
  },
}
