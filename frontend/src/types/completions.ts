export interface Completion {
  id: string
  habit_id: string
  user_id: string
  completion_date: string
  completed_at: string
  note: string | null
  proof_image_url?: string
  proof_verdict?: string
}
