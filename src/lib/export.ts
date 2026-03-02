import { utils, writeFileXLSX } from 'xlsx'
import type { Guest, Wedding, GuestStats } from './types'
import { formatCurrency, formatDate } from './utils'

export function exportGuestsToExcel(guests: Guest[]): void {
  const data = guests.map(g => ({
    'שם': g.full_name,
    'טלפון': g.phone || '',
    'צד': g.side,
    'קטגוריה': g.group_name || '',
    'מבוגרים': g.adults_count,
    'ילדים': g.kids_count,
    'סטטוס RSVP': g.rsvp_status,
    'מתנה': g.gift_amount ?? '',
    'הערות': g.notes || '',
  }))

  const ws = utils.json_to_sheet(data)

  // Column widths
  ws['!cols'] = [
    { wch: 20 }, // name
    { wch: 14 }, // phone
    { wch: 10 }, // side
    { wch: 14 }, // category
    { wch: 8 },  // adults
    { wch: 8 },  // kids
    { wch: 10 }, // status
    { wch: 10 }, // gift
    { wch: 20 }, // notes
  ]

  // RTL
  ws['!rtl'] = true

  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'אורחים')

  writeFileXLSX(wb, `guests-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportGuestsPdf(guests: Guest[], wedding: Wedding, stats: GuestStats): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const rows = guests.map(g =>
    `<tr>
      <td>${g.full_name}</td>
      <td dir="ltr" style="text-align:right">${g.phone || ''}</td>
      <td>${g.side}</td>
      <td>${g.group_name || ''}</td>
      <td>${g.adults_count}${g.kids_count > 0 ? `+${g.kids_count}` : ''}</td>
      <td>${g.rsvp_status}</td>
      <td>${g.gift_amount != null ? formatCurrency(g.gift_amount) : ''}</td>
    </tr>`
  ).join('')

  const avgGift = stats.giftCount > 0 ? formatCurrency(Math.round(stats.totalGiftAmount / stats.giftCount)) : '—'

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <title>רשימת אורחים - ${wedding.groom_name} ו${wedding.bride_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Tahoma, sans-serif; padding: 24px; font-size: 12px; direction: rtl; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    .subtitle { color: #666; margin-bottom: 16px; }
    .stats { display: flex; gap: 24px; margin-bottom: 16px; padding: 12px; background: #f5f5f5; border-radius: 8px; }
    .stat { text-align: center; }
    .stat-value { font-size: 20px; font-weight: bold; }
    .stat-label { font-size: 10px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: right; }
    th { background: #f0f0f0; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>חתונת ${wedding.groom_name} ו${wedding.bride_name}</h1>
  <div class="subtitle">${formatDate(wedding.wedding_date)} ${wedding.venue_name ? '· ' + wedding.venue_name : ''}</div>

  <div class="stats">
    <div class="stat"><div class="stat-value">${stats.total}</div><div class="stat-label">מוזמנים</div></div>
    <div class="stat"><div class="stat-value">${stats.confirmed}</div><div class="stat-label">אישרו</div></div>
    <div class="stat"><div class="stat-value">${stats.declined}</div><div class="stat-label">ביטלו</div></div>
    <div class="stat"><div class="stat-value">${stats.pending}</div><div class="stat-label">ממתינים</div></div>
    <div class="stat"><div class="stat-value">${stats.maybe}</div><div class="stat-label">אולי</div></div>
    <div class="stat"><div class="stat-value">${formatCurrency(stats.totalGiftAmount)}</div><div class="stat-label">סה"כ מתנות</div></div>
    <div class="stat"><div class="stat-value">${avgGift}</div><div class="stat-label">ממוצע</div></div>
  </div>

  <table>
    <thead>
      <tr><th>שם</th><th>טלפון</th><th>צד</th><th>קטגוריה</th><th>מוזמנים</th><th>סטטוס</th><th>מתנה</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  printWindow.document.write(html)
  printWindow.document.close()
}
