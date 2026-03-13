'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Sun, BookOpen, CheckSquare, BarChart2, Sparkles } from 'lucide-react'

const TABS = [
  { href: '/dashboard', label: 'Today', icon: Sun },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/history', label: 'History', icon: BarChart2 },
  { href: '/insights', label: 'Insights', icon: Sparkles },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2DBD0] pb-safe flex items-center justify-around px-2 py-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-all duration-200',
              active
                ? 'text-[#4E7D5E]'
                : 'text-[#A8B5AB] hover:text-[#7A7169]'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'scale-110 transition-transform' : ''} />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
