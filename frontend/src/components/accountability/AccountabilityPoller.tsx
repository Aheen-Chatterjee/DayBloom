'use client'

import { useEffect, useRef } from 'react'
import { useToast } from '@/context/ToastContext'
import { fetchRoast } from '@/lib/api/accountability'

const POLL_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

export function AccountabilityPoller() {
  const { showToast } = useToast()
  const inFlight = useRef(false)

  async function checkAndRoast() {
    if (inFlight.current) return
    inFlight.current = true
    try {
      const data = await fetchRoast()
      if (data.roast) {
        showToast(data.roast, 'roast')
      }
    } catch {
      // Silent fail — accountability coach takes a day off
    } finally {
      inFlight.current = false
    }
  }

  useEffect(() => {
    checkAndRoast()
    const interval = setInterval(checkAndRoast, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
