import { Navigation } from '@/components/ui/Navigation'
import { ChatAssistant } from '@/components/ai/ChatAssistant'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-[var(--background)] flex flex-col relative">
      <main className="flex-1 overflow-y-auto w-full max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-6 pb-32">
        {children}
      </main>
      <Navigation />
      <ChatAssistant />
    </div>
  )
}
