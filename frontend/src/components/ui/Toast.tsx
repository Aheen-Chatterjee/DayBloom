'use client'

import { X, CheckCircle2, AlertCircle, Info, Flame } from 'lucide-react'
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
            'flex items-start gap-3 pl-4 pr-3 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto border',
            toast.type === 'roast'
              ? 'bg-[#1A0A0A] border-[#8B2020] text-[#F5E8E8] max-w-sm'
              : cn('bg-white', {
                  'border-[#4E7D5E30] text-[#1A1A1A]': toast.type === 'success',
                  'border-[#B5534D30] text-[#1A1A1A]': toast.type === 'error',
                  'border-[#E2DBD0] text-[#1A1A1A]': toast.type === 'info',
                })
          )}
          style={{
            boxShadow: toast.type === 'roast'
              ? '0 4px 24px rgba(180,30,30,0.35)'
              : '0 4px 20px rgba(30,61,47,0.12)',
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-[#4E7D5E] flex-shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-[#B5534D] flex-shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info size={16} className="text-[#C9A96E] flex-shrink-0 mt-0.5" />}
          {toast.type === 'roast' && <Flame size={16} className="text-[#E05252] flex-shrink-0 mt-0.5" />}
          <span className={cn('flex-1', toast.type === 'roast' && 'leading-snug')}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className={cn(
              'ml-1 p-0.5 rounded transition-colors',
              toast.type === 'roast'
                ? 'text-[#8B5050] hover:text-[#F5E8E8]'
                : 'text-[#B0A898] hover:text-[#1A1A1A]'
            )}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
