'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWeight } from '@/hooks/useSupabase'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { ArrowRight, Scale, Calendar, Clock, MessageSquare, Trash2, Loader2 } from 'lucide-react'
import { format, parseISO, isAfter } from 'date-fns'

function AddWeightContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { weights, addWeight, updateWeight, deleteWeight } = useWeight()
  
  const editId = searchParams.get('id')
  const editRecord = editId ? weights.find(w => w.id === editId) : null
  
  const now = new Date()
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(format(now, 'yyyy-MM-dd'))
  const [time, setTime] = useState(format(now, 'HH:mm'))
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editRecord) {
      const recordedAt = parseISO(editRecord.recorded_at)
      setWeight(editRecord.weight.toString())
      setDate(format(recordedAt, 'yyyy-MM-dd'))
      setTime(format(recordedAt, 'HH:mm'))
      setNote(editRecord.note || '')
    }
  }, [editRecord])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const weightNum = parseFloat(weight)
    
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('נא להזין משקל תקין')
      return
    }

    if (weightNum < 20 || weightNum > 300) {
      if (!confirm('המשקל שהוזן נראה חריג. האם אתה בטוח?')) {
        return
      }
    }

    const recordedAt = new Date(`${date}T${time}`)
    
    if (isAfter(recordedAt, new Date())) {
      setError('לא ניתן להזין משקל לתאריך עתידי')
      return
    }

    setLoading(true)
    try {
      if (editRecord) {
        await updateWeight(editRecord.id, {
          weight: weightNum,
          recorded_at: recordedAt.toISOString(),
          note: note || undefined,
        })
      } else {
        await addWeight(weightNum, recordedAt.toISOString(), note || undefined)
      }
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editRecord) return
    
    if (!confirm('האם אתה בטוח שברצונך למחוק את הרשומה?')) {
      return
    }

    setDeleting(true)
    try {
      await deleteWeight(editRecord.id)
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה במחיקה')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 fade-in">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">
            {editRecord ? 'עריכת משקל' : 'הזנת משקל'}
          </h1>
        </div>
      </div>

      <Card className="fade-in stagger-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Weight */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Scale className="w-4 h-4" />
              משקל (ק״ג)
            </label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              max="500"
              required
              className="text-3xl font-bold text-center"
              dir="ltr"
            />
          </div>

          {/* Quick buttons */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setWeight((parseFloat(weight || '0') - 0.5).toFixed(1))}
              className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 text-xl font-bold hover:bg-slate-700 transition-colors"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setWeight((parseFloat(weight || '0') - 0.1).toFixed(1))}
              className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              -0.1
            </button>
            <button
              type="button"
              onClick={() => setWeight((parseFloat(weight || '0') + 0.1).toFixed(1))}
              className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              +0.1
            </button>
            <button
              type="button"
              onClick={() => setWeight((parseFloat(weight || '0') + 0.5).toFixed(1))}
              className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 text-xl font-bold hover:bg-slate-700 transition-colors"
            >
              +
            </button>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Calendar className="w-4 h-4" />
                תאריך
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="input-field w-full"
                dir="ltr"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Clock className="w-4 h-4" />
                שעה
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-field w-full"
                dir="ltr"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <MessageSquare className="w-4 h-4" />
              הערה (אופציונלי)
            </label>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 120))}
              placeholder="למשל: אחרי ארוחת בוקר"
              maxLength={120}
            />
            <p className="text-xs text-slate-500 mt-1">{note.length}/120</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
              size="lg"
            >
              {editRecord ? 'עדכון' : 'שמירה'}
            </Button>
            
            {editRecord && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                size="lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Tips */}
      <Card className="fade-in stagger-2">
        <h3 className="font-semibold text-white mb-2">💡 טיפים לשקילה מדויקת</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• שקול בבוקר, אחרי שירותים, לפני אכילה</li>
          <li>• השתמש באותו משקל תמיד</li>
          <li>• שקול על משטח קשיח ושטוח</li>
          <li>• התמקד בממוצע הנע, לא במספר היומי</li>
        </ul>
      </Card>
    </div>
  )
}

export default function AddWeightPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    }>
      <AddWeightContent />
    </Suspense>
  )
}
