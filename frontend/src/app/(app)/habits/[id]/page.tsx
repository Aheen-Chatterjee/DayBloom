'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { habitsApi } from '@/lib/api/habits'
import { completionsApi } from '@/lib/api/completions'
import { useHabitStreak } from '@/hooks/useStreaks'
import { StatsCard } from '@/components/habits/StatsCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Habit } from '@/types/habits'
import { daysAgoISO, todayISO } from '@/lib/utils/dates'

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [habit, setHabit] = useState<Habit | null>(null)
  const [loading, setLoading] = useState(true)
  const [weekData, setWeekData] = useState<boolean[]>([])
  const { streak } = useHabitStreak(id)
  const router = useRouter()

  useEffect(() => {
    habitsApi.list().then(habits => {
      const found = habits.find(h => h.id === id)
      setHabit(found || null)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    // Load last 7 days of completions
    const fetchWeek = async () => {
      const results = await Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const date = daysAgoISO(6 - i)
          return completionsApi.listByDate(date).then(cs => cs.some(c => c.habit_id === id))
        })
      )
      setWeekData(results)
    }
    fetchWeek().catch(() => {})
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!habit) return <div className="p-8 text-center text-[#8B7A65]">Habit not found.</div>

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-[#8B7355] hover:underline mb-6 block">
        ← Back to habits
      </button>

      <div className="flex items-center gap-4 mb-8">
        {habit.emoticon && <span className="text-4xl">{habit.emoticon}</span>}
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#8B7355]">{habit.name}</h1>
          {habit.description && <p className="text-[#8B7A65] mt-1">{habit.description}</p>}
          <Badge variant="umber" className="mt-2 capitalize">{habit.frequency}</Badge>
        </div>
      </div>

      {streak && (
        <StatsCard streak={streak} weekData={weekData} />
      )}
    </div>
  )
}
