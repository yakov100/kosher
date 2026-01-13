import { Navigation } from '@/components/ui/Navigation'
import { ChatAssistant } from '@/components/ai/ChatAssistant'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
      <Navigation />
      <ChatAssistant />
    </div>
  )
}
