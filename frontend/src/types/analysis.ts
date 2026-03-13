export type MoodSentiment =
  | 'Joyful'
  | 'Content'
  | 'Neutral'
  | 'Anxious'
  | 'Stressed'
  | 'Sad'
  | 'Frustrated'
  | 'Energised'
  | 'Lethargic'
  | 'Hopeful'
  | 'Reflective'

export type EnergyLevel = 'High' | 'Medium' | 'Low'
export type AnalysisStatus = 'pending' | 'done' | 'failed' | 'skipped'

export interface AnalysisResult {
  primary_sentiment: MoodSentiment | null
  sentiment_score: number | null
  energy_level: EnergyLevel | null
  key_themes: string[] | null
  one_line_summary: string | null
  keywords: string[] | null
  analysis_status: AnalysisStatus | null
  analysed_at: string | null
}

export const MOOD_COLORS: Record<string, string> = {
  Joyful: '#2A5940',
  Content: '#4E7D5E',
  Hopeful: '#7AA88A',
  Energised: '#C9A96E',
  Neutral: '#7A7169',
  Reflective: '#8B8BAE',
  Anxious: '#C08B5A',
  Stressed: '#C0674E',
  Frustrated: '#A0522D',
  Sad: '#6B7FA3',
  Lethargic: '#9E9E9E',
}

export const MOOD_BG_COLORS: Record<string, string> = {
  Joyful: '#2A594015',
  Content: '#4E7D5E15',
  Hopeful: '#7AA88A15',
  Energised: '#C9A96E18',
  Neutral: '#7A716915',
  Reflective: '#8B8BAE15',
  Anxious: '#C08B5A18',
  Stressed: '#C0674E15',
  Frustrated: '#A0522D15',
  Sad: '#6B7FA315',
  Lethargic: '#9E9E9E15',
}

export const MOOD_EMOJIS: Record<string, string> = {
  Joyful: '🌟',
  Content: '😌',
  Hopeful: '🌱',
  Energised: '⚡',
  Neutral: '😶',
  Reflective: '🌙',
  Anxious: '😰',
  Stressed: '😤',
  Frustrated: '😠',
  Sad: '😔',
  Lethargic: '😴',
}

export function getMoodColor(sentiment: string | null | undefined): string {
  return MOOD_COLORS[sentiment ?? ''] ?? '#B0A898'
}

export function getMoodBgColor(sentiment: string | null | undefined): string {
  return MOOD_BG_COLORS[sentiment ?? ''] ?? '#F7F5EF'
}

export function getMoodEmoji(sentiment: string | null | undefined): string {
  return MOOD_EMOJIS[sentiment ?? ''] ?? '·'
}
