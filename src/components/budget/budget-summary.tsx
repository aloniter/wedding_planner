'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pencil } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BudgetSummaryProps {
  totalBudget: number
  totalPrice: number
  totalPaid: number
  totalRemaining: number
  onUpdateBudget: (budget: number) => void
}

export function BudgetSummary({
  totalBudget,
  totalPrice,
  totalPaid,
  totalRemaining,
  onUpdateBudget,
}: BudgetSummaryProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [budgetInput, setBudgetInput] = useState(String(totalBudget))
  const committedPercent = totalBudget > 0 ? Math.round((totalPrice / totalBudget) * 100) : 0
  const overBudget = totalPrice > totalBudget

  const handleSave = () => {
    onUpdateBudget(parseInt(budgetInput) || 0)
    setEditOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">תקציב</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                setBudgetInput(String(totalBudget))
                setEditOpen(true)
              }}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xl font-bold">{formatCurrency(totalBudget)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">התחייבות</div>
            <div className={`text-xl font-bold ${overBudget ? 'text-red-600' : ''}`}>
              {formatCurrency(totalPrice)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">שולם</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">נשאר לשלם</div>
            <div className="text-xl font-bold text-red-600">{formatCurrency(totalRemaining)}</div>
          </CardContent>
        </Card>
      </div>

      {totalBudget > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{committedPercent}% מהתקציב מחויב</span>
            {overBudget && <span className="text-red-600 font-medium">חריגה מהתקציב!</span>}
          </div>
          <Progress value={Math.min(committedPercent, 100)} className="h-2" />
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>עדכון תקציב</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>תקציב כולל (₪)</Label>
              <Input
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                min="0"
              />
            </div>
            <Button onClick={handleSave} className="w-full">שמור</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
