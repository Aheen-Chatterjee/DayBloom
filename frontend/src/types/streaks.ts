export interface StreakData {
  habit_id: string
  current_streak: number
  longest_streak: number
  total_completions: number
  last_completed_date: string | null
}

export interface AllStreaksResponse {
  streaks: StreakData[]
}

export interface DayHistory {
  date: string
  completion_count: number
  total_habits: number
  completion_percentage: number
  has_journal_entry: boolean
  completed_habit_ids: string[]
  // Mood data (if journal entry has been analysed)
  mood_sentiment?: string | null
  mood_summary?: string | null
}

export interface HistoryResponse {
  days: DayHistory[]
}
