'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { User, Lock, AlertTriangle } from 'lucide-react'

function Section({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E2DBD0] rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(30,61,47,0.06)' }}>
      <div className="px-6 py-4 border-b border-[#F0EDE4] flex items-center gap-2.5">
        <Icon size={15} className="text-[#7A7169]" />
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: 600, color: '#1A1A1A' }}>
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const supabase = createClient()
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingName(true)
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } })
    if (error) showToast(error.message, 'error')
    else showToast('Display name updated')
    setSavingName(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { showToast('Passwords do not match', 'error'); return }
    if (newPassword.length < 8) { showToast('Password must be at least 8 characters', 'error'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) showToast(error.message, 'error')
    else { showToast('Password updated'); setNewPassword(''); setConfirmPassword('') }
    setSavingPassword(false)
  }

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#F7F5EF' }}>
      <div className="max-w-xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#B0A898] uppercase tracking-widest mb-2">Account</p>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', fontWeight: 600, color: '#1A1A1A' }}>
            Settings
          </h1>
          <p className="text-sm text-[#7A7169] mt-1">{user?.email}</p>
        </div>

        <div className="space-y-4">
          <Section icon={User} title="Profile">
            <form onSubmit={handleSaveName} className="space-y-4">
              <Input label="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
              <Button type="submit" disabled={savingName}>{savingName ? 'Saving...' : 'Save name'}</Button>
            </form>
          </Section>

          <Section icon={Lock} title="Password">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input label="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
              <Input label="Confirm password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
              <Button type="submit" disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Update password'}</Button>
            </form>
          </Section>

          <Section icon={AlertTriangle} title="Danger Zone">
            <p className="text-sm text-[#7A7169] mb-4">Permanently deletes all your data. This cannot be undone.</p>
            <Button variant="danger" onClick={() => {
              if (confirm('Are you sure? All data will be permanently deleted.')) {
                if (confirm('Final confirmation — delete everything?')) {
                  alert('Account deletion requires admin action. Please contact support.')
                }
              }
            }}>
              Delete account
            </Button>
          </Section>
        </div>
      </div>
    </div>
  )
}
