'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Wallet, BookUser, LayoutGrid, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'דשבורד', icon: LayoutDashboard },
  { href: '/guests', label: 'אורחים', icon: Users },
  { href: '/venues', label: 'אולמות', icon: Building2 },
  { href: '/tables', label: 'שולחנות', icon: LayoutGrid },
  { href: '/budget', label: 'תקציב', icon: Wallet },
  { href: '/contacts', label: 'אנשי קשר', icon: BookUser },
]

export function Navbar() {
  const pathname = usePathname()

  // Hide on setup, auth, and wedding (public dashboard) routes
  if (pathname === '/setup' || pathname?.startsWith('/auth') || pathname?.startsWith('/wedding')) return null

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="hidden md:flex items-center justify-between border-b bg-white/80 backdrop-blur-sm px-6 py-3 sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-primary">
          חתונה שלנו
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
        <div />
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
