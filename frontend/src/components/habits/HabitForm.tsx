'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { HABIT_COLORS } from '@/lib/utils/colors'
import type { CreateHabit, Habit, UpdateHabit } from '@/types/habits'

const EMOTICONS = ['🌱', '📚', '💧', '🚶', '🙏', '⭐', '🎯', '🧘', '✍️', '🌿', '💡', '🏃']

interface HabitFormProps {
  initial?: Partial<Habit>
  onSubmit: (data: CreateHabit | UpdateHabit) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function HabitForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }: HabitFormProps) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [emoticon, setEmoticon] = useState(initial?.emoticon || '')
  const [color, setColor] = useState(initial?.color || HABIT_COLORS[0])
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>(initial?.frequency || 'daily')
  const [requiresProof, setRequiresProof] = useState(initial?.requires_proof ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined, emoticon: emoticon || undefined, color, frequency, requires_proof: requiresProof })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Habit name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning meditation" error={error} />
      <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />

      <div>
        <p className="text-xs font-semibold text-[#7A7169] uppercase tracking-wider mb-2">Icon</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setEmoticon('')}
            className={`w-9 h-9 rounded-lg border text-xs transition-all ${!emoticon ? 'bg-[#1E3D2F] border-[#1E3D2F] text-white' : 'border-[#E2DBD0] hover:border-[#C9A96E]'}`}>
            None
          </button>
          {EMOTICONS.map(e => (
            <button key={e} type="button" onClick={() => setEmoticon(e === emoticon ? '' : e)}
              className={`w-9 h-9 rounded-lg border text-lg transition-all ${emoticon === e ? 'bg-[#1E3D2F12] border-[#1E3D2F]' : 'border-[#E2DBD0] hover:border-[#C9A96E]'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#7A7169] uppercase tracking-wider mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {HABIT_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-[#1E3D2F] scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#7A7169] uppercase tracking-wider mb-2">Frequency</p>
        <div className="flex gap-2">
          {(['daily', 'weekdays', 'custom'] as const).map(f => (
            <button key={f} type="button" onClick={() => setFrequency(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize border transition-all ${frequency === f ? 'bg-[#1E3D2F] text-white border-[#1E3D2F]' : 'border-[#E2DBD0] text-[#7A7169] hover:border-[#C9A96E]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Proof requirement toggle */}
      <button
        type="button"
        onClick={() => setRequiresProof(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-150 ${
          requiresProof
            ? 'bg-[#1E3D2F08] border-[#1E3D2F30] text-[#1E3D2F]'
            : 'bg-[#F7F5F2] border-[#E2DBD0] text-[#7A7169]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Camera size={15} strokeWidth={2} />
          <div className="text-left">
            <p className="text-xs font-semibold">Require photo proof</p>
            <p className="text-xs opacity-60 mt-0.5">{requiresProof ? 'AI verifies completion' : 'Free checkbox — no photo needed'}</p>
          </div>
        </div>
        <div className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${requiresProof ? 'bg-[#1E3D2F]' : 'bg-[#D5CEC5]'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${requiresProof ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
      </button>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving...' : submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
