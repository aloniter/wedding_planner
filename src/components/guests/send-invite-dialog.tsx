'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  getWhatsAppInvitePayload,
  generateWhatsAppLink,
  copyToClipboard,
  shareImageViaWhatsApp,
  getNativeFileShareSupport,
  fetchImageAsFile,
} from '@/lib/rsvp-invite'
import { MessageCircle, Copy, Link, Check, Loader2, AlertCircle } from 'lucide-react'
import type { Guest, Wedding, GuestUpdate } from '@/lib/types'

interface SendInviteDialogProps {
  guest: Guest
  wedding: Wedding
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateGuest: (id: string, updates: GuestUpdate) => void
}

type CopiedField = 'message' | 'link' | null
type NoticeTone = 'info' | 'success' | 'warning' | 'error'
type ImageShareStatus = 'idle' | 'loading' | 'ready' | 'error'

interface InviteNotice {
  tone: NoticeTone
  text: string
}

const NOTICE_STYLES: Record<NoticeTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
}

function getBlockedImageShareMessage(reason: 'insecure-context' | 'not-mobile' | 'missing-api' | 'supported'): string {
  switch (reason) {
    case 'insecure-context':
      return 'ב-iPhone שיתוף תמונה אמיתית ל-WhatsApp עובד רק מכתובת מאובטחת. כתובת כמו http://192.168.x.x אינה נתמכת. פתחו את האפליקציה דרך HTTPS, טאנל מאובטח, או דיפלוי ואז נסו שוב.'
    case 'not-mobile':
      return 'שליחת תמונה אמיתית נתמכת רק מהטלפון עם חלון שיתוף מקורי. אם אתם על מחשב, בטלו את סימון התמונה כדי לשלוח טקסט בלבד.'
    case 'missing-api':
      return 'הדפדפן הזה לא תומך בשיתוף קובץ תמונה דרך חלון השיתוף. נסו Safari מעודכן ב-iPhone או שלחו ללא תמונה.'
    default:
      return 'ייפתח חלון השיתוף של הטלפון. בחרו WhatsApp. הכיתוב יועתק אוטומטית כדי שתוכלו להדביק אותו אם WhatsApp ישלח רק את התמונה.'
  }
}

export function SendInviteDialog({ guest, wedding, open, onOpenChange, onUpdateGuest }: SendInviteDialogProps) {
  const imageFileRef = useRef<File | null>(null)
  const [copiedField, setCopiedField] = useState<CopiedField>(null)
  const [sharing, setSharing] = useState(false)
  const [includeImage, setIncludeImage] = useState(true)
  const [notice, setNotice] = useState<InviteNotice | null>(null)
  const [readyToConfirm, setReadyToConfirm] = useState(false)
  const [imageShareStatus, setImageShareStatus] = useState<ImageShareStatus>('idle')

  const invite = getWhatsAppInvitePayload(guest, wedding)
  const [caption, setCaption] = useState(invite.caption)
  const hasPhone = !!guest.phone
  const hasImage = !!invite.imageUrl
  const sendWithImage = hasImage && includeImage
  const fileShareSupport = getNativeFileShareSupport()
  const imageShareBlocked = sendWithImage && !fileShareSupport.supported

  useEffect(() => {
    if (open) setCaption(invite.caption)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guest.id])

  useEffect(() => {
    let cancelled = false
    imageFileRef.current = null

    if (!open || !sendWithImage || !invite.imageUrl || imageShareBlocked) {
      setImageShareStatus('idle')
      return () => {
        cancelled = true
      }
    }

    const imageUrl = invite.imageUrl

    async function preloadImage() {
      setImageShareStatus('loading')

      try {
        const file = await fetchImageAsFile(imageUrl)
        if (cancelled) return
        imageFileRef.current = file
        setImageShareStatus('ready')
      } catch {
        if (cancelled) return
        setImageShareStatus('error')
      }
    }

    void preloadImage()

    return () => {
      cancelled = true
    }
  }, [open, sendWithImage, invite.imageUrl, imageShareBlocked])

  const markAsSent = () => {
    onUpdateGuest(guest.id, { invitation_sent_at: new Date().toISOString() })
    onOpenChange(false)
  }

  const handleWhatsApp = async () => {
    if (!guest.phone) return

    if (sendWithImage) {
      if (!invite.imageUrl || imageShareBlocked) {
        setReadyToConfirm(false)
        setNotice({
          tone: 'warning',
          text: getBlockedImageShareMessage(fileShareSupport.reason),
        })
        return
      }

      if (!imageFileRef.current) {
        setReadyToConfirm(false)
        setNotice({
          tone: imageShareStatus === 'error' ? 'error' : 'warning',
          text: imageShareStatus === 'error'
            ? 'לא הצלחנו להכין את התמונה לשליחה. רעננו את הדף או נסו שוב בעוד רגע.'
            : 'התמונה עדיין נטענת לקראת השליחה. חכו רגע ונסו שוב.',
        })
        return
      }

      setSharing(true)
      try {
        const result = await shareImageViaWhatsApp(imageFileRef.current, caption)

        if (result.status === 'shared') {
          setReadyToConfirm(true)
          setNotice({
            tone: 'success',
            text: result.captionCopied
              ? 'חלון השיתוף נפתח עם התמונה האמיתית. אם הכיתוב לא נכנס ל-WhatsApp, פשוט הדביקו אותו מהלוח ואז סמנו שנשלח.'
              : 'חלון השיתוף נפתח עם התמונה האמיתית. אחרי השליחה ב-WhatsApp חזרו לכאן וסמנו שנשלח.',
          })
          return
        }

        if (result.status === 'cancelled') {
          setReadyToConfirm(false)
          setNotice({
            tone: 'warning',
            text: result.captionCopied
              ? 'השיתוף בוטל. הכיתוב כבר הועתק ללוח, כך שאפשר לנסות שוב ולהדביק אותו אם צריך.'
              : 'השיתוף בוטל. אפשר לנסות שוב.',
          })
          return
        }

        if (result.status === 'unsupported') {
          setReadyToConfirm(false)
          setNotice({
            tone: 'warning',
            text: getBlockedImageShareMessage(fileShareSupport.reason),
          })
          return
        }

        setReadyToConfirm(false)
        setNotice({
          tone: 'error',
          text: result.captionCopied
            ? 'לא הצלחנו לפתוח שיתוף עם תמונה. הכיתוב הועתק ללוח ותוכלו לנסות שוב.'
            : 'לא הצלחנו לפתוח שיתוף עם תמונה. נסו שוב בעוד רגע.',
        })
      } finally {
        setSharing(false)
      }

      return
    }

    handleDirectGuestChat()
  }

  const handleDirectGuestChat = () => {
    if (!guest.phone) return

    const link = generateWhatsAppLink(guest.phone, caption)
    window.open(link, '_blank', 'noopener,noreferrer')
    setReadyToConfirm(true)
    setNotice({
      tone: 'info',
      text: sendWithImage
        ? 'הצ׳אט של האורח נפתח ישירות ב-WhatsApp עם הטקסט והקישור. את התמונה תצטרכו לצרף ידנית מתוך WhatsApp.'
        : 'WhatsApp נפתח עם ההודעה והקישור. אחרי השליחה חזרו לכאן וסמנו שנשלח.',
    })
  }

  const handleCopyMessage = async () => {
    const success = await copyToClipboard(caption)
    if (success) {
      setCopiedField('message')
      setReadyToConfirm(true)
      setNotice({
        tone: 'info',
        text: 'ההודעה עם קישור ה-RSVP הועתקה. אפשר להדביק אותה ככיתוב לתמונה או כהודעה רגילה ואז לסמן שנשלח.',
      })
      setTimeout(() => setCopiedField(null), 2000)
      return
    }

    setNotice({
      tone: 'error',
      text: 'לא הצלחנו להעתיק את ההודעה. נסו שוב.',
    })
  }

  const handleCopyLink = async () => {
    const success = await copyToClipboard(invite.rsvpUrl)
    if (success) {
      setCopiedField('link')
      setNotice({
        tone: 'info',
        text: 'קישור ה-RSVP הועתק.',
      })
      setTimeout(() => setCopiedField(null), 2000)
      return
    }

    setNotice({
      tone: 'error',
      text: 'לא הצלחנו להעתיק את הקישור. נסו שוב.',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92dvh,48rem)] overflow-hidden p-0 sm:max-w-md" dir="rtl">
        <div className="flex max-h-[min(92dvh,48rem)] flex-col">
          <DialogHeader className="shrink-0 border-b bg-background px-4 pt-5 pb-3 text-right sm:px-6">
            <DialogTitle className="pl-10">שליחת הזמנה ל{guest.full_name}</DialogTitle>
            <DialogDescription>
              שלחו דרך WhatsApp עם טקסט וקישור RSVP. תמונה אמיתית נשלחת רק ממכשיר שתומך בשיתוף קבצים.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            <div className="space-y-4">
              {hasImage && (
                <div className="rounded-xl overflow-hidden border shadow-sm">
                  <img
                    src={invite.imageUrl!}
                    alt="Save the Date"
                    className="max-h-[36dvh] w-full object-contain sm:max-h-[44dvh]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">הודעה</Label>
                  {caption !== invite.caption && (
                    <button
                      type="button"
                      onClick={() => setCaption(invite.caption)}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      החזר לברירת מחדל
                    </button>
                  )}
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={5}
                  dir="rtl"
                  className="w-full resize-y rounded-lg bg-muted p-3 text-[13px] leading-6 whitespace-pre-line break-words outline-none ring-1 ring-transparent focus:ring-pink-400 sm:text-sm sm:leading-relaxed"
                />
              </div>

              {hasImage && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeImage}
                    onChange={(e) => setIncludeImage(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-pink-500"
                  />
                  <span className="text-sm text-muted-foreground">שלח עם תמונת Save the Date אמיתית</span>
                </label>
              )}

              {sendWithImage && (
                <div className={`rounded-lg border px-3 py-2 text-sm ${imageShareBlocked ? NOTICE_STYLES.warning : NOTICE_STYLES.info}`}>
                  {imageShareBlocked
                    ? getBlockedImageShareMessage(fileShareSupport.reason)
                    : imageShareStatus === 'loading'
                      ? 'מכינים את התמונה לשליחה ב-WhatsApp. כשהטעינה תסתיים תוכלו לפתוח את חלון השיתוף.'
                      : imageShareStatus === 'error'
                        ? 'הייתה בעיה בהכנת התמונה לשליחה. נסו לסגור ולפתוח שוב את החלון, או לרענן את הדף.'
                        : 'ייפתח חלון השיתוף של הטלפון. בחרו WhatsApp ואז את הצ׳אט הרצוי. אם רוצים לפתוח ישר את מספר האורח, השתמשו בכפתור הצ׳אט הישיר למטה.'}
                </div>
              )}

              {notice && (
                <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${NOTICE_STYLES[notice.tone]}`}>
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{notice.text}</p>
                </div>
              )}

              {!hasPhone && (
                <p className="text-center text-xs text-muted-foreground">
                  לאורח זה לא הוזן טלפון. העתיקו את ההודעה, שלחו ידנית, ואז סמנו שנשלח.
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t bg-background/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur sm:px-6">
            <div className="flex flex-col gap-2">
              {hasPhone && (
                <Button
                  onClick={handleWhatsApp}
                  disabled={sharing || imageShareBlocked || (sendWithImage && imageShareStatus === 'loading')}
                  className="h-11 w-full gap-2"
                >
                  {sharing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> פותח שיתוף...</>
                  ) : sendWithImage && imageShareStatus === 'loading' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> מכין תמונה...</>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4" />
                      {sendWithImage ? 'שתף תמונה אמיתית ב-WhatsApp' : 'פתח WhatsApp ללא תמונה'}
                    </>
                  )}
                </Button>
              )}

              {hasPhone && sendWithImage && (
                <Button
                  variant="outline"
                  onClick={handleDirectGuestChat}
                  className="h-11 w-full gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  פתח צ׳אט ישיר למספר האורח
                </Button>
              )}

              <Button variant="outline" onClick={handleCopyMessage} className="h-11 w-full gap-2">
                {copiedField === 'message' ? (
                  <><Check className="h-4 w-4 text-green-600" /> הועתק!</>
                ) : (
                  <><Copy className="h-4 w-4" /> העתק הודעה</>
                )}
              </Button>

              <Button variant="outline" onClick={handleCopyLink} className="h-11 w-full gap-2">
                {copiedField === 'link' ? (
                  <><Check className="h-4 w-4 text-green-600" /> הועתק!</>
                ) : (
                  <><Link className="h-4 w-4" /> העתק קישור RSVP</>
                )}
              </Button>

              {readyToConfirm && (
                <Button onClick={markAsSent} variant="secondary" className="h-11 w-full gap-2">
                  <Check className="h-4 w-4" />
                  סמן שההזמנה נשלחה
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
