'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
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
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    })
    if (error) showToast(error.message, 'error')
    else showToast('Display name updated! ✿')
    setSavingName(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) showToast(error.message, 'error')
    else {
      showToast('Password updated!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setSavingPassword(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete all your data and cannot be undone.')) return
    if (!confirm('Final confirmation: delete everything?')) return
    showToast('Account deletion requires admin action. Please contact support.', 'info')
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#8B7355]">Settings ♡</h1>
        <p className="text-[#A08B6E] mt-1">{user?.email}</p>
      </div>

      <div className="space-y-6">
        {/* Display Name */}
        <Card>
          <h2 className="font-serif text-xl font-bold text-[#8B7355] mb-4">Profile</h2>
          <form onSubmit={handleSaveName} className="space-y-4">
            <Input
              label="Display name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
            <Button type="submit" disabled={savingName}>
              {savingName ? 'Saving...' : 'Save name'}
            </Button>
          </form>
        </Card>

        {/* Password */}
        <Card>
          <h2 className="font-serif text-xl font-bold text-[#8B7355] mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card className="border-[#C4706A]">
          <h2 className="font-serif text-xl font-bold text-[#C4706A] mb-2">Danger Zone</h2>
          <p className="text-sm text-[#8B7A65] mb-4">
            Deleting your account permanently removes all data including journal entries, habits, and streaks.
          </p>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete account
          </Button>
        </Card>
      </div>
    </div>
  )
}
