'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  CalendarDays,
  Settings,
  LogOut,
  Leaf,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/habits', label: 'Habits', icon: Sparkles },
  { href: '/history', label: 'History', icon: CalendarDays },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Account'

  return (
    <nav
      className="w-60 min-h-screen flex flex-col flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, #1E3D2F 0%, #142B21 100%)',
        borderRight: '1px solid #0D2018',
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
      <div className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#C9A96E] text-[#1A1A1A]'
                  : 'text-[#A8C4B0] hover:bg-[#2A5940] hover:text-white'
              )}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </div>

      {/* User footer */}
      <div className="px-3 pb-5 pt-4 space-y-0.5" style={{ borderTop: '1px solid #2A5940' }}>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A8C4B0] hover:bg-[#2A5940] hover:text-white transition-all duration-150"
        >
          <Settings size={16} strokeWidth={2} />
          <span className="truncate">{displayName}</span>
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A8C4B0] hover:bg-[#3D1A1A] hover:text-[#F0A0A0] transition-all duration-150"
        >
          <LogOut size={16} strokeWidth={2} />
          Sign out
        </button>
      </div>
    </nav>
  )
}
