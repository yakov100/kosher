'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Footprints, Scale, Heart } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        
        if (error) throw error
        setMessage('נשלח אליך אימייל לאימות. בדוק את תיבת הדואר שלך.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      const error = err as Error
      if (error.message.includes('Invalid login credentials')) {
        setError('אימייל או סיסמה שגויים')
      } else if (error.message.includes('User already registered')) {
        setError('משתמש כבר קיים. נסה להתחבר')
      } else {
        setError(error.message || 'שגיאה בהתחברות')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      {/* Logo & Branding */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-3 mb-5">
          <div className="p-4 rounded-xl bg-[var(--primary)] border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
            <Heart className="w-10 h-10 text-black" />
          </div>
        </div>
        <h1 className="text-5xl font-black text-[var(--foreground)] mb-3 uppercase tracking-wide">שמור על עצמך</h1>
        <p className="text-lg font-bold text-[var(--muted-foreground)]">מעקב משקל והליכה לשמירה על הבריאות</p>
      </div>

      {/* Features */}
      <div className="flex gap-6 mb-10">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-xl bg-[var(--accent)] border-2 border-[var(--border)] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] mb-2">
            <Footprints size={28} className="text-black" />
          </div>
          <span className="text-xs font-bold text-[var(--foreground)] uppercase">מעקב הליכה</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-xl bg-[var(--secondary)] border-2 border-[var(--border)] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] mb-2">
            <Scale size={28} className="text-white" />
          </div>
          <span className="text-xs font-bold text-[var(--foreground)] uppercase">מעקב משקל</span>
        </div>
      </div>

      {/* Form */}
      <Card className="w-full max-w-sm">
        <div className="flex mb-6 gap-2">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-center font-black uppercase transition-all border-2 border-[var(--border)] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] ${
              mode === 'login'
                ? 'bg-[var(--primary)] text-black'
                : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]'
            }`}
          >
            התחברות
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-center font-black uppercase transition-all border-2 border-[var(--border)] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] ${
              mode === 'signup'
                ? 'bg-[var(--primary)] text-black'
                : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]'
            }`}
          >
            הרשמה
          </button>
        </div>

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

          <Input
            type="password"
            label="סיסמה"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            dir="ltr"
          />

          {error && (
            <p className="text-sm font-bold text-white bg-[var(--secondary)] border-2 border-[var(--border)] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] p-3 rounded-xl">{error}</p>
          )}

          {message && (
            <p className="text-sm font-bold text-black bg-[var(--accent)] border-2 border-[var(--border)] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] p-3 rounded-xl">{message}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
          >
            {mode === 'login' ? 'התחבר' : 'הירשם'}
          </Button>
        </form>

        {mode === 'login' && (
          <p className="text-center text-sm font-bold text-[var(--foreground)] mt-4">
            שכחת סיסמה?{' '}
            <a
              href="/forgot-password"
              className="text-[var(--accent)] hover:underline font-black"
            >
              איפוס סיסמה
            </a>
          </p>
        )}
      </Card>

      <p className="text-xs font-medium text-[var(--muted-foreground)] mt-8 text-center">
        בהתחברות אתה מסכים לתנאי השימוש ומדיניות הפרטיות
      </p>
    </div>
  )
}
