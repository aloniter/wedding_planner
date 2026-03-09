'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, UserPlus, Check, X, Users } from 'lucide-react'

interface MemberWithEmail {
  id: string
  wedding_id: string
  user_id: string | null
  role: string
  invited_email: string | null
  email: string | null
  joined_at: string | null
}

interface PartnerInviteProps {
  weddingId: string
}

export function PartnerInvite({ weddingId }: PartnerInviteProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<MemberWithEmail[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function loadMembers() {
    if (!weddingId || !getSupabaseConfig()) return
    const supabase = createClient()
    const { data } = await supabase.rpc('get_wedding_members', { p_wedding_id: weddingId })
    if (data) setMembers(data as MemberWithEmail[])
    setLoadingMembers(false)
  }

  useEffect(() => {
    loadMembers()
  }, [weddingId])

  const currentUserRole = members.find(m => m.user_id === user?.id)?.role
  const isOwner = currentUserRole === 'owner'
  const hasPartner = members.some(m => m.role === 'partner' && m.user_id)
  const hasPendingInvite = members.some(m => m.role === 'partner' && !m.user_id)
  const pendingEmail = members.find(m => m.role === 'partner' && !m.user_id)?.invited_email

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading || !isOwner) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedEmail === user?.email) {
      setError('לא ניתן להזמין את עצמכם')
      setLoading(false)
      return
    }

    if (members.some(m => m.email === trimmedEmail || m.invited_email === trimmedEmail)) {
      setError('כתובת המייל הזו כבר משויכת לחתונה')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('project_members')
      .insert({ wedding_id: weddingId, user_id: null, role: 'partner', invited_email: trimmedEmail })

    if (insertError) {
      setError('שגיאה בשליחת ההזמנה')
      setLoading(false)
      return
    }

    await loadMembers()
    setSuccess(`הזמנה נשמרה! בקשו מ-${trimmedEmail} להירשם באפליקציה`)
    setEmail('')
    setLoading(false)
  }

  const handleRemoveInvite = async (memberId: string) => {
    if (!isOwner) return
    const supabase = createClient()
    await supabase.from('project_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
    setSuccess(null)
  }

  if (loadingMembers) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          שותפים לחתונה
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {(member.email ?? member.invited_email ?? '?')[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span dir="ltr" className="font-medium">
                    {member.email ?? member.invited_email ?? '—'}
                  </span>
                  {member.user_id === user?.id && (
                    <span className="text-xs text-muted-foreground">את/ה</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {member.role === 'owner' ? 'בעלים' : 'שותף/ה'}
                </span>
                {member.user_id ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <span className="text-xs text-amber-500">ממתין להרשמה</span>
                )}
                {isOwner && !member.user_id && member.role === 'partner' && (
                  <button
                    onClick={() => handleRemoveInvite(member.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isOwner && !hasPartner && !hasPendingInvite && (
          <form onSubmit={handleInvite} className="flex gap-2 pt-1">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="אימייל של בן/בת הזוג"
              dir="ltr"
              required
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            </Button>
          </form>
        )}

        {hasPendingInvite && isOwner && (
          <p className="text-xs text-amber-600 text-center">
            ממתינים ל-<span dir="ltr" className="font-medium">{pendingEmail}</span> — בקשו ממנה/ו להירשם לאפליקציה
          </p>
        )}

        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        {success && <p className="text-xs text-green-600 text-center">{success}</p>}
      </CardContent>
    </Card>
  )
}
