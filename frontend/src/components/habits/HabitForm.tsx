'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { HABIT_COLORS } from '@/lib/utils/colors'
import type { CreateHabit, Habit, UpdateHabit } from '@/types/habits'

const EMOTICONS = ['✿', '♡', '✧', '(◕‿◕)', '(ﾉ◕ヮ◕)ﾉ', 'v(^_^)v', '(˘▾˘)', '(^._.^)~', '(￣ω￣)']

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined, emoticon: emoticon || undefined, color, frequency })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Habit name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning meditation" error={error} />
      <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />

      <div>
        <label className="text-sm font-medium text-[#2C2C2C] mb-1 block">Emoticon</label>
        <div className="flex flex-wrap gap-2">
          {EMOTICONS.map(e => (
            <button key={e} type="button"
              onClick={() => setEmoticon(e === emoticon ? '' : e)}
              className={`px-2 py-1 rounded-lg text-base border transition-colors ${emoticon === e ? 'bg-[#EDE8DF] border-[#8B7355]' : 'border-[#D4C5A9] hover:bg-[#EDE8DF]'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#2C2C2C] mb-1 block">Color</label>
        <div className="flex gap-2">
          {HABIT_COLORS.map(c => (
            <button key={c} type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-[#2C2C2C] scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#2C2C2C] mb-1 block">Frequency</label>
        <div className="flex gap-2">
          {(['daily', 'weekdays', 'custom'] as const).map(f => (
            <button key={f} type="button"
              onClick={() => setFrequency(f)}
              className={`px-3 py-1.5 rounded-lg text-sm border capitalize transition-colors ${frequency === f ? 'bg-[#8B7355] text-white border-[#8B7355]' : 'border-[#D4C5A9] hover:bg-[#EDE8DF]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
