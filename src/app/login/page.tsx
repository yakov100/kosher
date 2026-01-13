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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Logo & Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-100">
            <Heart className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">שמור על עצמך</h1>
        <p className="text-gray-500">מעקב משקל והליכה לשמירה על הבריאות</p>
      </div>

      {/* Features */}
      <div className="flex gap-6 mb-8">
        <div className="flex flex-col items-center text-center">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 mb-2">
            <Footprints size={24} />
          </div>
          <span className="text-xs text-gray-400">מעקב הליכה</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="p-2 rounded-xl bg-violet-100 text-violet-600 mb-2">
            <Scale size={24} />
          </div>
          <span className="text-xs text-gray-400">מעקב משקל</span>
        </div>
      </div>

      {/* Form */}
      <Card className="w-full max-w-sm">
        <div className="flex mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-center font-medium transition-all border-b-2 ${
              mode === 'login'
                ? 'text-emerald-600 border-emerald-500'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            התחברות
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-center font-medium transition-all border-b-2 ${
              mode === 'signup'
                ? 'text-emerald-600 border-emerald-500'
                : 'text-gray-400 border-transparent hover:text-gray-600'
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
            <p className="text-sm text-rose-600 bg-rose-100 p-3 rounded-lg">{error}</p>
          )}

          {message && (
            <p className="text-sm text-emerald-600 bg-emerald-100 p-3 rounded-lg">{message}</p>
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
          <p className="text-center text-sm text-gray-400 mt-4">
            שכחת סיסמה?{' '}
            <a
              href="/forgot-password"
              className="text-emerald-600 hover:underline"
            >
              איפוס סיסמה
            </a>
          </p>
        )}
      </Card>

      <p className="text-xs text-gray-400 mt-8 text-center">
        בהתחברות אתה מסכים לתנאי השימוש ומדיניות הפרטיות
      </p>
    </div>
  )
}
