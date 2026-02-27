'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { VENDOR_CATEGORIES } from '@/lib/constants'
import type { Vendor } from '@/lib/types'

interface VendorsDueProps {
  vendors: Vendor[]
}

export function VendorsDue({ vendors }: VendorsDueProps) {
  const vendorsWithBalance = vendors.filter(v => v.total_price - v.deposit_paid > 0)

  const getCategoryEmoji = (category: string) => {
    return VENDOR_CATEGORIES.find(c => c.value === category)?.emoji || '📦'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">ספקים ממתינים לתשלום</CardTitle>
      </CardHeader>
      <CardContent>
        {vendorsWithBalance.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">הכל שולם! 🎉</p>
        ) : (
          <div className="space-y-3">
            {vendorsWithBalance.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getCategoryEmoji(vendor.category)}</span>
                  <span className="text-sm font-medium">{vendor.name}</span>
                </div>
                <span className="text-sm text-red-600 font-medium">
                  {formatCurrency(vendor.total_price - vendor.deposit_paid)} נשאר
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
