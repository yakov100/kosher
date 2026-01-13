'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Timer, Scale, TrendingUp, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'דשבורד', icon: Home },
  { href: '/steps', label: 'הליכה', icon: Timer },
  { href: '/weight', label: 'משקל', icon: Scale },
  { href: '/insights', label: 'תובנות', icon: TrendingUp },
  { href: '/settings', label: 'הגדרות', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-gray-200/60 safe-area-bottom bg-white/90">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-emerald-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <div className={cn(
                  'p-2 rounded-xl transition-all duration-200',
                  isActive && 'bg-emerald-100'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
