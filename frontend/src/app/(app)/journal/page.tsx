'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useJournalList } from '@/hooks/useJournal'
import { journalApi } from '@/lib/api/journal'
import { useToast } from '@/context/ToastContext'
import { JournalCard } from '@/components/journal/JournalCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'

export default function JournalPage() {
  const { data, loading, load } = useJournalList()
  const { showToast } = useToast()

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#8B7355]">Journal ✧</h1>
          <p className="text-[#A08B6E] mt-1">{data?.total ?? 0} entries</p>
        </div>
        <Link href="/journal/new">
          <Button>New Entry</Button>
        </Link>
      </div>

      {!data?.items.length ? (
        <EmptyState
          icon="✧"
          title="Your journal awaits"
          description="Write your first entry to start capturing your thoughts and reflections"
          action={
            <Link href="/journal/new">
              <Button>Write first entry</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.items.map(entry => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
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
  )
}
