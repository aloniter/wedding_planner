'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Pencil } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { VENDOR_CATEGORIES } from '@/lib/constants'
import type { Vendor } from '@/lib/types'

interface VendorCardProps {
  vendor: Vendor
  onEdit: (vendor: Vendor) => void
}

export function VendorCard({ vendor, onEdit }: VendorCardProps) {
  const remaining = vendor.total_price - vendor.deposit_paid
  const paidPercent = vendor.total_price > 0
    ? Math.round((vendor.deposit_paid / vendor.total_price) * 100)
    : 0
  const emoji = VENDOR_CATEGORIES.find(c => c.value === vendor.category)?.emoji || '📦'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <div>
              <h3 className="font-medium">{vendor.name}</h3>
              <p className="text-xs text-muted-foreground">{vendor.category}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(vendor)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">סה"כ</span>
            <span className="font-medium">{formatCurrency(vendor.total_price)}</span>
          </div>
          <Progress value={paidPercent} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-green-600">שולם: {formatCurrency(vendor.deposit_paid)}</span>
            {remaining > 0 ? (
              <span className="text-red-600">נשאר: {formatCurrency(remaining)}</span>
            ) : (
              <span className="text-green-600">שולם במלואו</span>
            )}
          </div>
          {vendor.contact_phone && (
            <p className="text-xs text-muted-foreground" dir="ltr">
              {vendor.contact_phone}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
