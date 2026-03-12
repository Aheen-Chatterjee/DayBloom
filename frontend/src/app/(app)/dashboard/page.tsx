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
import { PenLine, Flame, ArrowRight, BookOpen } from 'lucide-react'

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
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#B0A898] uppercase tracking-widest mb-2">
            {formatDate(today)}
          </p>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '32px', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.1 }}>
            {greeting}, {displayName} 🌿
          </h1>
          {totalCount > 0 && (
            <p className="text-base text-[#7A7169] mt-2 font-medium">
              You have {totalCount} {totalCount === 1 ? 'habit' : 'habits'} to bloom today.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">

          {/* Checklist — takes 7/12 columns */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2DBD0] p-6 lg:p-7" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '20px', fontWeight: 600, color: '#1A1A1A' }}>
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
              streaks={streaks}
            />
            {/* Quick-add habit button */}
            <div className="mt-5 pt-4 border-t border-[#E2DBD0]">
              <Link href="/habits?new=true" className="w-full">
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border border-dashed border-[#C0B8B0] text-[#7A7169] hover:bg-[#F7F5F2] hover:border-[#C9A96E] hover:text-[#4E7D5E]"
                >
                  + Add habit
                </button>
              </Link>
            </div>
          </div>

          {/* Journal & Insights Sidebar — takes 4/12 columns */}
          <div className="lg:col-span-4 space-y-6">
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: '#F9FAF8',
                borderColor: '#E2DBD0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                borderRadius: '16px'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-[#7AA88A]" />
                <span className="text-sm font-semibold text-[#1E3D2F] uppercase tracking-wider">Journal</span>
              </div>
              <p className="text-[15px] text-[#4E7D5E] font-medium mb-6 leading-relaxed">
                {prompt}
              </p>
              <Link href="/journal/new">
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border border-[#2A5940]"
                  style={{ background: '#1E3D2F', color: '#FFFFFF' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2A5940')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#1E3D2F')}
                >
                  Write entry
                </button>
              </Link>
              <Link href="/journal">
                <p className="text-center text-xs font-semibold text-[#7AA88A] hover:text-[#4E7D5E] transition-colors mt-4">
                  View all entries &rarr;
                </p>
              </Link>
            </div>

            {/* Streaks */}
            {topStreaks.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2DBD0] p-6 lg:p-7" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
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
