'use client'

import { useState, useEffect } from 'react'
import { Gift, Sparkles, PartyPopper, Coffee, IceCream, Heart } from 'lucide-react'
import { Confetti } from './Confetti'

interface TreatRewardCardProps {
  consecutiveGoalDays: number
  targetDays?: number
  onDismiss?: () => void
}

const treatSuggestions = [
  { icon: '☕', text: 'קפה מפנק בבית קפה אהוב' },
  { icon: '🍦', text: 'גלידה או קינוח מיוחד' },
  { icon: '🛁', text: 'אמבט מפנק עם נרות' },
  { icon: '🎬', text: 'סרט או סדרה שדחית' },
  { icon: '💆', text: 'עיסוי או טיפול ספא' },
  { icon: '🛍️', text: 'קנייה קטנה שדחית' },
  { icon: '📚', text: 'זמן לקריאת ספר אהוב' },
  { icon: '🎮', text: 'זמן משחק ללא אשמה' },
]

export function TreatRewardCard({ consecutiveGoalDays, targetDays = 14, onDismiss }: TreatRewardCardProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [randomTreat, setRandomTreat] = useState(treatSuggestions[0])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (consecutiveGoalDays >= targetDays) {
      setRandomTreat(treatSuggestions[Math.floor(Math.random() * treatSuggestions.length)])
      setShowConfetti(true)
      setTimeout(() => setIsVisible(true), 100)
    }
  }, [consecutiveGoalDays, targetDays])

  if (consecutiveGoalDays < targetDays) {
    return null
  }

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div 
        className={`
          relative overflow-hidden rounded-2xl border-2 border-amber-300/60
          bg-gradient-to-br from-amber-100/80 via-orange-50/70 to-pink-100/80
          p-5 transition-all duration-700
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Animated sparkles background */}
        <div className="absolute inset-0 overflow-hidden">
          <Sparkles className="absolute top-2 right-4 w-4 h-4 text-amber-400/60 animate-pulse" />
          <Sparkles className="absolute top-8 left-6 w-3 h-3 text-pink-400/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute bottom-4 right-8 w-5 h-5 text-orange-400/60 animate-pulse" style={{ animationDelay: '1s' }} />
          <Gift className="absolute -bottom-2 -left-2 w-16 h-16 text-amber-300/20 rotate-12" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <PartyPopper className="w-6 h-6 text-amber-500 animate-bounce" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              מגיע לך פינוק!
            </h3>
            <PartyPopper className="w-6 h-6 text-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>

          {/* Achievement */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-200/70 to-orange-200/70 border border-amber-300/50">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-amber-800 font-medium">
                {consecutiveGoalDays} ימים ברציפות עם יעד!
              </span>
              <span className="text-2xl">🎉</span>
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-gray-600 mb-4">
            עבדת קשה והגעת ליעדים שלך במשך שבועיים שלמים!
            <br />
            <span className="text-amber-600 font-medium">הגיע הזמן לפנק את עצמך 💛</span>
          </p>

          {/* Treat suggestion */}
          <div className="bg-white/70 rounded-xl p-4 border border-gray-200/50">
            <div className="text-xs text-gray-400 mb-2 text-center">הצעה לפינוק:</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{randomTreat.icon}</span>
              <span className="text-gray-700 font-medium">{randomTreat.text}</span>
            </div>
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              תודה, אשמח לפינוק! ✨
            </button>
          )}
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(3deg); }
          }
        `}</style>
      </div>
    </>
  )
}
