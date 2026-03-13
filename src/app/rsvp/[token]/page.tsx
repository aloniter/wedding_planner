import { getGuestByToken } from '@/app/rsvp/actions'
import { RsvpForm } from '@/components/rsvp/rsvp-form'
import { RSVP_STRINGS } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'

interface RsvpPageProps {
  params: Promise<{ token: string }>
}

export default async function RsvpPage({ params }: RsvpPageProps) {
  const { token } = await params
  const data = await getGuestByToken(token)

  if (!data) {
    return (
      <Card className="text-center">
        <CardContent className="space-y-3 pt-2">
          <div className="text-4xl">💌</div>
          <h1 className="text-xl font-bold text-foreground">
            {RSVP_STRINGS.invalidLink}
          </h1>
          <p className="text-sm text-muted-foreground">
            {RSVP_STRINGS.invalidLinkDescription}
          </p>
        </CardContent>
      </Card>
    )
  }

  return <RsvpForm data={data} token={token} />
}
