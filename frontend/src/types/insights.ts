export interface MoodTimelinePoint {
  date: string
  primary_sentiment: string | null
  sentiment_score: number | null
  energy_level: string | null
  one_line_summary: string | null
}

export interface ThemeCount {
  theme: string
  count: number
}

export interface InsightsSummary {
  period_days: number
  entries_analysed: number
  sentiment_distribution: Record<string, number>
  avg_sentiment_score: number
  dominant_sentiment: string | null
  top_themes: ThemeCount[]
  energy_distribution: Record<string, number>
  mood_timeline: MoodTimelinePoint[]
}

export interface HabitCorrelation {
  habit_id: string
  habit_name: string
  avg_sentiment_completed: number
  avg_sentiment_skipped: number
  correlation_delta: number
  completed_count: number
  skipped_count: number
}
