import { utils, writeFileXLSX } from 'xlsx'
import type { Guest, Wedding, GuestStats, WeddingTable } from './types'
import { formatCurrency, formatDate } from './utils'

export const TEMPLATE_HEADERS = [
  "מס'",
  'שם פרטי',
  'שם משפחה',
  'צד',
  'קשר',
  'כתובת מייל',
  'טלפון',
  '# מוזמנים',
  '# מגיעים',
  'סטטוס RSVP',
  'שמר תאריך',
  'הזמנה נשלחה',
  'בחירת מנה',
  'הגבלות תזונה',
  'שולחן',
  'מתנה',
  'תודה נשלחה',
  'הערות',
] as const

export function splitFullName(fullName: string): [string, string] {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0] || ''
  const last = parts.slice(1).join(' ')
  return [first, last]
}

export function buildTemplateRow(
  rowNum: number,
  firstName: string,
  lastName: string,
  side: string,
  group: string,
  phone: string,
  adults: number,
  attending: number | string,
  rsvpStatus: string,
  kids: number,
  table = '',
  gift: number | string = '',
  notes = '',
): unknown[] {
  return [
    rowNum,          // מס'
    firstName,       // שם פרטי
    lastName,        // שם משפחה
    side,            // צד
    group,           // קשר
    '',              // כתובת מייל
    phone,           // טלפון
    adults,          // # מוזמנים
    attending,       // # מגיעים
    rsvpStatus,      // סטטוס RSVP
    '',              // שמר תאריך
    '',              // הזמנה נשלחה
    '',              // בחירת מנה
    '',              // הגבלות תזונה
    table,           // שולחן
    gift,            // מתנה
    '',              // תודה נשלחה
    notes,           // הערות
    kids,            // ילדים (bonus)
  ]
}

const COL_WIDTHS = [
  { wch: 5 },   // מס'
  { wch: 14 },  // שם פרטי
  { wch: 14 },  // שם משפחה
  { wch: 8 },   // צד
  { wch: 14 },  // קשר
  { wch: 18 },  // כתובת מייל
  { wch: 14 },  // טלפון
  { wch: 10 },  // # מוזמנים
  { wch: 10 },  // # מגיעים
  { wch: 12 },  // סטטוס RSVP
  { wch: 10 },  // שמר תאריך
  { wch: 12 },  // הזמנה נשלחה
  { wch: 10 },  // בחירת מנה
  { wch: 12 },  // הגבלות תזונה
  { wch: 8 },   // שולחן
  { wch: 8 },   // מתנה
  { wch: 10 },  // תודה נשלחה
  { wch: 18 },  // הערות
  { wch: 8 },   // ילדים
]

export function exportGuestsToExcel(
  guests: Guest[],
  tables: WeddingTable[] = [],
  stats?: GuestStats,
): void {
  const tableMap = new Map(tables.map(t => [t.id, t.label || `שולחן ${t.table_number}`]))

  const headers = [...TEMPLATE_HEADERS, 'ילדים']

  const dataRows = guests.map((g, i) => {
    const [firstName, lastName] = splitFullName(g.full_name)
    const attending = g.rsvp_status === 'אישר' ? g.adults_count : ''
    const tableLabel = g.table_id ? (tableMap.get(g.table_id) || '') : ''

    return buildTemplateRow(
      i + 1,
      firstName,
      lastName,
      g.side,
      g.group_name || '',
      g.phone || '',
      g.adults_count,
      attending,
      g.rsvp_status,
      g.kids_count,
      tableLabel,
      g.gift_amount ?? '',
      g.notes || '',
    )
  })

  const wsData = [
    ['💍  רשימת אורחים  💍'],
    headers,
    ...dataRows,
  ]

  const ws = utils.aoa_to_sheet(wsData)

  // Merge title row
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]
  ws['!cols'] = COL_WIDTHS
  ws['!rtl'] = true

  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'רשימת אורחים')

  // Summary sheet
  if (stats) {
    const avgGift = stats.giftCount > 0 ? Math.round(stats.totalGiftAmount / stats.giftCount) : 0

    const summaryData = [
      ['סיכום רשימת אורחים'],
      [],
      ['סה"כ מוזמנים', stats.total],
      ['אישרו הגעה', stats.confirmed],
      ['ביטלו', stats.declined],
      ['ממתינים', stats.pending],
      ['אולי', stats.maybe],
      [],
      ['סה"כ מבוגרים', stats.totalAdults],
      ['סה"כ ילדים', stats.totalKids],
      ['סה"כ אנשים', stats.totalAdults + stats.totalKids],
      [],
      ['סה"כ מתנות', stats.totalGiftAmount],
      ['מתנות שהתקבלו', stats.giftCount],
      ['ממוצע מתנה', avgGift],
    ]

    const summaryWs = utils.aoa_to_sheet(summaryData)
    summaryWs['!cols'] = [{ wch: 18 }, { wch: 12 }]
    summaryWs['!rtl'] = true
    utils.book_append_sheet(wb, summaryWs, 'סיכום')
  }

  writeFileXLSX(wb, `רשימת-אורחים-${new Date().toISOString().split('T')[0]}.xlsx`)
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
