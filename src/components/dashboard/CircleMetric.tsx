'use client'

import { ProgressRing } from '@/components/ui/ProgressRing'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CircleMetricProps {
  size: 'small' | 'medium' | 'large'
  icon?: React.ReactNode
  value: string | number
  label: string
  sublabel?: string
  progress?: number
  trend?: number
  bgGradient?: string
  onClick?: () => void
}

const sizeConfig = {
  small: {
    container: 'w-28 h-28',
    circle: 120,
    strokeWidth: 10,
    valueText: 'text-2xl',
    labelText: 'text-xs',
    iconSize: 'w-4 h-4',
    iconContainer: 'p-1',
  },
  medium: {
    container: 'w-40 h-40',
    circle: 160,
    strokeWidth: 11,
    valueText: 'text-3xl',
    labelText: 'text-xs',
    iconSize: 'w-5 h-5',
    iconContainer: 'p-2',
  },
  large: {
    container: 'w-56 h-56',
    circle: 220,
    strokeWidth: 12,
    valueText: 'text-5xl',
    labelText: 'text-sm',
    iconSize: 'w-7 h-7',
    iconContainer: 'p-2.5',
  },
}

export function CircleMetric({
  size,
  icon,
  value,
  label,
  sublabel,
  progress,
  trend,
  bgGradient = 'from-emerald-50 to-teal-50',
  onClick,
}: CircleMetricProps) {
  const config = sizeConfig[size]
  const hasProgress = progress !== undefined
  const isClickable = onClick !== undefined

  const content = (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      {/* Trend Badge - Only for large circles */}
      {size === 'large' && trend !== undefined && trend !== 0 && (
        <div 
          className={`absolute -top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
            trend > 0 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}

      {icon && (
        <div className={`${config.iconContainer} rounded-full bg-slate-100 text-slate-700 mb-2`}>
          {icon}
        </div>
      )}
      <div className={`${config.valueText} font-black text-slate-800 leading-none`}>
        {value}
      </div>
      <div className={`${config.labelText} font-medium text-slate-600 mt-1`}>
        {label}
      </div>
      {sublabel && (
        <div className="text-xs text-slate-500 mt-0.5">
          {sublabel}
        </div>
      )}
    </div>
  )

  if (hasProgress) {
    return (
      <div
        className={`${isClickable ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''}`}
        onClick={onClick}
      >
        <ProgressRing
          progress={progress}
          size={config.circle}
          strokeWidth={config.strokeWidth}
          bgClassName={`bg-gradient-to-br ${bgGradient} border border-slate-200`}
        >
          {content}
        </ProgressRing>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`
        ${config.container} rounded-full 
        bg-gradient-to-br ${bgGradient}
        border-2 border-slate-200
        shadow-xl
        flex flex-col items-center justify-center 
        text-slate-800 
        transition-transform 
        ${isClickable ? 'hover:scale-105 active:scale-95 cursor-pointer' : ''}
        relative overflow-hidden
      `}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-xl opacity-50" />
      <div className="relative z-10">
        {content}
      </div>
    </button>
  )
}
