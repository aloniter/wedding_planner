'use client'

import { PageHeader } from '@/components/layout/page-header'
import { BudgetSummary } from '@/components/budget/budget-summary'
import { VendorList } from '@/components/budget/vendor-list'
import { AddVendorDialog } from '@/components/budget/add-vendor-dialog'
import { useWeddingSlugContext } from '@/providers/wedding-slug-provider'
import { useVendors } from '@/hooks/use-vendors'

export default function BudgetPage() {
  const { wedding, loading: weddingLoading, updateWedding } = useWeddingSlugContext()
  const { vendors, totals, loading: vendorsLoading, addVendor, updateVendor, deleteVendor } = useVendors(wedding?.id)

  if (weddingLoading || vendorsLoading || !wedding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="תקציב וספקים"
        subtitle={`${vendors.length} ספקים`}
        action={<AddVendorDialog weddingId={wedding.id} onAdd={addVendor} />}
      />

      <BudgetSummary
        totalBudget={wedding.total_budget}
        totalPrice={totals.totalPrice}
        totalPaid={totals.totalPaid}
        totalRemaining={totals.totalRemaining}
        onUpdateBudget={(budget) => updateWedding({ total_budget: budget })}
      />

      <VendorList
        vendors={vendors}
        onUpdateVendor={updateVendor}
        onDeleteVendor={deleteVendor}
      />
    </div>
  )
}
