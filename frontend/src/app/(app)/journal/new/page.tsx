'use client'

import { useRouter } from 'next/navigation'
import { JournalEditor } from '@/components/journal/JournalEditor'
import { todayISO } from '@/lib/utils/dates'
import { ArrowLeft } from 'lucide-react'

export default function NewJournalPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#F7F5EF' }}>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#7A7169] hover:text-[#1A1A1A] transition-colors mb-8">
          <ArrowLeft size={14} />
          Journal
        </button>
        <div className="bg-white rounded-2xl border border-[#E2DBD0] p-8" style={{ boxShadow: '0 1px 4px rgba(30,61,47,0.06)' }}>
          <JournalEditor
            initialDate={todayISO()}
            onSaved={(id) => router.replace(`/journal/${id}`)}
          />
        </div>
      </div>
    </div>
  )
}
