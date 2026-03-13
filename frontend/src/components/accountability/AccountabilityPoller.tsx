'use client'

import { useEffect, useRef } from 'react'
import { useRoast } from '@/context/RoastContext'
import { fetchRoast } from '@/lib/api/accountability'

const POLL_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

export function AccountabilityPoller() {
  const { show } = useRoast()
  const inFlight = useRef(false)

  async function checkAndRoast() {
    if (inFlight.current) return
    inFlight.current = true
    try {
      const data = await fetchRoast()
      if (data.roast) {
        show({ roast: data.roast, broken_habits: data.broken_habits })
      }
    } catch {
      // Silent fail
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
