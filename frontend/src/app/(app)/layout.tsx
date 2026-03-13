export const dynamic = 'force-dynamic'

import { AuthGuard } from '@/components/layout/AuthGuard'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { AccountabilityPoller } from '@/components/accountability/AccountabilityPoller'
import { RoastBanner } from '@/components/accountability/RoastBanner'
import { RoastProvider } from '@/context/RoastContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoastProvider>
        <RoastBanner />
        <div className="flex min-h-screen bg-[#F5F0E8]">
          <Sidebar />
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
          <MobileNav />
          <AccountabilityPoller />
        </div>
      </RoastProvider>
    </AuthGuard>
  )
}
