'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { formatDate } from '@/lib/utils'

interface WalkingChartProps {
  data: {
    date: string
    minutes: number
    goal: number
    hasData: boolean
  }[]
  goal: number
}

export function WalkingChart({ data, goal }: WalkingChartProps) {
  const formatXAxis = (date: string) => {
    return formatDate(date, 'd')
  }

  const formatMinutesLabel = (value: number) => {
    if (value >= 60) {
      const hours = Math.floor(value / 60)
      return `${hours}h`
    }
    return `${value}`
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatMinutesLabel}
            unit=" דק׳"
          />
          <ReferenceLine
            y={goal}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `יעד: ${goal} דק׳`,
              fill: '#f59e0b',
              fontSize: 11,
              position: 'right',
            }}
          />
          <Bar
            dataKey="minutes"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  !entry.hasData
                    ? '#e5e7eb'
                    : entry.minutes >= goal
                    ? '#5cb8a5'
                    : '#9ca3af'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Backward compatibility
export function StepsChart(props: { data: { date: string; steps?: number; minutes?: number; goal: number; hasData: boolean }[]; goal: number }) {
  const convertedData = props.data.map(d => ({
    ...d,
    minutes: d.minutes ?? d.steps ?? 0,
  }))
  return <WalkingChart data={convertedData} goal={props.goal} />
}
