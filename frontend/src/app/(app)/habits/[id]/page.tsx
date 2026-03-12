'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { habitsApi } from '@/lib/api/habits'
import { completionsApi } from '@/lib/api/completions'
import { useHabitStreak } from '@/hooks/useStreaks'
import { StatsCard } from '@/components/habits/StatsCard'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ArrowLeft } from 'lucide-react'
import type { Habit } from '@/types/habits'
import { daysAgoISO } from '@/lib/utils/dates'

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [habit, setHabit] = useState<Habit | null>(null)
  const [loading, setLoading] = useState(true)
  const [weekData, setWeekData] = useState<boolean[]>([])
  const { streak } = useHabitStreak(id)
  const router = useRouter()

  useEffect(() => {
    habitsApi.list().then(habits => {
      setHabit(habits.find(h => h.id === id) || null)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    Promise.all(
      Array.from({ length: 7 }, (_, i) =>
        completionsApi.listByDate(daysAgoISO(6 - i)).then(cs => cs.some(c => c.habit_id === id))
      )
    ).then(setWeekData).catch(() => {})
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!habit) return <div className="p-8 text-center text-[#7A7169] text-sm">Habit not found.</div>

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#F7F5EF' }}>
      <div className="max-w-xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#7A7169] hover:text-[#1A1A1A] transition-colors mb-8">
          <ArrowLeft size={14} />
          Habits
        </button>
        <div className="flex items-center gap-4 mb-8">
          {habit.emoticon && <span className="text-4xl">{habit.emoticon}</span>}
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '32px', fontWeight: 600, color: '#1A1A1A' }}>
              {habit.name}
            </h1>
            {habit.description && <p className="text-sm text-[#7A7169] mt-1">{habit.description}</p>}
            <Badge variant="neutral" className="mt-2 capitalize">{habit.frequency}</Badge>
          </div>
        </div>
        {streak && <StatsCard streak={streak} weekData={weekData} />}
      </div>
    </div>
  )
}
