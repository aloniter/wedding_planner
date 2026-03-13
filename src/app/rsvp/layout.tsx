import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'אישור הגעה - חתונה שלנו',
  description: 'אישור הגעה לחתונה',
}

export default function RsvpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white" dir="rtl">
      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        {children}
      </div>
    </div>
  )
}
