'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Lock, Check } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      return
    }

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })
      
      if (error) throw error
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'שגיאה בעדכון הסיסמה')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-sm text-center">
          <div className="p-4 rounded-full bg-teal-500/20 text-teal-400 w-fit mx-auto mb-4">
            <Check size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">הסיסמה עודכנה!</h1>
          <p className="text-slate-400">
            מעביר אותך לדשבורד...
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <div className="p-3 rounded-full bg-teal-500/20 text-teal-400 w-fit mx-auto mb-4">
          <Lock size={24} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-100 mb-2 text-center">איפוס סיסמה</h1>
        <p className="text-slate-400 text-sm mb-6 text-center">
          הזן סיסמה חדשה לחשבון שלך
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="סיסמה חדשה"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            dir="ltr"
          />

          <Input
            type="password"
            label="אימות סיסמה"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
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
            עדכן סיסמה
          </Button>
        </form>
      </Card>
    </div>
  )
}
