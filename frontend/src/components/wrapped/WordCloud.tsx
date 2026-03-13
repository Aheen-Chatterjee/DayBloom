'use client'

import { useMemo } from 'react'
import type { WordCloudWord } from '@/types/wrapped'
import { getMoodColor } from '@/types/analysis'

interface WordCloudProps {
  words: WordCloudWord[]
}

export function WordCloud({ words }: WordCloudProps) {
  const sized = useMemo(() => {
    if (!words.length) return []
    const max = Math.max(...words.map(w => w.value))
    const min = Math.min(...words.map(w => w.value))
    return words.map(w => ({
      ...w,
      fontSize: min === max ? 24 : 14 + ((w.value - min) / (max - min)) * 38,
      color: getMoodColor(w.sentiment),
      rotation: (Math.random() - 0.5) * 30,
    }))
  }, [words])

  if (!sized.length) {
    return (
      <div className="flex items-center justify-center h-full text-white/40 text-sm">
        Not enough journal data for a word cloud yet.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center p-8 max-w-2xl mx-auto">
      {sized.map((w, i) => (
        <span
          key={i}
          className="inline-block font-semibold cursor-default select-none transition-transform hover:scale-110"
          style={{
            fontSize: w.fontSize,
            color: w.color,
            transform: `rotate(${w.rotation}deg)`,
            lineHeight: 1.3,
            opacity: 0.85 + (w.value / Math.max(...words.map(x => x.value))) * 0.15,
            animation: `fadeInWord ${0.3 + i * 0.03}s ease forwards`,
          }}
        >
          {w.text}
        </span>
      ))}
      <style>{`
        @keyframes fadeInWord {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
