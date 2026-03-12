'use client'

import { useState, useEffect } from 'react'

export function ColdStartBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 5000)
    const hide = setTimeout(() => setShow(false), 20000)
    return () => { clearTimeout(timer); clearTimeout(hide) }
  }, [])

  if (!show) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-[#FAF7F2] border border-[#D4C5A9] rounded-xl px-4 py-3 shadow-lg text-sm text-[#8B7355] flex items-center gap-2">
      <span>(˘▾˘)</span>
      <span>The server is waking up... just a moment!</span>
    </div>
  )
}
