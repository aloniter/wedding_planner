'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { generateWhatsAppMessage, generateWhatsAppLink, generateRsvpUrl, copyToClipboard } from '@/lib/rsvp-invite'
import { MessageCircle, Copy, Link, Check } from 'lucide-react'
import type { Guest, Wedding, GuestUpdate } from '@/lib/types'

interface SendInviteDialogProps {
  guest: Guest
  wedding: Wedding
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateGuest: (id: string, updates: GuestUpdate) => void
}

export function SendInviteDialog({ guest, wedding, open, onOpenChange, onUpdateGuest }: SendInviteDialogProps) {
  const [copiedField, setCopiedField] = useState<'message' | 'link' | null>(null)

  const message = generateWhatsAppMessage(guest, wedding)
  const rsvpUrl = generateRsvpUrl(guest.rsvp_token)
  const hasPhone = !!guest.phone

  const markAsSent = () => {
    onUpdateGuest(guest.id, { invitation_sent_at: new Date().toISOString() })
  }

  const handleWhatsApp = () => {
    if (!guest.phone) return
    const link = generateWhatsAppLink(guest.phone, message)
    window.open(link, '_blank')
    markAsSent()
    onOpenChange(false)
  }

  const handleCopyMessage = async () => {
    const success = await copyToClipboard(message)
    if (success) {
      setCopiedField('message')
      markAsSent()
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const handleCopyLink = async () => {
    const success = await copyToClipboard(rsvpUrl)
    if (success) {
      setCopiedField('link')
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>שליחת הזמנה ל{guest.full_name}</DialogTitle>
          <DialogDescription>
            שלחו את ההזמנה דרך WhatsApp או העתיקו את ההודעה
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message preview */}
          <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-line leading-relaxed">
            {message}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {hasPhone && (
              <Button onClick={handleWhatsApp} className="w-full h-11 gap-2">
                <MessageCircle className="h-4 w-4" />
                פתח ב-WhatsApp
              </Button>
            )}

            <Button variant="outline" onClick={handleCopyMessage} className="w-full h-11 gap-2">
              {copiedField === 'message' ? (
                <><Check className="h-4 w-4 text-green-600" /> הועתק!</>
              ) : (
                <><Copy className="h-4 w-4" /> העתק הודעה</>
              )}
            </Button>

            <Button variant="outline" onClick={handleCopyLink} className="w-full h-11 gap-2">
              {copiedField === 'link' ? (
                <><Check className="h-4 w-4 text-green-600" /> הועתק!</>
              ) : (
                <><Link className="h-4 w-4" /> העתק קישור RSVP</>
              )}
            </Button>
          </div>

          {!hasPhone && (
            <p className="text-xs text-muted-foreground text-center">
              לאורח זה לא הוזן טלפון — העתיקו את ההודעה ושלחו ידנית
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
