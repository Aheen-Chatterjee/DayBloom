'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Leaf } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F5EF' }}>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#1E3D2F] flex items-center justify-center mx-auto">
            <Leaf size={20} className="text-[#C9A96E]" />
          </div>
          <div className="w-5 h-5 border-2 border-[#E2DBD0] border-t-[#1E3D2F] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
