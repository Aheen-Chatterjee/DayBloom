'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Leaf } from 'lucide-react'

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) { setError(error.message); setLoading(false) }
    else { router.replace('/dashboard') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#F7F5EF' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-lg bg-[#1E3D2F] flex items-center justify-center">
            <Leaf size={13} className="text-[#C9A96E]" />
          </div>
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '20px', color: '#1E3D2F', fontWeight: 600 }}>
            DayBloom
          </span>
        </div>

        <h1 className="mb-1" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '32px', fontWeight: 600, color: '#1A1A1A' }}>
          Begin your practice
        </h1>
        <p className="text-sm text-[#7A7169] mb-8">Create your account to get started</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input label="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="How should we call you?" />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required error={error} />
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-[#7A7169]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: '#1E3D2F' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
