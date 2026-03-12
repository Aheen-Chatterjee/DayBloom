'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useHabits } from '@/hooks/useHabits'
import { useCompletions } from '@/hooks/useCompletions'
import { useAllStreaks } from '@/hooks/useStreaks'
import { useAuth } from '@/context/AuthContext'
import { DailyChecklist } from '@/components/checklist/DailyChecklist'
import { StreakBadge } from '@/components/streaks/StreakBadge'
import { Button } from '@/components/ui/Button'
import { formatDate, todayISO } from '@/lib/utils/dates'
import { PenLine, Flame, ArrowRight } from 'lucide-react'

const JOURNAL_PROMPTS = [
  'What made today meaningful?',
  'What is one thing you are grateful for right now?',
  'What challenged you today, and how did you respond?',
  'What would make tomorrow better than today?',
  'What are you learning about yourself lately?',
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { habits, loading: habitsLoading } = useHabits()
  const { isCompleted, toggle } = useCompletions(todayISO())
  const { streaks, reload: reloadStreaks } = useAllStreaks()
  const today = todayISO()

  useEffect(() => {
    if (!habitsLoading) reloadStreaks()
  }, [habitsLoading])

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const topStreaks = habits
    .map(h => ({ habit: h, streak: streaks[h.id]?.current_streak ?? 0 }))
    .filter(x => x.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 4)

  const prompt = JOURNAL_PROMPTS[new Date().getDay() % JOURNAL_PROMPTS.length]

  const completedCount = habits.filter(h => isCompleted(h.id)).length
  const totalCount = habits.length

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#F7F5EF' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#B0A898] uppercase tracking-widest mb-2">
            {formatDate(today)}
          </p>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.1 }}>
            {greeting}, {displayName}
          </h1>
          {totalCount > 0 && (
            <p className="text-sm text-[#7A7169] mt-2">
              {completedCount === totalCount && totalCount > 0
                ? "You've completed all your habits today — well done."
                : `${completedCount} of ${totalCount} habits done today.`}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-5 gap-5">

          {/* Checklist — takes 3/5 columns */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-[#E2DBD0] p-6" style={{ boxShadow: '0 1px 4px rgba(30,61,47,0.06)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', fontWeight: 600, color: '#1A1A1A' }}>
                Today&rsquo;s Habits
              </h2>
              <Link href="/habits">
                <Button variant="ghost" size="sm" className="text-[#7A7169]">
                  Manage <ArrowRight size={12} className="ml-1" />
                </Button>
              </Link>
            </div>
            <DailyChecklist
              habits={habits}
              loadingHabits={habitsLoading}
              isCompleted={isCompleted}
              onToggle={(id) => { toggle(id); setTimeout(reloadStreaks, 600) }}
            />
          </div>

          {/* Right column */}
          <div className="md:col-span-2 space-y-5">

            {/* Journal card */}
            <div
              className="rounded-2xl p-5 border"
              style={{
                background: 'linear-gradient(135deg, #1E3D2F 0%, #2A5940 100%)',
                borderColor: '#142B21',
                boxShadow: '0 4px 16px rgba(30,61,47,0.20)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <PenLine size={15} className="text-[#C9A96E]" />
                <span className="text-xs font-semibold text-[#7AA88A] uppercase tracking-wider">Journal</span>
              </div>
              <p className="text-sm text-white/80 italic mb-4 leading-relaxed">
                &ldquo;{prompt}&rdquo;
              </p>
              <Link href="/journal/new">
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                  style={{ background: '#C9A96E', color: '#1A1A1A' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#DEC08C')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#C9A96E')}
                >
                  Write today&rsquo;s entry
                </button>
              </Link>
              <Link href="/journal">
                <p className="text-center text-xs text-[#7AA88A] hover:text-white transition-colors mt-3">
                  View all entries &rarr;
                </p>
              </Link>
            </div>

            {/* Streaks */}
            {topStreaks.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2DBD0] p-5" style={{ boxShadow: '0 1px 4px rgba(30,61,47,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Flame size={14} className="text-[#C9A96E]" />
                  <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: 600, color: '#1A1A1A' }}>
                    Streaks
                  </h2>
                </div>
                <div className="space-y-2.5">
                  {topStreaks.map(({ habit, streak }) => (
                    <div key={habit.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {habit.emoticon && <span className="text-sm flex-shrink-0">{habit.emoticon}</span>}
                        <span className="text-sm text-[#1A1A1A] truncate">{habit.name}</span>
                      </div>
                      <StreakBadge streak={streak} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
