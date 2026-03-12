export type HabitFrequency = 'daily' | 'weekdays' | 'custom'

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  emoticon: string | null
  color: string | null
  frequency: HabitFrequency
  created_at: string
  archived_at: string | null
}

export interface CreateHabit {
  name: string
  description?: string
  emoticon?: string
  color?: string
  frequency?: HabitFrequency
}

export interface UpdateHabit {
  name?: string
  description?: string
  emoticon?: string
  color?: string
  frequency?: HabitFrequency
}
