'use client'

import {
  AreaChart,
  Area,
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-4 shadow-2xl shadow-blue-500/20">
        <p className="text-slate-700 font-bold text-sm mb-2">
          {formatDate(label as string, 'EEEE, d/M')}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 font-medium">
              {entry.name === 'value' ? 'משקל' : 'ממוצע נע'}:
            </span>
            <span className="text-slate-800 font-bold">
              {entry.value ?? 0} ק״ג
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
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
    <div className="h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
          <defs>
            {/* Gradient for weight area */}
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
            {/* Gradient for moving average */}
            <linearGradient id="weightMovingAvgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c084fc" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1} />
            </linearGradient>
            {/* Glow filter for lines */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            tickLine={false}
          />
          <YAxis
            domain={yDomain}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }} />
          
          {/* Weight area with gradient */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#60a5fa"
            strokeWidth={3}
            fill="url(#weightGradient)"
            dot={{ 
              fill: '#ffffff',
              stroke: '#3b82f6',
              strokeWidth: 3,
              r: 5,
              filter: 'url(#glow)'
            }}
            activeDot={{ 
              fill: '#3b82f6',
              stroke: '#ffffff',
              strokeWidth: 3,
              r: 8,
              filter: 'url(#glow)'
            }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          
          {/* Moving average line with glow */}
          <Line
            type="monotone"
            dataKey="movingAvg"
            stroke="#a855f7"
            strokeWidth={4}
            dot={false}
            connectNulls={false}
            strokeLinecap="round"
            filter="url(#glow)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Enhanced Legend */}
      <div className="flex justify-center gap-6 mt-5">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 w-4 h-4 rounded-full bg-blue-400 animate-ping opacity-20" />
          </div>
          <span className="text-slate-600 font-semibold text-sm group-hover:text-blue-600 transition-colors">משקל</span>
        </div>
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 w-4 h-4 rounded-full bg-purple-400 animate-ping opacity-20" />
          </div>
          <span className="text-slate-600 font-semibold text-sm group-hover:text-purple-600 transition-colors">ממוצע נע (7 ימים)</span>
        </div>
      </div>
    </div>
  )
}
