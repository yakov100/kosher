'use client'

import { useState } from 'react'
import { Timer, Plus, Star } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { WalkingEntryModal } from '@/components/steps/StepsEntryModal'
import type { Tables } from '@/types/database'

interface WalkingCardProps {
  todayRecord: Tables<'steps_records'> | undefined
  dailyGoal: number
  onUpdate: () => void
  goalReached?: boolean
}

export function WalkingCard({ todayRecord, dailyGoal, onUpdate, goalReached }: WalkingCardProps) {
  const [showModal, setShowModal] = useState(false)

  const minutes = todayRecord?.minutes || 0
  const progress = Math.min(Math.round((minutes / dailyGoal) * 100), 100)
  const hasData = !!todayRecord
  const isGoalReached = progress >= 100 || goalReached

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} דק׳`
    const hours = Math.floor(mins / 60)
    const remaining = mins % 60
    return remaining > 0 ? `${hours}:${remaining.toString().padStart(2, '0')}` : `${hours} שע׳`
  }

  return (
    <>
      <Card 
        highlight={!hasData} 
        className={`fade-in stagger-1 relative overflow-hidden ${isGoalReached ? 'border-[var(--primary)]' : ''}`}
      >
        {/* Celebration background for goal reached */}
        {isGoalReached && (
          <div className="absolute inset-0 bg-[var(--primary)]/20" />
        )}

        <CardHeader
          title="הליכה היום"
          icon={<Timer size={20} />}
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => setShowModal(true)}
            >
              {hasData ? 'עדכון' : 'הזנה'}
            </Button>
          }
        />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            {hasData ? (
              <>
                <div className={`text-5xl font-black mb-2 ${isGoalReached ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                  {formatMinutes(minutes)}
                </div>
                <div className="text-sm font-bold text-[var(--muted-foreground)]">
                  מתוך {dailyGoal} דקות
                </div>
                {isGoalReached && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] border-2 border-[var(--primary)]/50 shadow-lg">
                    <span className="text-xl animate-bounce">🎉</span>
                    <span className="font-black text-white uppercase tracking-wide">
                      יעד הושג!
                    </span>
                    <Star className="w-5 h-5 text-white animate-pulse" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-[var(--muted-foreground)]">
                <div className="text-xl font-bold mb-2">לא הוזנה הליכה עדיין</div>
                <div className="text-sm font-medium">לחץ להזנת דקות הליכה ולצבור XP! ⭐</div>
              </div>
            )}
          </div>

          <div className="relative">
            <ProgressRing progress={progress} size={100} strokeWidth={8}>
              <div className="text-center">
                <div className={`text-2xl font-black ${isGoalReached ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                  {progress}%
                </div>
              </div>
            </ProgressRing>
            
            {/* Achievement badge for goal reached */}
            {isGoalReached && (
              <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-[var(--primary)] border-2 border-[var(--primary)]/50 shadow-lg flex items-center justify-center text-lg font-black animate-pulse text-white">
                ✓
              </div>
            )}
          </div>
        </div>
      </Card>

      <WalkingEntryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        existingRecord={todayRecord}
        onSuccess={() => {
          setShowModal(false)
          onUpdate()
        }}
      />
    </>
  )
}

// Backward compatibility
export function StepsCard(props: WalkingCardProps & { todaySteps?: Tables<'steps_records'> }) {
  return <WalkingCard {...props} todayRecord={props.todaySteps || props.todayRecord} />
}
