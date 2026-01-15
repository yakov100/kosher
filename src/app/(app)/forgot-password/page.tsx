'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      
      if (error) throw error
      setSuccess(true)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'שגיאה בשליחת הבקשה')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-sm text-center">
          <div className="p-4 rounded-full bg-teal-500/20 text-teal-400 w-fit mx-auto mb-4">
            <Mail size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">בדוק את האימייל שלך</h1>
          <p className="text-slate-400 mb-6">
            שלחנו לך קישור לאיפוס הסיסמה ל-{email}
          </p>
          <Link href="/login">
            <Button variant="secondary" fullWidth>
              חזור להתחברות
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6"
        >
          <ArrowRight size={18} />
          חזרה להתחברות
        </Link>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">שכחת סיסמה?</h1>
        <p className="text-slate-400 text-sm mb-6">
          הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="אימייל"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
          >
            שלח קישור לאיפוס
          </Button>
        </form>
      </Card>
    </div>
  )
}
