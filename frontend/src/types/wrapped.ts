export interface WordCloudWord {
  text: string
  value: number
  sentiment: string | null
}

export interface WrappedTheme {
  theme: string
  count: number
}

export interface WrappedStats {
  entries_written: number
  positive_days: number
  top_habit_name: string | null
  top_habit_streak: number
  avg_energy: string
}

export interface WrappedCorrelation {
  habit_name: string
  avg_sentiment_completed: number
  avg_sentiment_skipped: number
  correlation_delta: number
}

export interface WrappedReport {
  id: string
  period: string
  start_date: string
  end_date: string
  dominant_sentiment: string | null
  dominant_sentiment_count: number
  total_days_journaled: number
  sentiment_timeline: Array<{
    date: string
    primary_sentiment: string | null
    sentiment_score: number | null
    energy_level: string | null
    one_line_summary: string | null
  }>
  word_cloud_words: WordCloudWord[]
  top_themes: WrappedTheme[]
  habit_correlations: WrappedCorrelation[]
  narrative: string
  stats: WrappedStats
  created_at: string
}
