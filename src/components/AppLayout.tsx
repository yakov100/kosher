'use client'

import Navigation from './Navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen pb-32">
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
      <Navigation />
    </div>
  )
}
