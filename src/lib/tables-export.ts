'use client'

import Papa from 'papaparse'
import type { Guest, Wedding, WeddingTable } from './types'
import { formatDate } from './utils'

type SeatingStatus = 'שובץ' | 'שולחן ריק' | 'ממתין לשיבוץ'

interface TableGuestExportItem {
  fullName: string
  phone: string
  side: Guest['side']
  groupName: string
  adultsCount: number
  kidsCount: number
  totalPeople: number
  rsvpStatus: Guest['rsvp_status']
}

interface TableExportSection {
  tableId: string
  tableNumber: number
  label: string
  seatCapacity: number
  occupancy: number
  guests: TableGuestExportItem[]
}

interface TablesExportData {
  tables: TableExportSection[]
  unassignedGuests: TableGuestExportItem[]
  summary: {
    tableCount: number
    totalSeats: number
    assignedPeople: number
    waitingCount: number
  }
}

interface TablesExportOptions {
  tables: WeddingTable[]
  tableAssignments: Map<string, Guest[]>
  unassignedGuests: Guest[]
}

interface TablesCsvRow {
  'סטטוס שיבוץ': SeatingStatus
  'מספר שולחן': number | ''
  'שם שולחן': string
  'קיבולת': number | ''
  'תפוסה': number | ''
  'אורח': string
  'טלפון': string
  'צד': string
  'קבוצה': string
  'מבוגרים': number | ''
  'ילדים': number | ''
  'סה"כ סועדים': number | ''
  'RSVP': string
}

function formatDateSuffix(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getGuestSeatCount(guest: Guest): number {
  return guest.adults_count + guest.kids_count
}

function sortGuestsByName(guests: Guest[]): Guest[] {
  return [...guests].sort((left, right) => left.full_name.localeCompare(right.full_name, 'he'))
}

function toTableGuestExportItem(guest: Guest): TableGuestExportItem {
  return {
    fullName: guest.full_name,
    phone: guest.phone ?? '',
    side: guest.side,
    groupName: guest.group_name ?? '',
    adultsCount: guest.adults_count,
    kidsCount: guest.kids_count,
    totalPeople: getGuestSeatCount(guest),
    rsvpStatus: guest.rsvp_status,
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildTablesExportData({
  tables,
  tableAssignments,
  unassignedGuests,
}: TablesExportOptions): TablesExportData {
  const sortedTables = [...tables].sort((left, right) => left.table_number - right.table_number)

  const formattedTables = sortedTables.map((table) => {
    const sortedGuests = sortGuestsByName(tableAssignments.get(table.id) ?? [])
    const guests = sortedGuests.map(toTableGuestExportItem)
    const occupancy = guests.reduce((sum, guest) => sum + guest.totalPeople, 0)

    return {
      tableId: table.id,
      tableNumber: table.table_number,
      label: table.label ?? '',
      seatCapacity: table.seat_capacity,
      occupancy,
      guests,
    }
  })

  const formattedUnassignedGuests = sortGuestsByName(unassignedGuests).map(toTableGuestExportItem)

  return {
    tables: formattedTables,
    unassignedGuests: formattedUnassignedGuests,
    summary: {
      tableCount: formattedTables.length,
      totalSeats: formattedTables.reduce((sum, table) => sum + table.seatCapacity, 0),
      assignedPeople: formattedTables.reduce((sum, table) => sum + table.occupancy, 0),
      waitingCount: formattedUnassignedGuests.length,
    },
  }
}

function createTablesCsvRows(data: TablesExportData): TablesCsvRow[] {
  const rows: TablesCsvRow[] = []

  for (const table of data.tables) {
    if (table.guests.length === 0) {
      rows.push({
        'סטטוס שיבוץ': 'שולחן ריק',
        'מספר שולחן': table.tableNumber,
        'שם שולחן': table.label,
        'קיבולת': table.seatCapacity,
        'תפוסה': table.occupancy,
        'אורח': '',
        'טלפון': '',
        'צד': '',
        'קבוצה': '',
        'מבוגרים': '',
        'ילדים': '',
        'סה"כ סועדים': '',
        'RSVP': '',
      })
      continue
    }

    for (const guest of table.guests) {
      rows.push({
        'סטטוס שיבוץ': 'שובץ',
        'מספר שולחן': table.tableNumber,
        'שם שולחן': table.label,
        'קיבולת': table.seatCapacity,
        'תפוסה': table.occupancy,
        'אורח': guest.fullName,
        'טלפון': guest.phone,
        'צד': guest.side,
        'קבוצה': guest.groupName,
        'מבוגרים': guest.adultsCount,
        'ילדים': guest.kidsCount,
        'סה"כ סועדים': guest.totalPeople,
        'RSVP': guest.rsvpStatus,
      })
    }
  }

  for (const guest of data.unassignedGuests) {
    rows.push({
      'סטטוס שיבוץ': 'ממתין לשיבוץ',
      'מספר שולחן': '',
      'שם שולחן': '',
      'קיבולת': '',
      'תפוסה': '',
      'אורח': guest.fullName,
      'טלפון': guest.phone,
      'צד': guest.side,
      'קבוצה': guest.groupName,
      'מבוגרים': guest.adultsCount,
      'ילדים': guest.kidsCount,
      'סה"כ סועדים': guest.totalPeople,
      'RSVP': guest.rsvpStatus,
    })
  }

  return rows
}

export function exportTablesToCsv(
  tables: WeddingTable[],
  tableAssignments: Map<string, Guest[]>,
  unassignedGuests: Guest[]
): void {
  const data = buildTablesExportData({ tables, tableAssignments, unassignedGuests })
  const csv = Papa.unparse(createTablesCsvRows(data), { header: true })
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `שולחנות-${formatDateSuffix(new Date())}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

export function exportTablesPdf(
  tables: WeddingTable[],
  tableAssignments: Map<string, Guest[]>,
  unassignedGuests: Guest[],
  wedding: Wedding
): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const data = buildTablesExportData({ tables, tableAssignments, unassignedGuests })
  const subtitleParts = [formatDate(wedding.wedding_date)]

  if (wedding.venue_name) {
    subtitleParts.push(wedding.venue_name)
  }

  const tableSections = data.tables.map((table) => {
    const guestRows = table.guests.length > 0
      ? table.guests.map((guest) => `
        <tr>
          <td>${escapeHtml(guest.fullName)}</td>
          <td dir="ltr" style="text-align:right">${escapeHtml(guest.phone)}</td>
          <td>${escapeHtml(guest.side)}</td>
          <td>${escapeHtml(guest.groupName)}</td>
          <td>${guest.adultsCount}</td>
          <td>${guest.kidsCount}</td>
          <td>${guest.totalPeople}</td>
          <td>${escapeHtml(guest.rsvpStatus)}</td>
        </tr>
      `).join('')
      : `
        <tr>
          <td colspan="8" class="empty-state">אין אורחים משובצים לשולחן זה</td>
        </tr>
      `

    const tableTitle = table.label
      ? `שולחן ${table.tableNumber} (${escapeHtml(table.label)})`
      : `שולחן ${table.tableNumber}`

    return `
      <section class="table-section">
        <div class="section-header">
          <div>
            <h2>${tableTitle}</h2>
            <p class="section-meta">קיבולת: ${table.seatCapacity} · תפוסה: ${table.occupancy}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>אורח</th>
              <th>טלפון</th>
              <th>צד</th>
              <th>קבוצה</th>
              <th>מבוגרים</th>
              <th>ילדים</th>
              <th>סה"כ סועדים</th>
              <th>RSVP</th>
            </tr>
          </thead>
          <tbody>${guestRows}</tbody>
        </table>
      </section>
    `
  }).join('')

  const unassignedSection = data.unassignedGuests.length > 0
    ? `
      <section class="table-section">
        <div class="section-header">
          <div>
            <h2>ממתינים לשיבוץ</h2>
            <p class="section-meta">${data.summary.waitingCount} אורחים</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>אורח</th>
              <th>טלפון</th>
              <th>צד</th>
              <th>קבוצה</th>
              <th>מבוגרים</th>
              <th>ילדים</th>
              <th>סה"כ סועדים</th>
              <th>RSVP</th>
            </tr>
          </thead>
          <tbody>
            ${data.unassignedGuests.map((guest) => `
              <tr>
                <td>${escapeHtml(guest.fullName)}</td>
                <td dir="ltr" style="text-align:right">${escapeHtml(guest.phone)}</td>
                <td>${escapeHtml(guest.side)}</td>
                <td>${escapeHtml(guest.groupName)}</td>
                <td>${guest.adultsCount}</td>
                <td>${guest.kidsCount}</td>
                <td>${guest.totalPeople}</td>
                <td>${escapeHtml(guest.rsvpStatus)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>
    `
    : ''

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <title>סידורי ישיבה - ${escapeHtml(wedding.groom_name)} ו${escapeHtml(wedding.bride_name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Tahoma, sans-serif;
      padding: 24px;
      font-size: 12px;
      direction: rtl;
      color: #111827;
      background: #ffffff;
    }
    h1 { font-size: 20px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin-bottom: 4px; }
    .subtitle { color: #6b7280; margin-bottom: 16px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px;
      background: #f9fafb;
      text-align: center;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 11px;
      color: #6b7280;
    }
    .table-section {
      margin-top: 18px;
      break-inside: avoid;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .section-meta {
      color: #6b7280;
      font-size: 11px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 6px 8px;
      text-align: right;
      vertical-align: top;
      word-break: break-word;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
    tbody tr:nth-child(even) {
      background: #fafafa;
    }
    .empty-state {
      text-align: center;
      color: #6b7280;
      padding: 12px;
    }
    @media print {
      body { padding: 0; }
      .table-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>סידורי ישיבה לחתונת ${escapeHtml(wedding.groom_name)} ו${escapeHtml(wedding.bride_name)}</h1>
  <div class="subtitle">${escapeHtml(subtitleParts.join(' · '))}</div>

  <section class="stats">
    <div class="stat"><div class="stat-value">${data.summary.tableCount}</div><div class="stat-label">שולחנות</div></div>
    <div class="stat"><div class="stat-value">${data.summary.totalSeats}</div><div class="stat-label">סה"כ מקומות</div></div>
    <div class="stat"><div class="stat-value">${data.summary.assignedPeople}</div><div class="stat-label">שובצו</div></div>
    <div class="stat"><div class="stat-value">${data.summary.waitingCount}</div><div class="stat-label">ממתינים לשיבוץ</div></div>
  </section>

  ${tableSections}
  ${unassignedSection}

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  printWindow.document.write(html)
  printWindow.document.close()
}
