'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, Zap } from 'lucide-react'
import { MoodBadge } from './MoodBadge'
import { ThemeChip } from './ThemeChip'
import { analysisApi } from '@/lib/api/analysis'
import type { JournalEntry } from '@/types/journal'

interface AnalysisPanelProps {
  entry: JournalEntry
}

const ENERGY_COLORS: Record<string, string> = {
  High: '#C9A96E',
  Medium: '#7AA88A',
  Low: '#6B7FA3',
}

export function AnalysisPanel({ entry }: AnalysisPanelProps) {
  const [reanalysing, setReanalysing] = useState(false)
  const [queued, setQueued] = useState(false)

  const status = entry.analysis_status

  const handleReanalyse = async () => {
    setReanalysing(true)
    try {
      await analysisApi.reanalyse(entry.id)
      setQueued(true)
    } finally {
      setReanalysing(false)
    }
  }

  if (!status || status === 'pending') {
    return (
      <div className="mt-8 pt-6 border-t border-[#F0EDE4]">
        <div className="flex items-center gap-2 text-[#B0A898]">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-xs">Analysing entry... check back in a moment.</span>
        </div>
      </div>
    )
  }

  if (status === 'skipped' || status === 'failed') {
    return (
      <div className="mt-8 pt-6 border-t border-[#F0EDE4]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#B0A898]">
            {status === 'failed' ? 'Analysis could not be completed.' : 'Entry too short to analyse.'}
          </span>
          {status === 'failed' && (
            <button
              onClick={handleReanalyse}
              disabled={reanalysing || queued}
              className="text-xs text-[#1E3D2F] hover:underline flex items-center gap-1"
            >
              <RefreshCw size={11} className={reanalysing ? 'animate-spin' : ''} />
              {queued ? 'Queued' : 'Retry'}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (status !== 'done' || !entry.primary_sentiment) return null

  const energyColor = ENERGY_COLORS[entry.energy_level ?? ''] ?? '#B0A898'

  return (
    <div className="mt-8 pt-6 border-t border-[#F0EDE4]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-[#C9A96E]" />
          <span className="text-xs font-semibold text-[#7A7169] uppercase tracking-wider">DayBloom AI</span>
        </div>
        <button
          onClick={handleReanalyse}
          disabled={reanalysing || queued}
          className="text-xs text-[#B0A898] hover:text-[#7A7169] flex items-center gap-1 transition-colors"
        >
          <RefreshCw size={10} className={reanalysing ? 'animate-spin' : ''} />
          {queued ? 'Queued' : 'Re-analyse'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        {entry.one_line_summary && (
          <p className="text-sm italic text-[#5A5040] leading-relaxed" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '16px' }}>
            &ldquo;{entry.one_line_summary}&rdquo;
          </p>
        )}

        {/* Sentiment + Energy row */}
        <div className="flex items-center gap-3 flex-wrap">
          <MoodBadge sentiment={entry.primary_sentiment} />
          {entry.energy_level && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: energyColor }}>
              <Zap size={11} fill={energyColor} />
              {entry.energy_level} energy
            </span>
          )}
        </div>

        {/* Themes */}
        {entry.key_themes && entry.key_themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.key_themes.map(t => <ThemeChip key={t} theme={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}
