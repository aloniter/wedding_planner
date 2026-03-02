'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Guest, GuestCategory } from '@/lib/types'

interface GiftSummaryProps {
  guests: Guest[]
  categories: GuestCategory[]
}

export function GiftSummary({ guests, categories }: GiftSummaryProps) {
  const guestsWithGifts = guests.filter(g => g.gift_amount != null && g.gift_amount > 0)

  if (guestsWithGifts.length === 0) return null

  // Group by category
  const byCategory = new Map<string, number>()
  for (const g of guestsWithGifts) {
    const cat = g.group_name || 'ללא קטגוריה'
    byCategory.set(cat, (byCategory.get(cat) || 0) + g.gift_amount!)
  }

  // Group by side
  const bySide = new Map<string, number>()
  for (const g of guestsWithGifts) {
    bySide.set(g.side, (bySide.get(g.side) || 0) + g.gift_amount!)
  }

  const sideLabels: Record<string, string> = {
    'חתן': 'צד חתן',
    'כלה': 'צד כלה',
    'משותף': 'משותף',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">פירוט מתנות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* By side */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">לפי צד</h4>
          <div className="space-y-1">
            {Array.from(bySide.entries()).map(([side, amount]) => (
              <div key={side} className="flex justify-between text-sm">
                <span>{sideLabels[side] || side}</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By category */}
        {byCategory.size > 1 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">לפי קטגוריה</h4>
            <div className="space-y-1">
              {Array.from(byCategory.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span>{cat}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
