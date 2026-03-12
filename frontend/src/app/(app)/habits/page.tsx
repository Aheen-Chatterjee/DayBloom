'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useHabits } from '@/hooks/useHabits'
import { useAllStreaks } from '@/hooks/useStreaks'
import { HabitCard } from '@/components/habits/HabitCard'
import { HabitForm } from '@/components/habits/HabitForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
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
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#8B7355]">Habits ✿</h1>
          <p className="text-[#A08B6E] mt-1">{habits.length} active habit{habits.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Add habit</Button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon="✿"
          title="No habits yet"
          description="Add your first habit and start building your daily bloom"
          action={<Button onClick={() => setShowCreate(true)}>Add first habit</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
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

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New habit ✿">
        <HabitForm
          onSubmit={async (data) => {
            await create(data as Parameters<typeof create>[0])
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
          submitLabel="Create habit"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit habit">
        {editing && (
          <HabitForm
            initial={editing}
            onSubmit={async (data) => {
              await update(editing.id, data)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>
    </div>
  )
}
