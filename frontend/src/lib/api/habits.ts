import { apiFetch } from './client'
import type { Habit, CreateHabit, UpdateHabit } from '@/types/habits'

export const habitsApi = {
  list(): Promise<Habit[]> {
    return apiFetch('/api/v1/habits')
  },

  create(data: CreateHabit): Promise<Habit> {
    return apiFetch('/api/v1/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: UpdateHabit): Promise<Habit> {
    return apiFetch(`/api/v1/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  archive(id: string): Promise<void> {
    return apiFetch(`/api/v1/habits/${id}`, { method: 'DELETE' })
  },
}
