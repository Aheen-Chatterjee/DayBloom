'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { fetchRoast } from '@/lib/api/accountability'
import { cn } from '@/lib/utils/cn'
import { useAllStreaks } from '@/hooks/useStreaks'
import {
  Sun,
  BookOpen,
  CheckSquare,
  BarChart2,
  Settings,
  LogOut,
  Leaf,
  Flame,
  Sparkles,
} from 'lucide-react'

const TODAY_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: Sun },
  { href: '/journal', label: 'Journal', icon: BookOpen },
]

const TRACKING_ITEMS = [
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/history', label: 'History', icon: BarChart2 },
  { href: '/insights', label: 'Insights', icon: Sparkles },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Account'

  const { streaks } = useAllStreaks()
  const globalStreak = Math.max(0, ...Object.values(streaks).map(s => s.current_streak))
  const { showToast } = useToast()
  const [roasting, setRoasting] = useState(false)

  async function handleRoastMe() {
    if (roasting) return
    setRoasting(true)
    try {
      const data = await fetchRoast(true)
      if (data.roast) {
        showToast(data.roast, 'roast')
      } else {
        showToast('The coach has nothing to say. Suspicious.', 'info')
      }
    } catch {
      showToast('The roast machine broke. Try again.', 'error')
    } finally {
      setRoasting(false)
    }
  }

  return (
    <nav
      className="hidden md:flex w-64 min-h-screen flex-col flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, #11281E 0%, #1A3F2F 100%)',
        borderRight: '1px solid #142B21',
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#C9A96E] flex items-center justify-center flex-shrink-0">
            <Leaf size={14} className="text-[#1E3D2F]" strokeWidth={2.5} />
          </div>
          <span
            className="text-xl font-semibold text-white tracking-wide"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', letterSpacing: '0.02em' }}
          >
            DayBloom
          </span>
        </div>
        <p className="text-xs text-[#7AA88A] ml-9.5 pl-0.5">your daily practice</p>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-4 h-px bg-[#2A5940]" />

      {/* Nav links */}
      <div className="flex-1 px-4 py-2 overflow-y-auto w-full">
        {/* Today Section */}
        <div className="mb-6">
          <p className="px-3 text-[11px] font-bold text-[#7AA88A] uppercase tracking-wider mb-2">
            Today
          </p>
          <div className="space-y-0.5">
            {TODAY_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-[#C9A96E] text-[#1A1A1A] shadow-sm'
                      : 'text-[#A8C4B0] hover:bg-[#2A5940]/50 hover:text-white'
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Tracking Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-[#7AA88A] uppercase tracking-wider mb-2">
            Tracking
          </p>
          <div className="space-y-0.5">
            {TRACKING_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-[#C9A96E] text-[#1A1A1A] shadow-sm'
                      : 'text-[#A8C4B0] hover:bg-[#2A5940]/50 hover:text-white'
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Global Streak & User footer */}
      <div className="px-4 pb-6 pt-4 space-y-3" style={{ borderTop: '1px solid #234B36' }}>
        {globalStreak > 0 && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 mx-1 bg-[#234B36] rounded-xl border border-[#2A5940]">
            <Flame size={16} className="text-[#DFB561]" />
            <span className="text-sm font-bold text-white tracking-wide">
              {globalStreak} day streak
            </span>
          </div>
        )}

        <button
          onClick={handleRoastMe}
          disabled={roasting}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-1"
          style={{
            background: roasting ? '#3D1A1A' : '#5C1A1A',
            color: roasting ? '#A06060' : '#F5C0C0',
            opacity: roasting ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!roasting) e.currentTarget.style.background = '#7A2020' }}
          onMouseLeave={e => { if (!roasting) e.currentTarget.style.background = '#5C1A1A' }}
        >
          <Flame size={18} strokeWidth={2} />
          {roasting ? 'Roasting...' : 'Roast Me'}
        </button>

        <div className="space-y-0.5">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A8C4B0] hover:bg-[#2A5940]/50 hover:text-white transition-all duration-200"
          >
            <Settings size={18} strokeWidth={2} />
            <span className="truncate">{displayName}</span>
          </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A8C4B0] hover:bg-[#3D1A1A]/80 hover:text-[#F0A0A0] transition-all duration-200"
        >
          <LogOut size={18} strokeWidth={2} />
          Sign out
        </button>  
        </div>
      </div>
    </nav>
  )
}
