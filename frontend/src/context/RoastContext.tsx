'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface RoastPayload {
  roast: string
  broken_habits: Array<{
    name: string
    emoticon: string
    days_missed: number
  }>
}

interface RoastContextType {
  payload: RoastPayload | null
  show: (p: RoastPayload) => void
  dismiss: () => void
}

const RoastContext = createContext<RoastContextType>({
  payload: null,
  show: () => {},
  dismiss: () => {},
})

export function RoastProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<RoastPayload | null>(null)

  const show = useCallback((p: RoastPayload) => setPayload(p), [])
  const dismiss = useCallback(() => setPayload(null), [])

  return (
    <RoastContext.Provider value={{ payload, show, dismiss }}>
      {children}
    </RoastContext.Provider>
  )
}

export const useRoast = () => useContext(RoastContext)
