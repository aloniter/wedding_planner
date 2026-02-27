'use client'

import { useState } from 'react'
import { VendorCard } from './vendor-card'
import { EditVendorDialog } from './edit-vendor-dialog'
import type { Vendor, VendorUpdate } from '@/lib/types'

interface VendorListProps {
  vendors: Vendor[]
  onUpdateVendor: (id: string, updates: VendorUpdate) => void
  onDeleteVendor: (id: string) => void
}

export function VendorList({ vendors, onUpdateVendor, onDeleteVendor }: VendorListProps) {
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  if (vendors.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">אין ספקים עדיין</p>
        <p className="text-sm mt-1">הוסיפו את הספקים שלכם כדי לעקוב אחרי התקציב</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            onEdit={setEditingVendor}
          />
        ))}
      </div>

      {editingVendor && (
        <EditVendorDialog
          vendor={editingVendor}
          open={!!editingVendor}
          onOpenChange={(open) => !open && setEditingVendor(null)}
          onUpdate={onUpdateVendor}
          onDelete={onDeleteVendor}
        />
      )}
    </>
  )
}
