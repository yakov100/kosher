'use client'

import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  rotation: number
  size: number
}

interface ConfettiProps {
  active: boolean
  onComplete?: () => void
  duration?: number
}

const COLORS = ['#2dd4bf', '#f97316', '#eab308', '#ec4899', '#8b5cf6', '#3b82f6', '#22c55e']

export function Confetti({ active, onComplete, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 8
      }))
      setPieces(newPieces)

      const timer = setTimeout(() => {
        setPieces([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [active, duration, onComplete])

  if (!active || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall 3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
