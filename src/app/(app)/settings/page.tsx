'use client'

import { useState, useEffect } from 'react'
import { Save, Target, Bell, Lightbulb, LogOut, Timer, Sparkles, Settings2, User, ChevronLeft, Clock, Zap } from 'lucide-react'
import { useSettings, useUser } from '@/hooks/useSupabase'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/ui/BackButton'

// Modern Toggle Switch Component
function ToggleSwitch({ checked, onChange, label, description }: { 
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white cursor-pointer group hover:from-slate-100 hover:to-slate-50 hover:scale-[1.01] transition-all duration-300">
      <div className="flex-1">
        <span className="text-slate-800 font-medium">{label}</span>
        {description && (
          <p className="text-xs text-slate-600 mt-0.5">{description}</p>
        )}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-14 h-8 rounded-full transition-all duration-300 ${
          checked 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-md shadow-emerald-400/20' 
            : 'bg-slate-200'
        }`}>
          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
            checked ? 'right-1' : 'right-7'
          }`} />
        </div>
      </div>
    </label>
  )
}

// Section Card Component
function SectionCard({ 
  icon: Icon, 
  iconColor, 
  iconBg, 
  title, 
  children,
  className = ''
}: { 
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--card)] to-[var(--card)]/95 border border-[var(--border)]/30 p-5 ${className}`}>
      {/* Decorative gradient blob */}
      <div className={`absolute -top-12 -left-12 w-32 h-32 ${iconBg} rounded-full blur-3xl opacity-15`} />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-2.5 rounded-2xl ${iconBg} ${iconColor} shadow-md`}>
            <Icon size={22} />
          </div>
          <h2 className="font-bold text-lg text-slate-800">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  )
}

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center animate-pulse">
            <Settings2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[var(--muted-foreground)]">טוען הגדרות...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <header className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Settings2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">הגדרות</h1>
              <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {user?.email}
              </p>
            </div>
          </div>
          <BackButton />
        </div>
      </header>

      {/* Daily Goal Section */}
      <SectionCard 
        icon={Target} 
        iconColor="text-emerald-500" 
        iconBg="bg-emerald-500/20"
        title="יעד הליכה יומי"
      >
        <div className="space-y-5">
          {/* Minutes label */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Timer className="w-4 h-4" />
            <span>כמה דקות ביום?</span>
          </div>

          {/* Visual Goal Display */}
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-600">
                {dailyGoal}
              </div>
              <span className="absolute -bottom-1 right-0 text-lg font-medium text-slate-600">דקות</span>
            </div>
          </div>

          {/* Modern Slider-style Buttons */}
          <div className="grid grid-cols-6 gap-2">
            {[15, 20, 30, 45, 60, 90].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setDailyGoal(num.toString())}
                className={`relative py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${
                  dailyGoal === num.toString()
                    ? 'text-white shadow-md shadow-emerald-400/20 scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-102'
                }`}
              >
                {dailyGoal === num.toString() && (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600" />
                )}
                <span className="relative">{num}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-slate-600 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            מומלץ: 20-45 דקות ליום
          </p>
        </div>
      </SectionCard>

      {/* Weekly Goal Section */}
      <SectionCard 
        icon={Zap} 
        iconColor="text-blue-500" 
        iconBg="bg-blue-500/20"
        title="יעד שבועי"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">כמה ימים בשבוע להשיג את היעד?</p>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(num => (
              <button
                key={num}
                onClick={() => setWeeklyGoalDays(num.toString())}
                className={`relative flex-1 py-4 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${
                  weeklyGoalDays === num.toString()
                    ? 'text-white shadow-md shadow-blue-400/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {weeklyGoalDays === num.toString() && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600" />
                )}
                <span className="relative">{num}</span>
              </button>
            ))}
          </div>

          {/* Visual representation */}
          <div className="flex justify-center gap-1.5 pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map(num => (
              <div 
                key={num}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  num <= parseInt(weeklyGoalDays)
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm shadow-blue-400/30'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Tips & Challenges */}
      <SectionCard 
        icon={Lightbulb} 
        iconColor="text-amber-500" 
        iconBg="bg-amber-500/20"
        title="התראות תוכן"
      >
        <div className="space-y-3">
          <ToggleSwitch 
            checked={showTip}
            onChange={setShowTip}
            label="טיפ יומי"
            description="קבל טיפים לחיים בריאים יותר"
          />
          <ToggleSwitch 
            checked={showChallenge}
            onChange={setShowChallenge}
            label="אתגר יומי"
            description="אתגרים קטנים להנעה"
          />
        </div>
      </SectionCard>

      {/* Reminders */}
      <SectionCard 
        icon={Bell} 
        iconColor="text-violet-500" 
        iconBg="bg-violet-500/20"
        title="תזכורות"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Clock className="w-4 h-4" />
              תזכורת להזנת הליכה
            </label>
            <div className="relative">
              <input
                type="time"
                value={reminderWalkingTime}
                onChange={(e) => setReminderWalkingTime(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Lightbulb className="w-4 h-4" />
              תזכורת לטיפ היומי
            </label>
            <div className="relative">
              <input
                type="time"
                value={reminderTipTime}
                onChange={(e) => setReminderTipTime(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all"
              />
            </div>
          </div>
          
          <p className="text-center text-xs text-slate-600">
            השאר ריק לביטול התזכורת
          </p>
        </div>
      </SectionCard>

      {/* Save Button */}
      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
            saved 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-xl shadow-emerald-500/30'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {saving ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <>
              <Sparkles className="w-5 h-5" />
              נשמר בהצלחה!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              שמור שינויים
            </>
          )}
        </button>
      </div>

      {/* Account Section */}
      <SectionCard 
        icon={User} 
        iconColor="text-rose-500" 
        iconBg="bg-rose-500/20"
        title="חשבון"
      >
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-medium truncate">{user?.email}</p>
              <p className="text-xs text-slate-600">חשבון פעיל</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            התנתקות מהחשבון
          </button>
        </div>
      </SectionCard>

      {/* App Info Footer */}
      <div className="text-center pt-4 pb-8">
        <p className="text-xs text-slate-500">
          גרסה 1.0 • נבנה עם אהבה
        </p>
      </div>
    </div>
  )
}
