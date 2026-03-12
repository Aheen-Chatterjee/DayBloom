import { apiFetch } from './client'
import type { HistoryResponse } from '@/types/streaks'

export const historyApi = {
  getRange(from: string, to: string): Promise<HistoryResponse> {
    return apiFetch(`/api/v1/history?from=${from}&to=${to}`)
  },
}
