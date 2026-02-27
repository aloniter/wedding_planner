'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWedding } from '@/hooks/use-wedding'
import { useGuests } from '@/hooks/use-guests'
import { useVendors } from '@/hooks/use-vendors'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { BudgetProgress } from '@/components/dashboard/budget-progress'
import { VendorsDue } from '@/components/dashboard/vendors-due'
import { formatDate, daysUntilWedding } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const { wedding, loading: weddingLoading } = useWedding()
  const { stats, loading: guestsLoading } = useGuests(wedding?.id)
  const { vendors, totals, loading: vendorsLoading } = useVendors(wedding?.id)

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

  const daysLeft = daysUntilWedding(wedding.wedding_date)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
          חתונת {wedding.groom_name} ו{wedding.bride_name} 🎊
        </h1>
        <p className="text-muted-foreground">
          {formatDate(wedding.wedding_date)}
          {daysLeft !== null && daysLeft > 0 && (
            <span className="mr-2">· עוד {daysLeft} ימים</span>
          )}
        </p>
      </div>

      {/* Guest Stats */}
      <StatsCards stats={stats} />

      {/* Budget + Vendors */}
      <div className="grid md:grid-cols-2 gap-4">
        <BudgetProgress
          totalBudget={wedding.total_budget}
          totalSpent={totals.totalPaid}
          totalRemaining={wedding.total_budget - totals.totalPaid}
        />
        <VendorsDue vendors={vendors} />
      </div>
    </div>
  )
}
