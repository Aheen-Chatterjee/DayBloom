'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useHabits } from '@/hooks/useHabits'
import { useCompletions } from '@/hooks/useCompletions'
import { useAllStreaks } from '@/hooks/useStreaks'
import { useAuth } from '@/context/AuthContext'
import { DailyChecklist } from '@/components/checklist/DailyChecklist'
import { StreakBadge } from '@/components/streaks/StreakBadge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, todayISO } from '@/lib/utils/dates'

export default function DashboardPage() {
  const { user } = useAuth()
  const { habits, loading: habitsLoading } = useHabits()
  const { isCompleted, toggle } = useCompletions(todayISO())
  const { streaks, loading: streaksLoading, reload: reloadStreaks } = useAllStreaks()
  const today = todayISO()

  // Reload streaks when completions change
  useEffect(() => {
    if (!habitsLoading) reloadStreaks()
  }, [habitsLoading])

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'friend'

  const topStreaks = habits
    .map(h => ({ habit: h, streak: streaks[h.id]?.current_streak ?? 0 }))
    .filter(x => x.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3)

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#8B7355] mb-1">
          Good morning, {displayName}! (◕‿◕)
        </h1>
        <p className="text-[#A08B6E]">{formatDate(today)}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Checklist */}
        <div className="md:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-[#8B7355]">
                Today&apos;s Habits ✿
              </h2>
              <Link href="/habits">
                <Button variant="ghost" size="sm">Manage</Button>
              </Link>
            </div>
            <DailyChecklist
              habits={habits}
              loadingHabits={habitsLoading}
              isCompleted={isCompleted}
              onToggle={(habitId) => {
                toggle(habitId)
                setTimeout(reloadStreaks, 500)
              }}
            />
          </Card>
        </div>

        {/* Streak Highlights */}
        {topStreaks.length > 0 && (
          <Card>
            <h2 className="font-serif text-xl font-bold text-[#8B7355] mb-4">
              Hot Streaks v(^_^)v
            </h2>
            <div className="space-y-3">
              {topStreaks.map(({ habit, streak }) => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {habit.emoticon && <span>{habit.emoticon}</span>}
                    <span className="text-sm font-medium text-[#2C2C2C]">{habit.name}</span>
                  </div>
                  <StreakBadge streak={streak} size="sm" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Journal Prompt */}
        <Card>
          <h2 className="font-serif text-xl font-bold text-[#8B7355] mb-2">
            Journal ✧
          </h2>
          <p className="text-sm text-[#8B7A65] mb-4 italic">
            &ldquo;What made today meaningful?&rdquo;
          </p>
          <Link href="/journal/new">
            <Button className="w-full">Write today&apos;s entry</Button>
          </Link>
          <Link href="/journal" className="block mt-2 text-center text-sm text-[#8B7355] hover:underline">
            View all entries →
          </Link>
        </Card>
      </div>
    </div>
  )
}
