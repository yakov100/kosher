'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatDate } from '@/lib/utils'

interface WeightChartProps {
  data: {
    date: string
    value: number
    movingAvg: number | null
  }[]
}

export function WeightChart({ data }: WeightChartProps) {
  const formatXAxis = (date: string) => {
    return formatDate(date, 'd/M')
  }

  // Calculate Y axis domain with some padding
  const values = data.map(d => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.1 || 2
  const yDomain = [Math.floor(minValue - padding), Math.ceil(maxValue + padding)]

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            domain={yDomain}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              direction: 'rtl',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            labelFormatter={(date) => formatDate(date as string, 'EEEE, d/M')}
            formatter={(value: number, name: string) => [
              `${value} ק״ג`,
              name === 'value' ? 'משקל' : 'ממוצע נע',
            ]}
          />
          {/* Weight points */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#9ca3af"
            strokeWidth={2}
            dot={{ fill: '#9ca3af', strokeWidth: 0, r: 4 }}
            activeDot={{ fill: '#5cb8a5', strokeWidth: 0, r: 6 }}
          />
          {/* Moving average line */}
          <Line
            type="monotone"
            dataKey="movingAvg"
            stroke="#5cb8a5"
            strokeWidth={3}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-gray-500">משקל</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-gray-500">ממוצע נע (7 ימים)</span>
        </div>
      </div>
    </div>
  )
}
