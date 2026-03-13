import Link from 'next/link'
import { JournalEntry } from '@/types/journal'
import { formatRelative, formatDate } from '@/lib/utils/dates'
import { MoodBadge } from './MoodBadge'
import { ThemeChip } from './ThemeChip'

interface JournalCardProps {
  entry: JournalEntry
}

export function JournalCard({ entry }: JournalCardProps) {
  const preview = entry.body.replace(/[#*`_\[\]]/g, '').slice(0, 140)
  const wordCount = entry.body.split(/\s+/).filter(Boolean).length
  const hasAnalysis = entry.analysis_status === 'done' && entry.primary_sentiment
  const themes = entry.key_themes?.slice(0, 3) ?? []

  return (
    <Link href={`/journal/${entry.id}`}>
      <article className="group bg-white border border-[#E2DBD0] rounded-2xl p-5 hover:border-[#C9A96E60] hover:shadow-md transition-all duration-200 shadow-[0_1px_4px_rgba(30,61,47,0.04)]">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3
            className="font-semibold text-[#1A1A1A] group-hover:text-[#1E3D2F] transition-colors line-clamp-1 flex-1"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: 600 }}
          >
            {entry.title || formatDate(entry.entry_date)}
          </h3>
          <span className="text-xs text-[#B0A898] flex-shrink-0 mt-1">{formatRelative(entry.entry_date)}</span>
        </div>

        {entry.title && (
          <p className="text-xs text-[#B0A898] mb-2">{formatDate(entry.entry_date)}</p>
        )}

        {/* AI one-line summary */}
        {hasAnalysis && entry.one_line_summary && (
          <p className="text-xs italic text-[#8A7A6A] mb-2 leading-relaxed">{entry.one_line_summary}</p>
        )}

        {!entry.one_line_summary && preview && (
          <p className="text-sm text-[#7A7169] line-clamp-2 leading-relaxed">{preview}{preview.length >= 140 ? '...' : ''}</p>
        )}

        {/* Mood badge + themes */}
        {hasAnalysis && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MoodBadge sentiment={entry.primary_sentiment} size="sm" />
            {themes.map(t => <ThemeChip key={t} theme={t} />)}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-[#C0B8B0]">{wordCount} words</span>
          <span className="w-1 h-1 rounded-full bg-[#E2DBD0]" />
          <span className="text-xs text-[#C0B8B0]">{new Date(entry.entry_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          {entry.analysis_status === 'pending' && (
            <>
              <span className="w-1 h-1 rounded-full bg-[#E2DBD0]" />
              <span className="text-xs text-[#C9A96E]">analysing…</span>
            </>
          )}
        </div>
      </article>
    </Link>
  )
}
