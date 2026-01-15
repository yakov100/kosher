'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="fixed bottom-6 left-6 z-40">
      <Link
        href="/settings"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-all hover:scale-110"
        title="הגדרות"
      >
        <Settings size={24} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]" />
      </Link>
    </nav>
  )
}
