export const dynamic = 'force-dynamic'

import { AuthGuard } from '@/components/layout/AuthGuard'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F5F0E8]">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  )
}
