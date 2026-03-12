'use client'

import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils/cn'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl shadow-lg text-sm font-medium',
            'pointer-events-auto border',
            {
              success: 'bg-white border-[#4E7D5E30] text-[#1A1A1A]',
              error: 'bg-white border-[#B5534D30] text-[#1A1A1A]',
              info: 'bg-white border-[#E2DBD0] text-[#1A1A1A]',
            }[toast.type]
          )}
          style={{ boxShadow: '0 4px 20px rgba(30,61,47,0.12)' }}
        >
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-[#4E7D5E] flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-[#B5534D] flex-shrink-0" />}
          {toast.type === 'info' && <Info size={16} className="text-[#C9A96E] flex-shrink-0" />}
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-1 p-0.5 rounded text-[#B0A898] hover:text-[#1A1A1A] transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
