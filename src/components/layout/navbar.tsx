'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Wallet, BookUser, LayoutGrid, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useWeddingContext } from '@/providers/wedding-provider'
import { usePresence } from '@/hooks/use-presence'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'דשבורד', icon: LayoutDashboard },
  { href: '/guests', label: 'אורחים', icon: Users },
  { href: '/tables', label: 'שולחנות', icon: LayoutGrid },
  { href: '/budget', label: 'תקציב', icon: Wallet },
  { href: '/contacts', label: 'אנשי קשר', icon: BookUser },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { wedding } = useWeddingContext()
  const { partnerOnline, partnerEmail } = usePresence(wedding?.id)

  if (pathname === '/setup' || pathname?.startsWith('/auth')) return null

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="hidden md:flex items-center justify-between border-b bg-white/80 backdrop-blur-sm px-6 py-3 sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-primary">
          חתונה שלנו 💍
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
          {partnerOnline && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={partnerEmail ?? 'שותף/ה מחובר/ת'}>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden lg:inline">
                {partnerEmail ? partnerEmail.split('@')[0] : 'שותף/ה'} מחובר/ת
              </span>
            </div>
          )}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs max-w-[120px] truncate">{user.email}</span>
            </Button>
          )}
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
