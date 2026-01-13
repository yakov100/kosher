'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Timer, Scale, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'דשבורד' },
  { href: '/steps', icon: Timer, label: 'הליכה' },
  { href: '/weight', icon: Scale, label: 'משקל' },
  { href: '/insights', icon: BarChart3, label: 'תובנות' },
  { href: '/settings', icon: Settings, label: 'הגדרות' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-lg border-t border-slate-700/50">
      <div className="max-w-lg mx-auto px-2">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                    isActive
                      ? 'text-teal-400'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Icon size={22} className={cn(isActive && 'drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]')} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
