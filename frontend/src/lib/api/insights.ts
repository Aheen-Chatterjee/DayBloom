import { apiFetch } from './client'
import type { InsightsSummary, MoodTimelinePoint, HabitCorrelation } from '@/types/insights'

export const insightsApi = {
  getSummary: (days: number = 14) =>
    apiFetch<InsightsSummary>(`/api/v1/insights/summary?days=${days}`),

  getMoodTimeline: (days: number = 14) =>
    apiFetch<MoodTimelinePoint[]>(`/api/v1/insights/mood-timeline?days=${days}`),

  getCorrelations: () =>
    apiFetch<HabitCorrelation[]>('/api/v1/insights/correlations'),
}
