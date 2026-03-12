'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

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
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-[#8B7355] mb-2">DayBloom</h1>
          <p className="text-[#A08B6E]">(^._.^)~ welcome back</p>
        </div>

        {/* Card */}
        <div className="bg-[#FAF7F2] border border-[#D4C5A9] rounded-2xl p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-[#8B7355] mb-6">Sign in</h2>

          {/* Demo CTA */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full mb-4 p-3 rounded-xl bg-[#EDE8DF] border border-[#D4C5A9] text-sm text-[#8B7355] hover:bg-[#D4C5A9] transition-colors text-left"
          >
            <span className="font-semibold">✿ Try as Luna Bloom (demo)</span>
            <br />
            <span className="text-xs text-[#A08B6E]">Click to prefill demo credentials</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#D4C5A9]" />
            <span className="text-xs text-[#A08B6E]">or sign in</span>
            <div className="flex-1 h-px bg-[#D4C5A9]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              error={error}
            />
            <Button type="submit" disabled={loading} className="w-full mt-2" size="lg">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center mt-4 text-sm text-[#8B7A65]">
            No account?{' '}
            <Link href="/signup" className="text-[#8B7355] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
