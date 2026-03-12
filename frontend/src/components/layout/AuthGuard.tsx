'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login')
    }
  }, [session, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">(˘▾˘)</div>
          <Spinner className="mx-auto" />
          <p className="mt-2 text-sm text-[#8B7355]">Loading DayBloom...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
