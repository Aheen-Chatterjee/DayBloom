'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Leaf } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.replace('/dashboard')
    }
  }

  const fillDemo = () => {
    setEmail('demo@daybloom.app')
    setPassword('DayBloom2025!')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F5EF' }}>
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(160deg, #1E3D2F 0%, #0D2018 100%)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C9A96E] flex items-center justify-center">
            <Leaf size={16} className="text-[#1E3D2F]" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', color: 'white', fontWeight: 600 }}>
            DayBloom
          </span>
        </div>
        <div>
          <blockquote
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '28px', color: 'white', lineHeight: 1.35, fontStyle: 'italic' }}
          >
            &ldquo;Small daily habits, compounded over time, become a remarkable life.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-[#7AA88A]">Track what matters. Build what lasts.</p>
        </div>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-1 rounded-full flex-1" style={{ background: i <= 3 ? '#C9A96E' : '#2A5940' }} />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-[#1E3D2F] flex items-center justify-center">
              <Leaf size={13} className="text-[#C9A96E]" />
            </div>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '20px', color: '#1E3D2F', fontWeight: 600 }}>
              DayBloom
            </span>
          </div>

          <h1 className="mb-1" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '32px', fontWeight: 600, color: '#1A1A1A' }}>
            Welcome back
          </h1>
          <p className="text-sm text-[#7A7169] mb-8">Sign in to continue your practice</p>

          {/* Demo button */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full mb-6 p-4 rounded-xl text-left transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #1E3D2F08 0%, #C9A96E12 100%)',
              border: '1.5px solid #C9A96E40',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#C9A96E80')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#C9A96E40')}
          >
            <div className="text-sm font-semibold text-[#1E3D2F]">Try the demo account</div>
            <div className="text-xs text-[#7A7169] mt-0.5">Explore with Luna Bloom&apos;s 14 days of data</div>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#E2DBD0]" />
            <span className="text-xs text-[#B0A898]">or continue with email</span>
            <div className="flex-1 h-px bg-[#E2DBD0]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required error={error} />
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-[#7A7169]">
            New here?{' '}
            <Link href="/signup" className="font-medium hover:underline" style={{ color: '#1E3D2F' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
