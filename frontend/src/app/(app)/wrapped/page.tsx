'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWrapped } from '@/hooks/useWrapped'
import { WrappedNav } from '@/components/wrapped/WrappedNav'
import { WordCloud } from '@/components/wrapped/WordCloud'
import { getMoodColor } from '@/types/analysis'
import type { WrappedReport } from '@/types/wrapped'
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip
} from 'recharts'
import { Leaf, ArrowLeft, Share2, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

const TOTAL_SLIDES = 9

export default function WrappedPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#1A3F2F' }}>
        <LoadingDots />
      </div>
    }>
      <WrappedInner />
    </Suspense>
  )
}

function WrappedInner() {
  const searchParams = useSearchParams()
  const period = (searchParams.get('period') as 'week' | 'month') || 'week'
  const startDate = searchParams.get('start') || getDefaultStart(period)

  const { report, loading, error, generate } = useWrapped()
  const [slide, setSlide] = useState(0)
  const [generated, setGenerated] = useState(false)
  const router = useRouter()
  const hasConfetti = useRef(false)

  useEffect(() => {
    if (!generated) {
      generate(period, startDate).then(r => {
        if (r) setGenerated(true)
      })
    }
  }, [period, startDate, generate, generated])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setSlide(s => Math.min(s + 1, TOTAL_SLIDES - 1))
      if (e.key === 'ArrowLeft') setSlide(s => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const goNext = () => setSlide(s => Math.min(s + 1, TOTAL_SLIDES - 1))
  const goPrev = () => setSlide(s => Math.max(s - 1, 0))
  const goToSummary = () => setSlide(TOTAL_SLIDES - 1)

  // Fire confetti on closing slide
  useEffect(() => {
    if (slide === TOTAL_SLIDES - 1 && !hasConfetti.current) {
      hasConfetti.current = true
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#C9A96E', '#2A5940', '#7AA88A', '#8B8BAE', '#F7F5EF'],
      })
    }
  }, [slide])

  if (loading || !report) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#1A3F2F' }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C9A96E] flex items-center justify-center mx-auto">
            <Leaf size={22} className="text-[#1E3D2F]" />
          </div>
          <p className="text-white font-semibold text-lg" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px' }}>
            DayBloom is writing your story
          </p>
          <LoadingDots />
          {error && <p className="text-red-300 text-sm">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#0F1F16' }}>
      {/* Back button */}
      <Link href="/insights" className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs transition-colors">
        <ArrowLeft size={14} />
        Insights
      </Link>

      {/* Slide container */}
      <div className="w-full h-full relative">
        {slide === 0 && <CoverSlide report={report} onBegin={goNext} />}
        {slide === 1 && <DominantMoodSlide report={report} />}
        {slide === 2 && <JourneySlide report={report} />}
        {slide === 3 && <WordCloudSlide report={report} />}
        {slide === 4 && <TopThemesSlide report={report} />}
        {slide === 5 && <CorrelationSlide report={report} />}
        {slide === 6 && <NarrativeSlide report={report} />}
        {slide === 7 && <StatsSlide report={report} />}
        {slide === 8 && <ClosingSlide report={report} />}
      </div>

      {slide > 0 && (
        <WrappedNav
          current={slide}
          total={TOTAL_SLIDES}
          onPrev={goPrev}
          onNext={goNext}
          onSkip={goToSummary}
        />
      )}
    </div>
  )
}  // end WrappedInner

// ─── Slides ──────────────────────────────────────────────────────────────────

function SlideBase({ bg, children, className = '' }: { bg: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center px-8 text-center ${className}`}
      style={{ background: bg, transition: 'background 0.5s ease' }}
    >
      {children}
    </div>
  )
}

function CoverSlide({ report, onBegin }: { report: WrappedReport; onBegin: () => void }) {
  const label = report.period === 'week' ? 'Your Week in Review' : 'Your Month in Review'
  const start = new Date(report.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = new Date(report.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <SlideBase bg="linear-gradient(135deg, #11281E 0%, #1A3F2F 50%, #234B36 100%)">
      <div className="w-14 h-14 rounded-2xl bg-[#C9A96E] flex items-center justify-center mb-8 animate-bounce">
        <Leaf size={26} className="text-[#1E3D2F]" />
      </div>
      <p className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest mb-4">DayBloom</p>
      <h1 className="text-white mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 600, lineHeight: 1.1 }}>
        {label}
      </h1>
      <p className="text-[#7AA88A] text-sm mb-10">{start} – {end}</p>
      <button
        onClick={onBegin}
        className="px-8 py-3 bg-[#C9A96E] text-[#1A1A1A] rounded-full font-semibold text-sm hover:bg-[#DFB97E] transition-colors"
      >
        Begin →
      </button>
    </SlideBase>
  )
}

function DominantMoodSlide({ report }: { report: WrappedReport }) {
  const mood = report.dominant_sentiment ?? 'Varied'
  const color = getMoodColor(mood)
  const n = report.dominant_sentiment_count
  const total = report.total_days_journaled

  return (
    <SlideBase bg={`linear-gradient(135deg, ${color}CC 0%, ${color}99 100%)`}>
      <p className="text-white/60 text-sm uppercase tracking-widest mb-6">Your dominant mood</p>
      <h1
        className="text-white font-bold mb-6"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(52px,10vw,96px)', lineHeight: 1, animationDuration: '0.6s' }}
      >
        {mood}
      </h1>
      <p className="text-white/80 text-base max-w-xs">
        You felt <strong>{mood}</strong> on <strong>{n}</strong> out of <strong>{total}</strong> days you journaled.
      </p>
    </SlideBase>
  )
}

function JourneySlide({ report }: { report: WrappedReport }) {
  const data = report.sentiment_timeline.filter(t => t.sentiment_score !== null).map(t => ({
    date: new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: t.sentiment_score,
    sentiment: t.primary_sentiment,
  }))

  const highest = [...data].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]
  const lowest = [...data].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0]

  return (
    <SlideBase bg="linear-gradient(135deg, #1A3F2F 0%, #234B36 100%)">
      <p className="text-[#7AA88A] text-sm uppercase tracking-widest mb-4">Your emotional arc</p>
      <h2 className="text-white mb-8 text-2xl" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '32px' }}>
        Your {report.period === 'week' ? 'week' : 'month'} as a feeling
      </h2>
      <div className="w-full max-w-lg">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7AA88A' }} />
            <YAxis domain={[-1, 1]} hide />
            <Tooltip
              contentStyle={{ background: '#1E3D2F', border: '1px solid #2A5940', borderRadius: 10, fontSize: 11 }}
              formatter={(v) => [typeof v === 'number' ? v.toFixed(2) : v, 'sentiment']}
              labelStyle={{ color: '#A8C4B0' }}
            />
            <Line type="monotone" dataKey="score" stroke="#C9A96E" strokeWidth={3} dot={{ fill: '#C9A96E', r: 4 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {highest && lowest && (
        <div className="flex gap-8 mt-6 text-xs text-white/60">
          <span>✨ Best day: <strong className="text-white">{highest.date}</strong></span>
          <span>💙 Hardest: <strong className="text-white">{lowest.date}</strong></span>
        </div>
      )}
    </SlideBase>
  )
}

function WordCloudSlide({ report }: { report: WrappedReport }) {
  return (
    <SlideBase bg="#0F1A13">
      <p className="text-[#7AA88A] text-sm uppercase tracking-widest mb-4">The words of your {report.period}</p>
      <div className="w-full max-w-2xl flex-1 flex items-center justify-center">
        <WordCloud words={report.word_cloud_words} />
      </div>
    </SlideBase>
  )
}

function TopThemesSlide({ report }: { report: WrappedReport }) {
  const colors = ['#C9A96E', '#7AA88A', '#8B8BAE']
  const themes = report.top_themes.slice(0, 3)

  return (
    <SlideBase bg="linear-gradient(135deg, #1E3D2F 0%, #2A5940 100%)">
      <p className="text-[#C9A96E] text-sm uppercase tracking-widest mb-8">Your top themes</p>
      <div className="space-y-4 w-full max-w-sm">
        {themes.map((t, i) => (
          <div
            key={t.theme}
            className="bg-white/10 rounded-2xl p-4 flex items-center gap-4 text-left"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#1A1A1A]" style={{ backgroundColor: colors[i] }}>
              {i + 1}
            </div>
            <div>
              <p className="text-white font-semibold">{t.theme}</p>
              <p className="text-white/50 text-xs">{t.count} {t.count === 1 ? 'entry' : 'entries'}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideBase>
  )
}

function CorrelationSlide({ report }: { report: WrappedReport }) {
  const correlations = report.habit_correlations.filter(c => Math.abs(c.correlation_delta) > 0.05)

  if (!correlations.length) {
    return (
      <SlideBase bg="linear-gradient(135deg, #1A3F2F 0%, #234B36 100%)">
        <p className="text-[#7AA88A] text-sm uppercase tracking-widest mb-6">Habit × Mood</p>
        <p className="text-white/60 text-sm max-w-xs">Not enough data yet to show habit-mood correlations. Keep journaling!</p>
      </SlideBase>
    )
  }

  return (
    <SlideBase bg="linear-gradient(135deg, #1A3F2F 0%, #234B36 100%)">
      <p className="text-[#7AA88A] text-sm uppercase tracking-widest mb-8">Habit × Mood</p>
      <div className="space-y-6 w-full max-w-sm">
        {correlations.slice(0, 2).map(c => {
          const delta = c.correlation_delta
          const pctCompleted = Math.max(0, Math.min(100, ((c.avg_sentiment_completed + 1) / 2) * 100))
          const pctSkipped = Math.max(0, Math.min(100, ((c.avg_sentiment_skipped + 1) / 2) * 100))
          const isPositive = delta > 0

          return (
            <div key={c.habit_name} className="bg-white/10 rounded-2xl p-4">
              <p className="text-white font-semibold mb-1">{c.habit_name}</p>
              <p className="text-[#7AA88A] text-xs mb-3">
                {isPositive ? `+${(delta * 100).toFixed(0)}% mood when completed` : `${(delta * 100).toFixed(0)}% mood impact`}
              </p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1"><span>✓ Completed</span><span>{c.avg_sentiment_completed.toFixed(2)}</span></div>
                  <div className="h-2 bg-white/10 rounded-full"><div className="h-full bg-[#2A5940] rounded-full" style={{ width: `${pctCompleted}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1"><span>✗ Skipped</span><span>{c.avg_sentiment_skipped.toFixed(2)}</span></div>
                  <div className="h-2 bg-white/10 rounded-full"><div className="h-full bg-[#C0674E] rounded-full" style={{ width: `${pctSkipped}%` }} /></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </SlideBase>
  )
}

function NarrativeSlide({ report }: { report: WrappedReport }) {
  return (
    <SlideBase bg="linear-gradient(135deg, #0D1F15 0%, #152E1E 100%)">
      <Sparkles size={20} className="text-[#C9A96E] mb-6" />
      <blockquote
        className="text-white leading-relaxed max-w-lg"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(18px,2.5vw,24px)', fontStyle: 'italic', lineHeight: 1.7 }}
      >
        &ldquo;{report.narrative}&rdquo;
      </blockquote>
      <p className="text-white/30 text-xs mt-8">Generated by DayBloom AI</p>
    </SlideBase>
  )
}

function StatsSlide({ report }: { report: WrappedReport }) {
  const s = report.stats
  const energyEmoji = { High: '⚡', Medium: '🌿', Low: '🌙' }[s.avg_energy] ?? '·'

  return (
    <SlideBase bg="linear-gradient(135deg, #1A3F2F 0%, #2A5940 100%)">
      <p className="text-[#C9A96E] text-sm uppercase tracking-widest mb-8">Your {report.period} in numbers</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <StatBox label="Entries written" value={s.entries_written} />
        <StatBox label="Positive days" value={s.positive_days} />
        {s.top_habit_name && <StatBox label={`${s.top_habit_name}`} value={`${s.top_habit_streak} day streak`} small />}
        <StatBox label="Avg energy" value={`${energyEmoji} ${s.avg_energy}`} />
      </div>
    </SlideBase>
  )
}

function ClosingSlide({ report }: { report: WrappedReport }) {
  const handleShare = async () => {
    const text = `My DayBloom ${report.period} in review: ${report.dominant_sentiment ?? 'mixed'} mood, ${report.total_days_journaled} days journaled. "${report.narrative.slice(0, 100)}..."`
    if (navigator.share) {
      await navigator.share({ title: 'DayBloom Wrapped', text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <SlideBase bg="linear-gradient(135deg, #11281E 0%, #1A3F2F 50%, #234B36 100%)">
      <div className="w-12 h-12 rounded-xl bg-[#C9A96E] flex items-center justify-center mb-6">
        <Leaf size={22} className="text-[#1E3D2F]" />
      </div>
      <h2 className="text-white text-3xl mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '36px' }}>
        Keep going.
      </h2>
      <p className="text-[#7AA88A] text-base mb-10">Every day is a data point.</p>

      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Share2 size={14} />
          Share
        </button>
        <Link href="/dashboard">
          <button className="px-5 py-2.5 bg-[#C9A96E] hover:bg-[#DFB97E] text-[#1A1A1A] rounded-xl text-sm font-semibold transition-colors">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </SlideBase>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatBox({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="bg-white/10 rounded-2xl p-4 text-center">
      <p className={`text-white font-bold mb-1 ${small ? 'text-lg' : 'text-3xl'}`} style={!small ? { fontFamily: '"Cormorant Garamond", serif' } : {}}>
        {value}
      </p>
      <p className="text-white/50 text-xs leading-snug">{label}</p>
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-[#C9A96E] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function getDefaultStart(period: 'week' | 'month'): string {
  const d = new Date()
  if (period === 'week') {
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
  } else {
    d.setDate(1)
  }
  return d.toISOString().split('T')[0]
}
