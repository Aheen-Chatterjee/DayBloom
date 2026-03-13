import { createClient } from '@/lib/supabase/client'
import { apiFetch } from './client'
import type { Completion } from '@/types/completions'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Thrown by verifyHabitCompletion when the AI rejects the proof photo.
 * The `verdict` field contains the sarcastic rejection message.
 */
export class ProofRejectedError extends Error {
  verdict: string
  constructor(verdict: string) {
    super('Proof rejected')
    this.name = 'ProofRejectedError'
    this.verdict = verdict
  }
}

export const completionsApi = {
  listByDate(date: string): Promise<Completion[]> {
    return apiFetch(`/api/v1/completions?date=${date}`)
  },

  create(habitId: string, date: string): Promise<Completion> {
    return apiFetch(`/api/v1/completions`, {
      method: 'POST',
      body: JSON.stringify({ habit_id: habitId, completion_date: date }),
    })
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/api/v1/completions/${id}`, { method: 'DELETE' })
  },
}

/**
 * Submit a proof photo for habit completion verification.
 *
 * Uses raw fetch (NOT apiFetch) because FormData requires the browser to set
 * Content-Type: multipart/form-data with the correct boundary. apiFetch
 * hardcodes Content-Type: application/json, which corrupts the upload.
 *
 * @throws ProofRejectedError  if the AI rejects the proof (HTTP 400 with body.verdict)
 * @throws Error               on any other failure
 */
export async function verifyHabitCompletion(
  habitId: string,
  imageFile: File,
  date?: string,
): Promise<Completion> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  const formData = new FormData()
  formData.append('habit_id', habitId)
  formData.append('image', imageFile)
  if (date) formData.append('date', date)

  // Do NOT set Content-Type — browser sets multipart/form-data with boundary automatically
  const res = await fetch(`${API_URL}/api/v1/completions/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  })

  if (res.status === 201) {
    return res.json() as Promise<Completion>
  }

  const body = await res.json().catch(() => ({}))

  if (res.status === 400 && body.verdict) {
    throw new ProofRejectedError(body.verdict)
  }

  throw new Error(body.detail || `Request failed with status ${res.status}`)
}
