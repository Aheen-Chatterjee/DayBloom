'use client'

import { useRouter } from 'next/navigation'
import { JournalEditor } from '@/components/journal/JournalEditor'
import { todayISO } from '@/lib/utils/dates'

export default function NewJournalPage() {
  const router = useRouter()

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#8B7355] hover:underline"
        >
          ← Back to journal
        </button>
      </div>
      <JournalEditor
        initialDate={todayISO()}
        onSaved={(id) => router.replace(`/journal/${id}`)}
      />
    </div>
  )
}
