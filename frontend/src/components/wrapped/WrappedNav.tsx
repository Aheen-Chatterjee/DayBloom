'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WrappedNavProps {
  current: number
  total: number
  onPrev: () => void
  onNext: () => void
  onSkip: () => void
}

export function WrappedNav({ current, total, onPrev, onNext, onSkip }: WrappedNavProps) {
  return (
    <>
      {/* Progress dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              backgroundColor: i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>

      {/* Prev button */}
      {current > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
      )}

      {/* Next button */}
      {current < total - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
        >
          <ChevronRight size={20} className="text-white" />
        </button>
      )}

      {/* Skip */}
      {current < total - 1 && (
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-white/50 hover:text-white/80 text-xs transition-colors z-10"
        >
          Skip to summary →
        </button>
      )}
    </>
  )
}
