import { apiFetch } from './client'
import type {
  JournalEntry,
  JournalListResponse,
  CreateJournalEntry,
  UpdateJournalEntry,
} from '@/types/journal'

export const journalApi = {
  list(page = 1, limit = 20): Promise<JournalListResponse> {
    return apiFetch(`/api/v1/journal/entries?page=${page}&limit=${limit}`)
  },

  get(id: string): Promise<JournalEntry> {
    return apiFetch(`/api/v1/journal/entries/${id}`)
  },

  create(data: CreateJournalEntry): Promise<JournalEntry> {
    return apiFetch('/api/v1/journal/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: UpdateJournalEntry): Promise<JournalEntry> {
    return apiFetch(`/api/v1/journal/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/api/v1/journal/entries/${id}`, { method: 'DELETE' })
  },
}
