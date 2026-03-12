'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '(◕‿◕)' },
  { href: '/journal', label: 'Journal', icon: '✧' },
  { href: '/habits', label: 'Habits', icon: '✿' },
  { href: '/history', label: 'History', icon: '(˘▾˘)' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <nav className="w-56 min-h-screen bg-[#FAF7F2] border-r border-[#D4C5A9] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#D4C5A9]">
        <h1 className="font-serif text-2xl font-bold text-[#8B7355]">DayBloom</h1>
        <p className="text-xs text-[#A08B6E] mt-0.5">(^._.^)~ your daily bloom</p>
      </div>

      {/* Nav links */}
      <div className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-[#EDE8DF] text-[#8B7355] font-semibold'
                : 'text-[#6B5B45] hover:bg-[#EDE8DF] hover:text-[#8B7355]'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* User footer */}
      <div className="p-4 border-t border-[#D4C5A9]">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#6B5B45] hover:bg-[#EDE8DF] transition-colors"
        >
          <span>♡</span>
          <span className="truncate">{user?.email?.split('@')[0] ?? 'Account'}</span>
        </Link>
        <button
          onClick={signOut}
          className="mt-1 w-full text-left px-3 py-2 rounded-lg text-sm text-[#6B5B45] hover:bg-[#EDE8DF] transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
