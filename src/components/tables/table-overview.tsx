'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { WeddingTable, Guest } from '@/lib/types'

interface TableOverviewProps {
  tables: WeddingTable[]
  tableAssignments: Map<string, Guest[]>
  unassignedCount: number
}

export function TableOverview({ tables, tableAssignments, unassignedCount }: TableOverviewProps) {
  const totalSeats = tables.reduce((sum, t) => sum + t.seat_capacity, 0)
  const totalAssigned = Array.from(tableAssignments.values()).reduce(
    (sum, guests) => sum + guests.reduce((s, g) => s + g.adults_count + g.kids_count, 0), 0
  )

  const stats = [
    { label: 'שולחנות', value: tables.length },
    { label: 'מקומות', value: totalSeats },
    { label: 'שובצו', value: totalAssigned },
    { label: 'ממתינים לשיבוץ', value: unassignedCount },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(s => (
        <Card key={s.label}>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
