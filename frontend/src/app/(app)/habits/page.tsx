'use client'

import { useState } from 'react'
import { useHabits } from '@/hooks/useHabits'
import { useAllStreaks } from '@/hooks/useStreaks'
import { HabitCard } from '@/components/habits/HabitCard'
import { HabitForm } from '@/components/habits/HabitForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Plus, Sparkles } from 'lucide-react'
import type { Habit } from '@/types/habits'

export default function HabitsPage() {
  const { habits, loading, create, update, archive } = useHabits()
  const { streaks } = useAllStreaks()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner /></div>
  }

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#F7F5EF' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-[#B0A898] uppercase tracking-widest mb-2">Practice</p>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.1 }}>
              Your Habits
            </h1>
            <p className="text-sm text-[#7A7169] mt-1">
              {habits.length} active habit{habits.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus size={14} />
            Add habit
          </Button>
        </div>

        {habits.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={40} />}
            title="Begin your practice"
            description="Add your first habit and start building momentum through consistent daily action."
            action={
              <Button onClick={() => setShowCreate(true)} className="gap-1.5">
                <Plus size={14} />
                Add your first habit
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                currentStreak={streaks[habit.id]?.current_streak ?? 0}
                onClick={() => {}}
                onEdit={() => setEditing(habit)}
                onArchive={() => archive(habit.id)}
              />
            ))}
          </div>
        )}

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New habit">
          <HabitForm
            onSubmit={async (data) => { await create(data as Parameters<typeof create>[0]); setShowCreate(false) }}
            onCancel={() => setShowCreate(false)}
            submitLabel="Create habit"
          />
        </Modal>

        <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit habit">
          {editing && (
            <HabitForm
              initial={editing}
              onSubmit={async (data) => { await update(editing.id, data); setEditing(null) }}
              onCancel={() => setEditing(null)}
              submitLabel="Save changes"
            />
          )}
        </Modal>
      </div>
    </div>
  )
}
