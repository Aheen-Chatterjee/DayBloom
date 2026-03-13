'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Upload, X, CheckCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Modal } from '@/components/ui/Modal'
import { useProofSubmission } from '@/hooks/useProofSubmission'
import type { Habit } from '@/types/habits'
import type { Completion } from '@/types/completions'
import { cn } from '@/lib/utils/cn'

interface ProofUploadModalProps {
  habit: Habit
  onClose: () => void
  onSuccess: (completion: Completion) => void
}

export function ProofUploadModal({ habit, onClose, onSuccess }: ProofUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const confettiFiredRef = useRef(false)

  const handleSuccess = useCallback((completion: Completion) => {
    onSuccess(completion)
  }, [onSuccess])

  const { state, verdict, submit, reset } = useProofSubmission(handleSuccess)

  const locked = state === 'uploading' || state === 'verifying'

  // Fire confetti and auto-close when approved
  useEffect(() => {
    if (state === 'approved' && !confettiFiredRef.current) {
      confettiFiredRef.current = true
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5, x: 0.5 },
        colors: ['#4E7D5E', '#C9A96E', '#7AA88A', '#1E3D2F'],
        disableForReducedMotion: true,
      })
      const timer = setTimeout(onClose, 1800)
      return () => clearTimeout(timer)
    }
  }, [state, onClose])

  // Revoke object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleTryAgain = () => {
    setSelectedFile(null)
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
    confettiFiredRef.current = false
    reset()
  }

  // ─── APPROVED ────────────────────────────────────────────────
  if (state === 'approved') {
    return (
      <Modal open onClose={onClose}>
        <div
          className="flex flex-col items-center gap-4 text-center"
          style={{ background: '#1E3D2F', margin: '-24px', borderRadius: '16px', padding: '48px 24px' }}
        >
          <div className="text-5xl">{habit.emoticon || '✅'}</div>
          <CheckCircle size={40} className="text-white" />
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', fontWeight: 600, color: '#FFFFFF' }}>
            Verified.
          </p>
          {verdict && (
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '17px', fontStyle: 'italic', color: '#A8C4B0', lineHeight: 1.5 }}>
              &ldquo;{verdict}&rdquo;
            </p>
          )}
        </div>
      </Modal>
    )
  }

  // ─── REJECTED ────────────────────────────────────────────────
  if (state === 'rejected') {
    return (
      <Modal open onClose={onClose}>
        <div
          className="relative flex flex-col items-center gap-5 text-center"
          style={{
            background: 'linear-gradient(135deg, #0D0404 0%, #1A0606 50%, #0D0404 100%)',
            border: '1px solid #6B1A1A',
            margin: '-24px',
            borderRadius: '16px',
            padding: '40px 24px',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'rgba(245,208,208,0.6)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F5D0D0')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,208,208,0.6)')}
          >
            <X size={16} />
          </button>
          <div className="text-5xl">❌</div>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '26px', fontWeight: 700, color: '#F5D0D0' }}>
            Rejected.
          </p>
          {verdict && (
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '17px', fontStyle: 'italic', color: '#F5D0D0', lineHeight: 1.6 }}>
              &ldquo;{verdict}&rdquo;
            </p>
          )}
          <button
            onClick={handleTryAgain}
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ background: '#6B1A1A', color: '#F5D0D0', border: '1px solid #8B2A2A' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#8B2A2A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#6B1A1A')}
          >
            Try Again
          </button>
        </div>
      </Modal>
    )
  }

  // ─── UPLOADING / VERIFYING ───────────────────────────────────
  if (state === 'uploading' || state === 'verifying') {
    return (
      <Modal open onClose={() => {}}>
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#E2DBD0]" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1E3D2F] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              {habit.emoticon || '📸'}
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-[#1A1A1A]">
              {state === 'uploading' ? 'Uploading your proof...' : 'Analysing your proof...'}
            </p>
            <p className="text-sm text-[#7A7169] mt-1">
              {state === 'verifying' ? 'The AI is judging you right now.' : 'Hold tight.'}
            </p>
          </div>
        </div>
      </Modal>
    )
  }

  // ─── IDLE ────────────────────────────────────────────────────
  return (
    <Modal open onClose={locked ? () => {} : onClose} title={`Prove it: ${habit.name}`}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-[#7A7169]">
          No more free checkboxes. Upload a photo proving you actually did this.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200',
            'flex flex-col items-center justify-center gap-3',
            dragOver
              ? 'border-[#C9A96E] bg-[#FFF9F0]'
              : 'border-[#E2DBD0] hover:border-[#C9A96E] hover:bg-[#FDFCF9]',
            previewUrl ? 'p-2 min-h-[200px]' : 'p-10',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Proof preview"
              className="max-h-48 max-w-full rounded-lg object-contain"
            />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[#F0EDE4] flex items-center justify-center">
                <Upload size={20} className="text-[#7A7169]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#1A1A1A]">Drop photo here</p>
                <p className="text-xs text-[#7A7169] mt-1">or click to browse · JPEG, PNG, WebP</p>
              </div>
            </>
          )}
        </div>

        {previewUrl && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-[#7A7169] hover:text-[#4E7D5E] transition-colors text-center"
          >
            Choose a different photo
          </button>
        )}

        <button
          onClick={() => selectedFile && submit(habit.id, selectedFile)}
          disabled={!selectedFile}
          className={cn(
            'w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150',
            selectedFile
              ? 'bg-[#1E3D2F] text-white hover:bg-[#2A5940]'
              : 'bg-[#F0EDE4] text-[#B0A898] cursor-not-allowed',
          )}
        >
          Submit Proof
        </button>
      </div>
    </Modal>
  )
}
