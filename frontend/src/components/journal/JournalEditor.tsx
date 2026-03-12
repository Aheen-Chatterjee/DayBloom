'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { journalApi } from '@/lib/api/journal'
import { AutoSaveIndicator, SaveStatus } from './AutoSaveIndicator'
import { Input } from '@/components/ui/Input'
import type { JournalEntry } from '@/types/journal'
import { formatDate } from '@/lib/utils/dates'

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
        // Need to create first
        if (creatingId) return
        setCreatingId(true)
        const created = await journalApi.create({
          entry_date: date,
          title: currentTitle || undefined,
          body: currentBody,
        })
        setEntryId(created.id)
        setCreatingId(false)
        setSaveStatus('saved')
        onSaved?.(created.id, created)
      } else {
        const updated = await journalApi.update(id, {
          title: currentTitle || undefined,
          body: currentBody,
        })
        setSaveStatus('saved')
        onSaved?.(id, updated)
      }
    } catch {
      setSaveStatus('error')
    }
    setTimeout(() => setSaveStatus('idle'), 3000)
  }, [date, creatingId, onSaved])

  // Debounced auto-save
  const scheduleAutoSave = useCallback((newTitle: string, newBody: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus('idle')
    saveTimer.current = setTimeout(() => {
      doSave(newTitle, newBody, entryId)
    }, 30000)
  }, [doSave, entryId])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    scheduleAutoSave(e.target.value, body)
  }

  const handleBodyChange = (value: string | undefined) => {
    const val = value || ''
    setBody(val)
    scheduleAutoSave(title, val)
  }

  const handleManualSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    doSave(title, body, entryId)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#A08B6E]">{formatDate(date)}</p>
        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={saveStatus} />
          <button
            onClick={handleManualSave}
            className="text-sm text-[#8B7355] hover:underline font-medium"
          >
            Save now
          </button>
        </div>
      </div>

      {/* Title */}
      <Input
        value={title}
        onChange={handleTitleChange}
        placeholder="Entry title (optional)"
        className="text-lg font-serif font-bold border-0 border-b border-[#D4C5A9] rounded-none px-0 bg-transparent focus:ring-0 focus:border-[#8B7355]"
      />

      {/* Body */}
      <div data-color-mode="light">
        <MDEditor
          value={body}
          onChange={handleBodyChange}
          preview="edit"
          height={400}
          style={{
            backgroundColor: '#FAF7F2',
            border: '1px solid #D4C5A9',
            borderRadius: 12,
          }}
        />
      </div>
    </div>
  )
}
