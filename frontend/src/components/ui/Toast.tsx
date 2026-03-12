'use client'

import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils/cn'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium',
            'pointer-events-auto animate-in slide-in-from-right-4',
            {
              success: 'bg-[#6B8E6B] text-white',
              error: 'bg-[#C4706A] text-white',
              info: 'bg-[#8B7355] text-[#FAF7F2]',
            }[toast.type]
          )}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
