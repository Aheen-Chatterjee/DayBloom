'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, Upload, X, CheckCircle, ZapOff } from 'lucide-react'
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
  const [cameraMode, setCameraMode] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const confettiFiredRef = useRef(false)

  const { state, verdict, submit, reset } = useProofSubmission(
    useCallback((c: Completion) => onSuccess(c), [onSuccess])
  )

  const locked = state === 'uploading' || state === 'verifying'

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wire stream to video element when camera mode activates
  useEffect(() => {
    if (cameraMode && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraMode])

  // Confetti + auto-close on approval
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
      const t = setTimeout(onClose, 1800)
      return () => clearTimeout(t)
    }
  }, [state, onClose])

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
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      setCameraMode(true)
    } catch (err) {
      const name = err instanceof Error ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Allow it in your browser settings.')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.')
      } else {
        setCameraError('Could not access camera. Upload a photo instead.')
      }
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraMode(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      handleFile(new File([blob], 'camera-proof.jpg', { type: 'image/jpeg' }))
      stopCamera()
    }, 'image/jpeg', 0.92)
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
          className="relative flex flex-col items-center gap-5 text-center"
          style={{
            background: 'linear-gradient(135deg, #081A10 0%, #0F2D1A 50%, #081A10 100%)',
            border: '1px solid #2A6040',
            margin: '-24px',
            borderRadius: '16px',
            padding: '40px 24px',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'rgba(168,196,176,0.6)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#A8C4B0')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(168,196,176,0.6)')}
          >
            <X size={16} />
          </button>
          <div className="text-5xl">{habit.emoticon || '✅'}</div>
          <CheckCircle size={36} className="text-[#7AA88A]" />
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '26px', fontWeight: 700, color: '#C8E6D0' }}>
            Verified.
          </p>
          {verdict && (
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '17px', fontStyle: 'italic', color: '#A8C4B0', lineHeight: 1.6 }}>
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

  // ─── CAMERA VIEW ─────────────────────────────────────────────
  if (cameraMode) {
    return (
      <Modal open onClose={stopCamera} title="Take a Photo">
        <div className="flex flex-col gap-4">
          <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={stopCamera}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E2DBD0] text-[#7A7169] hover:bg-[#F0EDE4] transition-all duration-150"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#1E3D2F] text-white hover:bg-[#2A5940] transition-all duration-150"
            >
              <Camera size={15} strokeWidth={2} />
              Capture
            </button>
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

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

        {/* Camera error */}
        {cameraError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFF3F3] border border-[#FFCCCC]">
            <ZapOff size={14} className="text-[#B5534D] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#B5534D]">{cameraError}</p>
          </div>
        )}

        {/* Camera + re-pick row */}
        <div className="flex gap-2">
          <button
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-[#E2DBD0] text-[#4E7D5E] hover:bg-[#F0EDE4] hover:border-[#C9A96E] transition-all duration-150"
          >
            <Camera size={15} strokeWidth={2} />
            Take Photo
          </button>
          {previewUrl && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E2DBD0] text-[#7A7169] hover:bg-[#F0EDE4] transition-all duration-150"
            >
              Choose Different
            </button>
          )}
        </div>

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
