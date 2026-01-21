'use client'

import { useState, useEffect } from 'react'
import { Gift, Sparkles, PartyPopper, Star, Trophy, Heart, Zap } from 'lucide-react'
import { Confetti } from './Confetti'

interface TreatUnlockedCardProps {
  totalTreatsEarned: number
  onClaim: () => void
  xpEarned?: number
}

const treatSuggestions = [
  { icon: '👕', text: 'קניית פריט לבוש' },
  { icon: '🍽️', text: 'ארוחה זוגית במסעדה' },
  { icon: '📚', text: 'קניית ספר' },
  { icon: '🍕', text: 'אוכל טעים קנוי' },
  { icon: '✈️', text: 'חופשה קצרה' },
  { icon: '💰', text: '100 שקל לבזבוזים' },
  { icon: '🍔', text: 'יום אכילה בלי חשבון' },
]

export function TreatUnlockedCard({ totalTreatsEarned, onClaim, xpEarned = 700 }: TreatUnlockedCardProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [randomTreat, setRandomTreat] = useState(treatSuggestions[0])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setRandomTreat(treatSuggestions[Math.floor(Math.random() * treatSuggestions.length)])
    setShowConfetti(true)
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div 
        className={`
          relative overflow-hidden rounded-3xl border-2 border-yellow-400
          bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50
          p-8 shadow-2xl transition-all duration-700
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Animated sparkles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className="absolute top-4 right-6 w-5 h-5 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute top-10 left-8 w-4 h-4 text-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute bottom-6 right-10 w-6 h-6 text-orange-400 animate-pulse" style={{ animationDelay: '1s' }} />
          <Star className="absolute top-12 right-14 w-4 h-4 text-yellow-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <Star className="absolute bottom-12 left-12 w-5 h-5 text-amber-500 animate-pulse" style={{ animationDelay: '0.8s' }} />
          <Gift className="absolute -bottom-4 -left-4 w-24 h-24 text-amber-200/30 rotate-12" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Main icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 
                flex items-center justify-center shadow-2xl animate-bounce"
                style={{ animationDuration: '2s' }}
              >
                <Gift className="w-16 h-16 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 
                opacity-40 blur-xl animate-pulse" />
            </div>
          </div>

          {/* Header with party poppers */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <PartyPopper className="w-7 h-7 text-amber-500 animate-bounce" />
            <h2 className="text-3xl font-black text-center bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 
              bg-clip-text text-transparent">
              פינוק חדש! 🎉
            </h2>
            <PartyPopper className="w-7 h-7 text-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>

          {/* Treats counter */}
          {totalTreatsEarned > 1 && (
            <p className="text-center text-lg text-amber-700 font-bold mb-4">
              זה הפינוק ה-{totalTreatsEarned} שלך! 🌟
            </p>
          )}

          {/* XP Achievement */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-5 shadow-lg border border-amber-200">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
              <span className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 
                bg-clip-text text-transparent">
                {xpEarned} XP
              </span>
              <Trophy className="w-8 h-8 text-orange-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
            <p className="text-center text-sm text-gray-600 font-medium">צברת מספיק נקודות לפינוק!</p>
          </div>

          {/* Celebration message */}
          <div className="mb-5 text-center">
            <p className="text-gray-700 leading-relaxed mb-2">
              עבדת קשה וצברת {xpEarned} נקודות!
            </p>
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-amber-600 font-bold text-lg">הגיע הזמן לפנק את עצמך</span>
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
          </div>

          {/* Treat suggestion */}
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-2xl p-5 border-2 border-purple-200 shadow-md mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <p className="text-sm text-purple-700 font-bold">💡 הצעה לפינוק:</p>
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">{randomTreat.icon}</span>
              <span className="text-gray-800 font-bold text-lg">{randomTreat.text}</span>
            </div>
          </div>

          {/* Claim button */}
          <button 
            onClick={onClaim}
            className="group relative w-full py-4 rounded-2xl overflow-hidden
              bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 
              text-white font-black text-lg 
              transition-all duration-300 
              hover:scale-105 hover:shadow-2xl
              active:scale-95
              shadow-xl"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
              translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            {/* Button content */}
            <div className="relative flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
              <span>קיבלתי את הפינוק!</span>
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            </div>
          </button>

          {/* Small note */}
          <p className="text-center text-xs text-gray-500 mt-4">
            לחיצה על הכפתור תאפס את המונה ל-700 הנקודות הבאות
          </p>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-300/20 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-orange-300/20 to-transparent rounded-full translate-x-1/2 translate-y-1/2" />
      </div>
    </>
  )
}
