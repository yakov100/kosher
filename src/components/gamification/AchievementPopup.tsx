'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Confetti } from './Confetti'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xp_reward: number
  rarity: string
}

interface AchievementPopupProps {
  achievement: Achievement | null
  onClose: () => void
}

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  uncommon: 'from-emerald-400 to-teal-500',
  rare: 'from-sky-400 to-cyan-500',
  epic: 'from-violet-400 to-pink-500',
  legendary: 'from-amber-400 via-orange-500 to-rose-500'
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [show, setShow] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (achievement) {
      setShow(true)
      setShowConfetti(true)
      
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievement])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300)
  }

  if (!achievement) return null

  const gradientClass = rarityColors[achievement.rarity as keyof typeof rarityColors] || rarityColors.common

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div 
          className={`
            relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 mx-4
            border border-gray-200/60 shadow-2xl pointer-events-auto
            transform transition-all duration-500
            ${show ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}
          `}
        >
          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Badge */}
            <div className="relative inline-block mb-4">
              <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} rounded-full blur-xl opacity-40 scale-150`} />
              <div className="relative text-7xl animate-bounce-in">{achievement.icon}</div>
            </div>

            {/* Title */}
            <div className="mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${gradientClass}`}>
                הישג חדש!
              </span>
            </div>

            <h2 className={`text-2xl font-black mb-2 bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
              {achievement.title}
            </h2>

            <p className="text-gray-500 mb-4">{achievement.description}</p>

            {/* XP Reward */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-100 border border-emerald-200">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold text-emerald-600">+{achievement.xp_reward} XP</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="text-3xl animate-float-left">✨</span>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="text-2xl animate-float">🎉</span>
          </div>
          <div className="absolute bottom-4 right-4">
            <span className="text-2xl animate-float-delayed">🎊</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-left {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-8px) translateX(4px); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        .animate-float-left {
          animation: float-left 2s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 2s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </>
  )
}
