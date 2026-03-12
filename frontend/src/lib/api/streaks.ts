import { apiFetch } from './client'
import type { StreakData, AllStreaksResponse } from '@/types/streaks'

export const streaksApi = {
  getForHabit(habitId: string): Promise<StreakData> {
    return apiFetch(`/api/v1/habits/${habitId}/streak`)
  },

  getAll(): Promise<AllStreaksResponse> {
    return apiFetch('/api/v1/streaks/all')
  },
}
