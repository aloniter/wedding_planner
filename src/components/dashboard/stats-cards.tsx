'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, UserX, Clock, HelpCircle, Gift, Send, MessageCircleReply } from 'lucide-react'
import type { GuestStats } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  stats: GuestStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'סה"כ אורחים',
      value: stats.totalAdults + stats.totalKids,
      sub: `${stats.total} מוזמנים`,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'אישרו',
      value: stats.confirmed,
      icon: UserCheck,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'ביטלו',
      value: stats.declined,
      icon: UserX,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'ממתינים',
      value: stats.pending,
      sub: stats.maybe > 0 ? `${stats.maybe} אולי` : undefined,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'אולי',
      value: stats.maybe,
      icon: HelpCircle,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      label: 'נשלחו הזמנות',
      value: stats.invitationsSent,
      sub: stats.total > 0 ? `מתוך ${stats.total}` : undefined,
      icon: Send,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'הגיבו',
      value: stats.responsesReceived,
      sub: stats.invitationsSent > 0
        ? `${stats.invitationsSent - stats.responsesReceived} ממתינים לתגובה`
        : undefined,
      icon: MessageCircleReply,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      label: 'סה"כ מתנות',
      value: formatCurrency(stats.totalGiftAmount),
      sub: stats.giftCount > 0
        ? `ממוצע ${formatCurrency(Math.round(stats.totalGiftAmount / stats.giftCount))}`
        : undefined,
      icon: Gift,
      color: 'text-purple-600 bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm text-muted-foreground">{card.label}</div>
            {card.sub && (
              <div className="text-xs text-muted-foreground mt-1">{card.sub}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
