'use client'

import { useState, useCallback, useRef } from 'react'
import { verifyHabitCompletion, ProofRejectedError } from '@/lib/api/completions'
import { useToast } from '@/context/ToastContext'
import type { Completion } from '@/types/completions'

export type ProofState = 'idle' | 'uploading' | 'verifying' | 'approved' | 'rejected'

export function useProofSubmission(onSuccess: (completion: Completion) => void) {
  const [state, setState] = useState<ProofState>('idle')
  const [verdict, setVerdict] = useState<string | null>(null)
  const { showToast } = useToast()
  const verifyingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const submit = useCallback(async (habitId: string, file: File) => {
    setState('uploading')
    setVerdict(null)

    // Transition to "verifying" after 2 s while the request is still in-flight.
    // The backend does upload + Vision in one request; this gives the user
    // meaningful feedback about what's happening under the hood.
    verifyingTimerRef.current = setTimeout(() => {
      setState(prev => (prev === 'uploading' ? 'verifying' : prev))
    }, 2000)

    try {
      const completion = await verifyHabitCompletion(habitId, file)
      if (verifyingTimerRef.current) clearTimeout(verifyingTimerRef.current)
      setState('approved')
      setVerdict(completion.proof_verdict ?? null)
      onSuccess(completion)
    } catch (err) {
      if (verifyingTimerRef.current) clearTimeout(verifyingTimerRef.current)
      if (err instanceof ProofRejectedError) {
        setState('rejected')
        setVerdict(err.verdict)
      } else {
        setState('idle')
        showToast('Upload failed. Please try again.', 'error')
      }
    }
  }, [onSuccess, showToast])

  const reset = useCallback(() => {
    if (verifyingTimerRef.current) clearTimeout(verifyingTimerRef.current)
    setState('idle')
    setVerdict(null)
  }, [])

  return { state, verdict, submit, reset }
}
