'use client'

import { useState } from 'react'
import { SendInviteDialog } from './send-invite-dialog'
import type { Guest, GuestUpdate, Wedding, WeddingUpdate } from '@/lib/types'

interface BulkSendDialogProps {
  guests: Guest[]
  wedding: Wedding
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateGuest: (id: string, updates: GuestUpdate) => void
  onUpdateWedding?: (updates: WeddingUpdate) => void
}

export function BulkSendDialog({ guests, wedding, open, onOpenChange, onUpdateGuest, onUpdateWedding }: BulkSendDialogProps) {
  const [index, setIndex] = useState(0)

  if (!open || guests.length === 0 || index >= guests.length) return null

  const close = () => {
    setIndex(0)
    onOpenChange(false)
  }

  const handleNext = () => {
    if (index + 1 >= guests.length) {
      close()
      return
    }
    setIndex(index + 1)
  }

  return (
    <SendInviteDialog
      guest={guests[index]}
      wedding={wedding}
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
      onUpdateGuest={onUpdateGuest}
      onUpdateWedding={onUpdateWedding}
      queuePosition={index + 1}
      queueTotal={guests.length}
      onNext={handleNext}
    />
  )
}
