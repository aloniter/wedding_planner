'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'

interface BudgetProgressProps {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
}

export function BudgetProgress({ totalBudget, totalSpent, totalRemaining }: BudgetProgressProps) {
  const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">תקציב</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">שולם: {formatCurrency(totalSpent)}</span>
          <span className="font-medium">מתוך {formatCurrency(totalBudget)}</span>
        </div>
        <Progress value={Math.min(percentage, 100)} className="h-3" />
        <div className="flex justify-between text-sm">
          <span className={percentage > 95 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
            {percentage}% נוצל
          </span>
          <span className="text-muted-foreground">נשאר: {formatCurrency(totalRemaining)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
