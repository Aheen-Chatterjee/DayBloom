import { apiFetch } from './client'

export const analysisApi = {
  reanalyse: (entryId: string) =>
    apiFetch<{ status: string }>(`/api/v1/journal/entries/${entryId}/analyse`, {
      method: 'POST',
    }),
}
