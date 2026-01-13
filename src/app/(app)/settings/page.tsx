'use client'

import { useState, useEffect } from 'react'
import { Save, Target, Calendar, Bell, Lightbulb, LogOut, Timer } from 'lucide-react'
import { useSettings, useUser } from '@/hooks/useSupabase'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { settings, updateSettings, loading } = useSettings()
  const supabase = createClient()

  const [dailyGoal, setDailyGoal] = useState('30')
  const [weeklyGoalDays, setWeeklyGoalDays] = useState('5')
  const [showTip, setShowTip] = useState(true)
  const [showChallenge, setShowChallenge] = useState(true)
  const [reminderWalkingTime, setReminderWalkingTime] = useState('')
  const [reminderTipTime, setReminderTipTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setDailyGoal(settings.daily_walking_minutes_goal.toString())
      setWeeklyGoalDays(settings.weekly_goal_days.toString())
      setShowTip(settings.show_daily_tip)
      setShowChallenge(settings.show_daily_challenge)
      setReminderWalkingTime(settings.reminder_walking_time || '')
      setReminderTipTime(settings.reminder_tip_time || '')
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      await updateSettings({
        daily_walking_minutes_goal: parseInt(dailyGoal) || 30,
        weekly_goal_days: Math.min(7, Math.max(1, parseInt(weeklyGoalDays) || 5)),
        show_daily_tip: showTip,
        show_daily_challenge: showChallenge,
        reminder_walking_time: reminderWalkingTime || null,
        reminder_tip_time: reminderTipTime || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-emerald-500">טוען...</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-gray-700">הגדרות</h1>
        <p className="text-gray-500 text-sm">{user?.email}</p>
      </header>

      {/* Goals */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
            <Target size={20} />
          </div>
          <h2 className="font-semibold text-lg text-gray-700">יעדים</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Timer className="w-4 h-4" />
              יעד דקות הליכה יומי
            </label>
            <Input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              min={5}
              max={180}
            />
            <p className="text-xs text-gray-400 mt-1">מומלץ: 20-45 דקות</p>
          </div>

          {/* Quick select buttons for walking goal */}
          <div className="flex flex-wrap gap-2">
            {[15, 20, 30, 45, 60, 90].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setDailyGoal(num.toString())}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  dailyGoal === num.toString()
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {num} דק׳
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              יעד ימי יעד בשבוע
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <button
                  key={num}
                  onClick={() => setWeeklyGoalDays(num.toString())}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    weeklyGoalDays === num.toString()
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100/80 text-gray-500 hover:bg-gray-200/80'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Tips & Challenges */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
            <Lightbulb size={20} />
          </div>
          <h2 className="font-semibold text-lg text-gray-700">טיפים ואתגרים</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl bg-gray-100/60 cursor-pointer">
            <span className="text-gray-600">הצג טיפ יומי</span>
            <input
              type="checkbox"
              checked={showTip}
              onChange={(e) => setShowTip(e.target.checked)}
              className="w-5 h-5 rounded bg-white border-gray-300 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-gray-100/60 cursor-pointer">
            <span className="text-gray-600">הצג אתגר יומי</span>
            <input
              type="checkbox"
              checked={showChallenge}
              onChange={(e) => setShowChallenge(e.target.checked)}
              className="w-5 h-5 rounded bg-white border-gray-300 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0"
            />
          </label>
        </div>
      </Card>

      {/* Reminders */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-violet-100 text-violet-600">
            <Bell size={20} />
          </div>
          <h2 className="font-semibold text-lg text-gray-700">תזכורות</h2>
        </div>

        <div className="space-y-4">
          <Input
            type="time"
            label="תזכורת להזנת הליכה"
            value={reminderWalkingTime}
            onChange={(e) => setReminderWalkingTime(e.target.value)}
            hint="השאר ריק לביטול"
          />

          <Input
            type="time"
            label="תזכורת לטיפ היומי"
            value={reminderTipTime}
            onChange={(e) => setReminderTipTime(e.target.value)}
            hint="השאר ריק לביטול"
          />
        </div>
      </Card>

      {/* Save Button */}
      <Button
        variant="primary"
        fullWidth
        size="lg"
        icon={<Save size={20} />}
        onClick={handleSave}
        loading={saving}
      >
        {saved ? 'נשמר! ✓' : 'שמור הגדרות'}
      </Button>

      {/* Logout */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
            <LogOut size={20} />
          </div>
          <h2 className="font-semibold text-lg text-gray-700">חשבון</h2>
        </div>

        <Button
          variant="danger"
          fullWidth
          onClick={handleLogout}
        >
          התנתק
        </Button>
      </Card>
    </div>
  )
}
