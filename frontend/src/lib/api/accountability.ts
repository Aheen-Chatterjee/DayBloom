import { apiFetch } from './client'

export interface RoastResponse {
  roast: string | null
  broken_habits: Array<{
    name: string
    description: string
    emoticon: string
    days_missed: number
    last_completed: string
  }>
}

export async function fetchRoast(force = false): Promise<RoastResponse> {
  const qs = force ? '?force=true' : ''
  return apiFetch<RoastResponse>(`/api/v1/accountability/roast${qs}`)
}
