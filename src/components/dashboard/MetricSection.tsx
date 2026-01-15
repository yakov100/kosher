'use client'

import { ReactNode } from 'react'

interface MetricItem {
  value: string | number
  label: string
  trend?: {
    value: string | number
    isPositive?: boolean
  }
  size?: 'lg' | 'md' | 'sm'
}

interface MetricSectionProps {
  title?: string
  metrics: MetricItem[]
  layout?: 'horizontal' | 'grid' | 'inline'
  className?: string
}

export function MetricSection({ 
  title, 
  metrics, 
  layout = 'horizontal',
  className = '' 
}: MetricSectionProps) {
  const layoutClasses = {
    horizontal: 'flex items-center justify-around gap-6 flex-wrap',
    grid: 'grid grid-cols-3 gap-4',
    inline: 'flex items-baseline gap-6 flex-wrap',
  }

  const sizeClasses = {
    lg: { value: 'text-3xl', label: 'text-sm' },
    md: { value: 'text-xl', label: 'text-xs' },
    sm: { value: 'text-lg', label: 'text-xs' },
  }

  return (
    <section className={`py-12 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-8">
          {title}
        </h3>
      )}
      
      <div className={layoutClasses[layout]}>
        {metrics.map((metric, index) => {
          const sizes = sizeClasses[metric.size || 'md']
          const colorClasses = [
            'text-[var(--primary)]',
            'text-[var(--secondary)]',
            'text-[var(--accent)]'
          ]
          const metricColor = colorClasses[index % colorClasses.length]
          
          return (
            <div key={index} className="text-center min-w-0 flex-1">
              <div className={`${sizes.value} font-black ${metricColor} mb-2`}>
                {metric.value}
              </div>
              <div className={`${sizes.label} font-medium text-[var(--muted-foreground)] mb-1`}>
                {metric.label}
              </div>
              {metric.trend && (
                <div className={`text-xs font-semibold ${
                  metric.trend.isPositive === true ? 'text-[var(--primary)]' :
                  metric.trend.isPositive === false ? 'text-red-400' :
                  'text-[var(--muted-foreground)]'
                }`}>
                  {metric.trend.value}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
