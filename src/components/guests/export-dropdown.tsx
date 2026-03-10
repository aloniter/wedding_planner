'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText, Printer, FileDown } from 'lucide-react'
import { exportGuestsToCsv } from '@/lib/csv'
import { exportGuestsToExcel, exportGuestsPdf } from '@/lib/export'
import { downloadGuestTemplate } from '@/lib/guest-template'
import type { Guest, Wedding, GuestStats, WeddingTable } from '@/lib/types'

interface ExportDropdownProps {
  guests: Guest[]
  wedding: Wedding
  stats: GuestStats
  tables?: WeddingTable[]
}

export function ExportDropdown({ guests, wedding, stats, tables = [] }: ExportDropdownProps) {
  const hasGuests = guests.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 ml-1" />
          {hasGuests ? 'ייצוא' : 'הורדה'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {hasGuests && (
          <>
            <DropdownMenuItem onClick={() => exportGuestsToCsv(guests, tables)}>
              <FileText className="h-4 w-4 ml-2" />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportGuestsToExcel(guests, tables, stats)}>
              <FileSpreadsheet className="h-4 w-4 ml-2" />
              Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportGuestsPdf(guests, wedding, stats)}>
              <Printer className="h-4 w-4 ml-2" />
              PDF (הדפסה)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={downloadGuestTemplate}>
          <FileDown className="h-4 w-4 ml-2" />
          הורד טמפלייט Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
