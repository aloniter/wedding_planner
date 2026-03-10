'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, Printer } from 'lucide-react'
import { exportGuestsToExcel, exportGuestsPdf } from '@/lib/export'
import type { Guest, Wedding, GuestStats } from '@/lib/types'

interface ExportDropdownProps {
  guests: Guest[]
  wedding: Wedding
  stats: GuestStats
}

export function ExportDropdown({ guests, wedding, stats }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 ml-1" />
          ייצוא
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => void exportGuestsToExcel(guests)}>
          <FileSpreadsheet className="h-4 w-4 ml-2" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportGuestsPdf(guests, wedding, stats)}>
          <Printer className="h-4 w-4 ml-2" />
          PDF (הדפסה)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
