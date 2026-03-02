'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserPlus, Copy, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'

interface InvitePartnerDialogProps {
  weddingId: string
}

export function InvitePartnerDialog({ weddingId }: InvitePartnerDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/auth?invite=${weddingId}`
    : ''

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !user) return

    setLoading(true)
    setError(null)

    // Create a pending project_members row
    const { error: insertError } = await supabase
      .from('project_members')
      .insert({
        wedding_id: weddingId,
        user_id: user.id, // Temporary — will be replaced when partner accepts
        role: 'partner',
        invited_email: email.trim(),
      })

    if (insertError) {
      // If duplicate, that's fine
      if (!insertError.message.includes('duplicate')) {
        setError('שגיאה בשליחת ההזמנה')
        setLoading(false)
        return
      }
    }

    setLoading(false)
    setSent(true)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
    }
  }

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setEmail('')
      setSent(false)
      setError(null)
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 ml-1" />
          הזמן שותף/ה
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הזמנת שותף/ה לניהול</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
            <p className="text-sm text-muted-foreground">
              שלחו את הקישור הבא ל-<span className="font-medium text-foreground">{email}</span>:
            </p>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly dir="ltr" className="text-xs" />
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              לאחר שיתחבר/ו עם הקישור, יוכלו לראות ולערוך את כל נתוני החתונה
            </p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partner-email">כתובת אימייל של השותף/ה</Label>
              <Input
                id="partner-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="partner@example.com"
                dir="ltr"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  שולח...
                </>
              ) : (
                'צור קישור הזמנה'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">או</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">שלחו קישור ישיר</p>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly dir="ltr" className="text-xs" />
                <Button type="button" variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
