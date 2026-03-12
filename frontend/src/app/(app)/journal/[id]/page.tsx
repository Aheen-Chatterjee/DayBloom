'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useJournalEntry } from '@/hooks/useJournal'
import { journalApi } from '@/lib/api/journal'
import { useToast } from '@/context/ToastContext'
import { JournalEditor } from '@/components/journal/JournalEditor'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'

export default function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { entry, setEntry, loading } = useJournalEntry(id)
  const { showToast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this journal entry?')) return
    await journalApi.delete(id)
    showToast('Entry deleted')
    router.replace('/journal')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="p-8 text-center text-[#8B7A65]">Entry not found.</div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#8B7355] hover:underline"
        >
          ← Back to journal
        </button>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      </div>
      <JournalEditor
        entry={entry}
        onSaved={(_, updated) => updated && setEntry(updated)}
      />
    </div>
  )
}
