'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWedding } from '@/hooks/use-wedding'
import { useGuests } from '@/hooks/use-guests'
import { useVendors } from '@/hooks/use-vendors'
import { useCategories } from '@/hooks/use-categories'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { BudgetProgress } from '@/components/dashboard/budget-progress'
import { VendorsDue } from '@/components/dashboard/vendors-due'
import { WeddingDetailsEditor } from '@/components/dashboard/wedding-details-editor'
import { GiftSummary } from '@/components/dashboard/gift-summary'
import { InvitePartnerDialog } from '@/components/dashboard/invite-partner-dialog'
import { MigrationBanner } from '@/components/dashboard/migration-banner'

export default function DashboardPage() {
  const router = useRouter()
  const { wedding, loading: weddingLoading, updateWedding } = useWedding()
  const { allGuests, stats, loading: guestsLoading } = useGuests(wedding?.id)
  const { vendors, totals, loading: vendorsLoading } = useVendors(wedding?.id)
  const { categories } = useCategories(wedding?.id)

  useEffect(() => {
    if (!weddingLoading && !wedding) {
      router.push('/setup')
    }
  }, [wedding, weddingLoading, router])

  if (weddingLoading || guestsLoading || vendorsLoading || !wedding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Migration banner for existing localStorage data */}
      <MigrationBanner weddingId={wedding.id} />

      {/* Editable Wedding Details + Invite Partner */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <WeddingDetailsEditor wedding={wedding} onUpdate={updateWedding} />
        </div>
        <InvitePartnerDialog weddingId={wedding.id} />
      </div>

      {/* Guest Stats */}
      <StatsCards stats={stats} />

      {/* Gift Summary + Budget */}
      <div className="grid md:grid-cols-2 gap-4">
        <GiftSummary guests={allGuests} categories={categories} />
        <BudgetProgress
          totalBudget={wedding.total_budget}
          totalSpent={totals.totalPaid}
          totalRemaining={wedding.total_budget - totals.totalPaid}
        />
      </div>

      {/* Vendors Due */}
      <VendorsDue vendors={vendors} />
    </div>
  )
}
