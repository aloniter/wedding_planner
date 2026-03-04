'use client'

import { Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { VenueCard } from '@/components/venues/venue-card'
import { AddVenueDialog } from '@/components/venues/add-venue-dialog'
import { useWeddingSlugContext } from '@/providers/wedding-slug-provider'
import { useVenueTracker } from '@/hooks/use-venue-tracker'

export default function VenuesPage() {
  const { wedding } = useWeddingSlugContext()
  const { venues, loading, stats, addVenue, updateVenue, deleteVenue } = useVenueTracker(wedding?.id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
        טוען אולמות...
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-8">
      <PageHeader
        title="השוואת אולמות"
        subtitle="עקבו אחרי האולמות שאתם בוחנים, תאריכים פנויים ומחירים"
        action={wedding ? <AddVenueDialog weddingId={wedding.id} onAdd={addVenue} /> : undefined}
      />

      {venues.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2 text-sm">
            <span className="text-muted-foreground">סה&quot;כ</span>
            <span className="font-bold text-lg">{stats.total}</span>
            <span className="text-muted-foreground">אולמות</span>
          </div>
          {stats.liked > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-4 py-2 text-sm">
              <span className="text-green-700">אהבנו</span>
              <span className="font-bold text-lg text-green-800">{stats.liked}</span>
            </div>
          )}
          {stats.chosen > 0 && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-lg px-4 py-2 text-sm">
              <span className="text-purple-700">נבחר</span>
              <span className="font-bold text-lg text-purple-800">{stats.chosen}</span>
            </div>
          )}
        </div>
      )}

      {venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4 text-muted-foreground">
          <Building2 className="h-16 w-16 opacity-20" />
          <div>
            <p className="text-lg font-medium">עדיין אין אולמות</p>
            <p className="text-sm mt-1">הוסיפו את האולם הראשון שאתם בוחנים</p>
          </div>
          {wedding && <AddVenueDialog weddingId={wedding.id} onAdd={addVenue} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...venues]
            .sort((a, b) => {
              const order = { 'נבחר': 0, 'אהבנו': 1, 'נקבעה פגישה': 2, 'בבדיקה': 3, 'לא מתאים': 4 }
              return (order[a.status] ?? 5) - (order[b.status] ?? 5)
            })
            .map(venue => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onUpdate={updateVenue}
                onDelete={deleteVenue}
              />
            ))}
        </div>
      )}
    </div>
  )
}
