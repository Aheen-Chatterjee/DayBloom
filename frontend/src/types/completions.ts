export interface Completion {
  id: string
  habit_id: string
  user_id: string
  completion_date: string
  completed_at: string
  note: string | null
}

export interface CreateCompletion {
  habit_id: string
  completion_date: string
  note?: string
}
