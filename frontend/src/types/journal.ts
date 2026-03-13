export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  title: string | null
  body: string
  created_at: string
  updated_at: string
  // AI analysis fields
  primary_sentiment?: string | null
  sentiment_score?: number | null
  energy_level?: string | null
  key_themes?: string[] | null
  one_line_summary?: string | null
  keywords?: string[] | null
  analysis_status?: string | null
  analysed_at?: string | null
}

export interface JournalListResponse {
  items: JournalEntry[]
  total: number
  page: number
  has_next: boolean
}

export interface CreateJournalEntry {
  entry_date: string
  title?: string
  body?: string
}

export interface UpdateJournalEntry {
  title?: string
  body?: string
  entry_date?: string
}
