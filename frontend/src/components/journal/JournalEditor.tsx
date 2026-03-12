'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { journalApi } from '@/lib/api/journal'
import { AutoSaveIndicator, SaveStatus } from './AutoSaveIndicator'
import { formatDate } from '@/lib/utils/dates'
import type { JournalEntry } from '@/types/journal'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface JournalEditorProps {
  entry?: JournalEntry
  initialDate?: string
  onSaved?: (id: string, updated?: JournalEntry) => void
}

export function JournalEditor({ entry, initialDate, onSaved }: JournalEditorProps) {
  const [title, setTitle] = useState(entry?.title || '')
  const [body, setBody] = useState(entry?.body || '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [entryId, setEntryId] = useState<string | null>(entry?.id || null)
  const [creatingId, setCreatingId] = useState(false)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const date = entry?.entry_date || initialDate || new Date().toISOString().split('T')[0]

  const doSave = useCallback(async (currentTitle: string, currentBody: string, id: string | null) => {
    if (!currentBody.trim() && !currentTitle.trim()) return
    setSaveStatus('saving')
    try {
      if (!id) {
        if (creatingId) return
        setCreatingId(true)
        const created = await journalApi.create({ entry_date: date, title: currentTitle || undefined, body: currentBody })
        setEntryId(created.id)
        setCreatingId(false)
        setSaveStatus('saved')
        onSaved?.(created.id, created)
      } else {
        const updated = await journalApi.update(id, { title: currentTitle || undefined, body: currentBody })
        setSaveStatus('saved')
        onSaved?.(id, updated)
      }
    } catch {
      setSaveStatus('error')
    }
    setTimeout(() => setSaveStatus('idle'), 3000)
  }, [date, creatingId, onSaved])

  const scheduleAutoSave = useCallback((t: string, b: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => doSave(t, b, entryId), 30000)
  }, [doSave, entryId])

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  const handleManualSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    doSave(title, body, entryId)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#F0EDE4]">
        <p className="text-xs font-semibold text-[#B0A898] uppercase tracking-wider">{formatDate(date)}</p>
        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={saveStatus} />
          <button onClick={handleManualSave} className="text-xs font-medium text-[#1E3D2F] hover:underline">Save now</button>
        </div>
      </div>

      <input
        value={title}
        onChange={e => { setTitle(e.target.value); scheduleAutoSave(e.target.value, body) }}
        placeholder="Entry title (optional)"
        className="w-full text-2xl font-semibold text-[#1A1A1A] bg-transparent border-none outline-none placeholder:text-[#D5CEC5]"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}
      />

      <div data-color-mode="light">
        <MDEditor
          value={body}
          onChange={val => { const v = val || ''; setBody(v); scheduleAutoSave(title, v) }}
          preview="edit"
          height={420}
          style={{ background: 'transparent', border: 'none', boxShadow: 'none', fontFamily: '"DM Sans", sans-serif' }}
        />
      </div>
    </div>
  )
}
