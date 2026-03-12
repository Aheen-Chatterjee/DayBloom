'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

export default function Home() {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(session ? '/dashboard' : '/login')
    }
  }, [session, loading, router])

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 font-serif text-[#8B7355]">DayBloom</div>
        <div className="text-2xl mb-4">(^._.^)~</div>
        <Spinner className="mx-auto" />
      </div>
    </div>
  )
}
