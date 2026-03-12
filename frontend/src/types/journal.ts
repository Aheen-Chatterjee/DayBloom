export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  title: string | null
  body: string
  created_at: string
  updated_at: string
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
