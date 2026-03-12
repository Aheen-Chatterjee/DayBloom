'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useJournalEntry } from '@/hooks/useJournal'
import { journalApi } from '@/lib/api/journal'
import { useToast } from '@/context/ToastContext'
import { JournalEditor } from '@/components/journal/JournalEditor'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Trash2 } from 'lucide-react'

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

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!entry) return <div className="p-8 text-center text-[#7A7169] text-sm">Entry not found.</div>

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#F7F5EF' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#7A7169] hover:text-[#1A1A1A] transition-colors">
            <ArrowLeft size={14} />
            Journal
          </button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-[#B5534D] hover:bg-[#B5534D0D] gap-1.5">
            <Trash2 size={13} />
            Delete
          </Button>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2DBD0] p-8" style={{ boxShadow: '0 1px 4px rgba(30,61,47,0.06)' }}>
          <JournalEditor entry={entry} onSaved={(_, updated) => updated && setEntry(updated)} />
        </div>
      </div>
    </div>
  )
}
