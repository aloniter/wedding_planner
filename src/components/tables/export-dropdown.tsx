'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportTablesToCsv, exportTablesPdf } from '@/lib/tables-export'
import type { Guest, Wedding, WeddingTable } from '@/lib/types'
import { Download, FileSpreadsheet, Printer } from 'lucide-react'

interface TablesExportDropdownProps {
  tables: WeddingTable[]
  tableAssignments: Map<string, Guest[]>
  unassignedGuests: Guest[]
  wedding: Wedding
}

export function TablesExportDropdown({
  tables,
  tableAssignments,
  unassignedGuests,
  wedding,
}: TablesExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 ml-1" />
          ייצוא
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => exportTablesToCsv(tables, tableAssignments, unassignedGuests)}>
          <FileSpreadsheet className="h-4 w-4 ml-2" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportTablesPdf(tables, tableAssignments, unassignedGuests, wedding)}>
          <Printer className="h-4 w-4 ml-2" />
          PDF (הדפסה)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
