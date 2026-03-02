'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface GuestPaginationProps {
  page: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function GuestPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: GuestPaginationProps) {
  const start = page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>מציג {start}-{end} מתוך {totalItems}</span>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(v === 'all' ? 0 : Number(v))}
        >
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25 לעמוד</SelectItem>
            <SelectItem value="50">50 לעמוד</SelectItem>
            <SelectItem value="100">100 לעמוד</SelectItem>
            <SelectItem value="all">הכל</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-xs min-w-[60px] text-center">
          {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
