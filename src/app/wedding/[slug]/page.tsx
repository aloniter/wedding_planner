'use client'

import { useWeddingSlugContext } from '@/providers/wedding-slug-provider'
import { useGuests } from '@/hooks/use-guests'
import { useVendors } from '@/hooks/use-vendors'
import { useCategories } from '@/hooks/use-categories'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { BudgetProgress } from '@/components/dashboard/budget-progress'
import { VendorsDue } from '@/components/dashboard/vendors-due'
import { WeddingDetailsEditor } from '@/components/dashboard/wedding-details-editor'
import { GiftSummary } from '@/components/dashboard/gift-summary'
import { ShareLinkButton } from '@/components/dashboard/share-link-button'
import { PartnerInvite } from '@/components/dashboard/partner-invite'

export default function DashboardPage() {
  const { wedding, loading: weddingLoading, updateWedding } = useWeddingSlugContext()
  const { allGuests, stats, loading: guestsLoading } = useGuests(wedding?.id)
  const { vendors, totals, loading: vendorsLoading } = useVendors(wedding?.id)
  const { categories } = useCategories(wedding?.id)

  if (weddingLoading || guestsLoading || vendorsLoading || !wedding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Editable Wedding Details + Share Link */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <WeddingDetailsEditor wedding={wedding} onUpdate={updateWedding} />
        </div>
        <ShareLinkButton slug={wedding.slug} />
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

      {/* Partner Invite */}
      <PartnerInvite weddingId={wedding.id} />
    </div>
  )
}
