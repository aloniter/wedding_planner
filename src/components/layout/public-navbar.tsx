'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Wallet, BookUser, LayoutGrid, Building2, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWeddingSlugContext } from '@/providers/wedding-slug-provider'
import { usePresence } from '@/hooks/use-presence'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

function getNavItems(slug: string) {
  return [
    { href: `/wedding/${slug}`, label: 'דשבורד', icon: LayoutDashboard },
    { href: `/wedding/${slug}/guests`, label: 'אורחים', icon: Users },
    { href: `/wedding/${slug}/venues`, label: 'אולמות', icon: Building2 },
    { href: `/wedding/${slug}/tables`, label: 'שולחנות', icon: LayoutGrid },
    { href: `/wedding/${slug}/budget`, label: 'תקציב', icon: Wallet },
    { href: `/wedding/${slug}/contacts`, label: 'אנשי קשר', icon: BookUser },
  ]
}

export function PublicNavbar({ slug }: { slug: string }) {
  const pathname = usePathname()
  const { wedding } = useWeddingSlugContext()
  const { viewerCount } = usePresence(wedding?.id)
  const [copied, setCopied] = useState(false)
  const navItems = getNavItems(slug)

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/wedding/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="hidden md:flex items-center justify-between border-b bg-white/80 backdrop-blur-sm px-6 py-3 sticky top-0 z-50">
        <Link href={`/wedding/${slug}`} className="text-xl font-bold text-primary">
          {wedding?.groom_name && wedding?.bride_name
            ? `${wedding.groom_name} & ${wedding.bride_name}`
            : 'חתונה שלנו'
          }
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-3">
          {viewerCount > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>{viewerCount} צופים</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <Link2 className="h-4 w-4" />
            <span className="text-xs">{copied ? 'הועתק!' : 'העתק קישור'}</span>
          </Button>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-white/95 backdrop-blur-sm z-50 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors min-w-[56px]',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
