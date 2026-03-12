'use client'

import Link from 'next/link'
import { useJournalList } from '@/hooks/useJournal'
import { JournalCard } from '@/components/journal/JournalCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Plus, BookOpen } from 'lucide-react'

export default function JournalPage() {
  const { data, loading, load } = useJournalList()

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner /></div>
  }

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#F7F5EF' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-[#B0A898] uppercase tracking-widest mb-2">Reflections</p>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.1 }}>
              Journal
            </h1>
            <p className="text-sm text-[#7A7169] mt-1">{data?.total ?? 0} entries written</p>
          </div>
          <Link href="/journal/new">
            <Button className="gap-1.5">
              <Plus size={14} />
              New entry
            </Button>
          </Link>
        </div>

        {!data?.items.length ? (
          <EmptyState
            icon={<BookOpen size={40} />}
            title="Your journal awaits"
            description="Start writing to capture your thoughts, reflections, and daily observations."
            action={
              <Link href="/journal/new">
                <Button className="gap-1.5"><Plus size={14} />Write first entry</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {data.items.map(entry => <JournalCard key={entry.id} entry={entry} />)}
            {data.has_next && (
              <div className="text-center pt-4">
                <Button variant="secondary" onClick={() => load(Math.ceil(data.items.length / 20) + 1)}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
