'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto',
          'border border-[#E2DBD0]',
          className
        )}
        style={{ boxShadow: '0 25px 60px rgba(30,61,47,0.18), 0 8px 24px rgba(30,61,47,0.10)' }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EDE4]">
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', fontWeight: 600, color: '#1A1A1A' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7A7169] hover:bg-[#F7F5EF] hover:text-[#1A1A1A] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
