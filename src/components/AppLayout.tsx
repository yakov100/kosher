'use client'

import Navigation from './Navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-[var(--background)] flex flex-col relative">
      <main className="flex-1 overflow-y-auto w-full max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-6 pb-32 transition-all duration-300 ease-in-out">
        {children}
      </main>
      <Navigation />
    </div>
  )
}
