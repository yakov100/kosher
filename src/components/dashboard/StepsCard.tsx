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
        className={`fade-in stagger-1 relative overflow-hidden ${isGoalReached ? 'border-emerald-400/50' : ''}`}
      >
        {/* Celebration background for goal reached */}
        {isGoalReached && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 via-transparent to-violet-100/60" />
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
                <div className={`text-4xl font-bold mb-1 ${isGoalReached ? 'text-emerald-600' : 'text-gray-700'}`}>
                  {formatMinutes(minutes)}
                </div>
                <div className="text-sm text-gray-500">
                  מתוך {dailyGoal} דקות
                </div>
                {isGoalReached && (
                  <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-violet-100 border border-emerald-300/50">
                    <span className="text-lg animate-bounce">🎉</span>
                    <span className="font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">
                      יעד הושג!
                    </span>
                    <Star className="w-4 h-4 text-amber-500 animate-pulse" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500">
                <div className="text-lg mb-1">לא הוזנה הליכה עדיין</div>
                <div className="text-sm">לחץ להזנת דקות הליכה ולצבור XP! ⭐</div>
              </div>
            )}
          </div>

          <div className="relative">
            <ProgressRing progress={progress} size={100} strokeWidth={8}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isGoalReached ? 'text-emerald-600' : 'text-emerald-500'}`}>
                  {progress}%
                </div>
              </div>
            </ProgressRing>
            
            {/* Achievement badge for goal reached */}
            {isGoalReached && (
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-sm shadow-lg shadow-amber-300/40 animate-pulse text-white">
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
