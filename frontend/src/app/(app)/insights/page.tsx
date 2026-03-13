'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInsights } from '@/hooks/useInsights'
import { MoodTimeline } from '@/components/insights/MoodTimeline'
import { SentimentDonut } from '@/components/insights/SentimentDonut'
import { ThemeBarChart } from '@/components/insights/ThemeBarChart'
import { EnergyChart } from '@/components/insights/EnergyChart'
import { MoodHeatmapStrip } from '@/components/insights/MoodHeatmapStrip'
import { MoodBadge } from '@/components/journal/MoodBadge'
import { Spinner } from '@/components/ui/Spinner'
import { Sparkles, TrendingUp, Calendar, Gift } from 'lucide-react'

const PERIOD_OPTIONS = [7, 14, 30] as const

export default function InsightsPage() {
  const [days, setDays] = useState<number>(14)
  const { summary, correlations, loading, error } = useInsights(days)

  const getWeekStart = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  }

  const getMonthStart = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F5EF' }}>
        <div className="text-center space-y-3">
          <Spinner />
          <p className="text-sm text-[#7A7169]">Loading your emotional insights...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-10" style={{ background: '#F7F5EF' }}>
        <p className="text-sm text-[#B5534D]">Failed to load insights: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#F7F5EF' }}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-[#B0A898] uppercase tracking-widest mb-2">Your inner life, visualised</p>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.1 }}>
              Insights
            </h1>
            {summary?.dominant_sentiment && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-[#7A7169]">Dominant mood:</span>
                <MoodBadge sentiment={summary.dominant_sentiment} />
              </div>
            )}
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-white border border-[#E2DBD0] rounded-xl p-1">
            {PERIOD_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  days === d
                    ? 'bg-[#1E3D2F] text-white'
                    : 'text-[#7A7169] hover:bg-[#F7F5EF]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Entries analysed" value={summary.entries_analysed} icon={<Sparkles size={14} />} />
            <StatCard label="Avg sentiment" value={summary.avg_sentiment_score > 0 ? `+${summary.avg_sentiment_score.toFixed(2)}` : summary.avg_sentiment_score.toFixed(2)} icon={<TrendingUp size={14} />} />
            <StatCard label="Top theme" value={summary.top_themes[0]?.theme ?? '—'} icon={<Calendar size={14} />} small />
            <StatCard label="Dominant energy" value={Object.entries(summary.energy_distribution).sort(([,a],[,b])=>b-a)[0]?.[0] ?? '—'} icon={<Sparkles size={14} />} />
          </div>
        )}

        {/* Wrapped CTA */}
        <div className="bg-gradient-to-r from-[#1E3D2F] to-[#2A5940] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[#C9A96E] text-xs font-semibold uppercase tracking-wider mb-1">New</p>
            <h3 className="text-white font-semibold text-lg" style={{ fontFamily: '"Cormorant Garamond", serif' }}>DayBloom Wrapped</h3>
            <p className="text-[#A8C4B0] text-sm mt-0.5">Your emotional journey, beautifully summarised.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/wrapped?period=week&start=${getWeekStart()}`}>
              <button className="px-4 py-2 bg-[#C9A96E] text-[#1A1A1A] rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-[#DFB97E] transition-colors whitespace-nowrap">
                <Gift size={13} />
                This week
              </button>
            </Link>
            <Link href={`/wrapped?period=month&start=${getMonthStart()}`}>
              <button className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-white/20 transition-colors whitespace-nowrap">
                <Gift size={13} />
                This month
              </button>
            </Link>
          </div>
        </div>

        {/* Mood Heatmap Strip */}
        <Card title="Mood Calendar" subtitle={`Last ${days} days`}>
          {summary?.mood_timeline ? (
            <MoodHeatmapStrip timeline={summary.mood_timeline} days={days} />
          ) : (
            <EmptyMsg />
          )}
        </Card>

        {/* Mood Timeline Chart */}
        <Card title="Sentiment Over Time" subtitle="How your emotional score shifted">
          {summary?.mood_timeline?.length ? (
            <MoodTimeline data={summary.mood_timeline} />
          ) : (
            <EmptyMsg />
          )}
        </Card>

        {/* 2-col: Sentiment breakdown + Energy trend */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Mood Breakdown" subtitle="Distribution of sentiments">
            {summary?.sentiment_distribution && Object.keys(summary.sentiment_distribution).length ? (
              <SentimentDonut distribution={summary.sentiment_distribution} />
            ) : (
              <EmptyMsg />
            )}
          </Card>

          <Card title="Energy Rhythm" subtitle="Your energy across entries">
            {summary?.mood_timeline?.length ? (
              <EnergyChart timeline={summary.mood_timeline} />
            ) : (
              <EmptyMsg />
            )}
          </Card>
        </div>

        {/* Theme Frequency */}
        <Card title="Theme Frequency" subtitle="What you've been writing about">
          {summary?.top_themes?.length ? (
            <ThemeBarChart themes={summary.top_themes} />
          ) : (
            <EmptyMsg />
          )}
        </Card>

        {/* Habit × Mood Correlations */}
        {correlations.length > 0 && (
          <Card title="Habit × Mood Correlations" subtitle="How your habits affect your emotional state">
            <div className="space-y-4">
              {correlations.slice(0, 5).map(c => (
                <div key={c.habit_id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1A1A1A]">{c.habit_name}</span>
                    <span className={`text-xs font-semibold ${c.correlation_delta > 0 ? 'text-[#2A5940]' : 'text-[#C0674E]'}`}>
                      {c.correlation_delta > 0 ? '+' : ''}{(c.correlation_delta * 100).toFixed(0)}% mood
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <CorrelationBar label="Completed" score={c.avg_sentiment_completed} color="#2A5940" />
                    <CorrelationBar label="Skipped" score={c.avg_sentiment_skipped} color="#C0674E" />
                  </div>
                  <p className="text-xs text-[#B0A898]">{c.completed_count} completed · {c.skipped_count} skipped</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2DBD0] p-6" style={{ boxShadow: '0 1px 4px rgba(30,61,47,0.04)' }}>
      <div className="mb-5">
        <h2 className="font-semibold text-[#1A1A1A]" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '20px' }}>{title}</h2>
        <p className="text-xs text-[#B0A898] mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function StatCard({ label, value, icon, small }: { label: string; value: string | number; icon: React.ReactNode; small?: boolean }) {
  return (
    <div className="bg-white border border-[#E2DBD0] rounded-2xl p-4" style={{ boxShadow: '0 1px 4px rgba(30,61,47,0.04)' }}>
      <div className="flex items-center gap-1.5 text-[#B0A898] mb-2">{icon}<span className="text-xs">{label}</span></div>
      <p className={`font-bold text-[#1A1A1A] truncate ${small ? 'text-sm' : 'text-2xl'}`} style={!small ? { fontFamily: '"Cormorant Garamond", serif' } : {}}>{value}</p>
    </div>
  )
}

function CorrelationBar({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = Math.max(0, Math.min(100, ((score + 1) / 2) * 100))
  return (
    <div>
      <p className="text-xs text-[#7A7169] mb-1">{label}</p>
      <div className="h-2 bg-[#F0EDE4] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function EmptyMsg() {
  return <p className="text-sm text-[#B0A898] py-4 text-center">Journal and save entries to see insights here.</p>
}
