import Link from 'next/link'
import { JournalEntry } from '@/types/journal'
import { formatRelative, formatDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

interface JournalCardProps {
  entry: JournalEntry
}

export function JournalCard({ entry }: JournalCardProps) {
  const preview = entry.body.replace(/[#*`_]/g, '').slice(0, 120)

  return (
    <Link href={`/journal/${entry.id}`}>
      <div className={cn(
        'bg-[#FAF7F2] border border-[#D4C5A9] rounded-xl p-5',
        'hover:shadow-md hover:border-[#8B7355] transition-all cursor-pointer group'
      )}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif font-bold text-[#8B7355] group-hover:text-[#6D5A40] line-clamp-1">
            {entry.title || formatDate(entry.entry_date)}
          </h3>
          <span className="text-xs text-[#A08B6E] flex-shrink-0 mt-1">
            {formatRelative(entry.entry_date)}
          </span>
        </div>
        {entry.title && (
          <p className="text-xs text-[#A08B6E] mb-2">{formatDate(entry.entry_date)}</p>
        )}
        {preview && (
          <p className="text-sm text-[#6B5B45] line-clamp-2 leading-relaxed">{preview}...</p>
        )}
      </div>
    </Link>
  )
}
