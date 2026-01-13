import { format, startOfWeek, endOfWeek, subDays, parseISO, isValid } from 'date-fns'
import { he } from 'date-fns/locale'

export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return ''
  return format(d, formatStr, { locale: he })
}

export function formatHebrewDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return ''
  return format(d, 'EEEE, d בMMMM', { locale: he })
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getWeekRange(date: Date = new Date(), weekStartsOn: 0 | 1 = 0) {
  const start = startOfWeek(date, { weekStartsOn })
  const end = endOfWeek(date, { weekStartsOn })
  return { start, end }
}

export function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return days
}

export function getLast30Days(): string[] {
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return days
}

export function calculateMovingAverage(
  data: { date: string; value: number }[],
  windowSize: number = 7
): { date: string; value: number; movingAvg: number | null }[] {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  
  return sorted.map((item, index) => {
    if (index < windowSize - 1) {
      return { ...item, movingAvg: null }
    }
    
    const window = sorted.slice(index - windowSize + 1, index + 1)
    const sum = window.reduce((acc, curr) => acc + curr.value, 0)
    const movingAvg = Math.round((sum / windowSize) * 100) / 100
    
    return { ...item, movingAvg }
  })
}

export function calculateStreak(
  dates: string[],
  checkGoal?: (date: string) => boolean
): number {
  if (dates.length === 0) return 0
  
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a))
  const today = getToday()
  
  // If no entry today and checking for logging streak
  if (!checkGoal && !sortedDates.includes(today)) {
    // Check if yesterday has entry
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    if (!sortedDates.includes(yesterday)) return 0
  }
  
  let streak = 0
  let currentDate = new Date()
  
  // Start from today or yesterday if no entry today
  if (!sortedDates.includes(today)) {
    currentDate = subDays(currentDate, 1)
  }
  
  for (let i = 0; i < 365; i++) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    
    if (sortedDates.includes(dateStr)) {
      if (!checkGoal || checkGoal(dateStr)) {
        streak++
      } else {
        break
      }
    } else {
      break
    }
    
    currentDate = subDays(currentDate, 1)
  }
  
  return streak
}

export function cn(...classes: (string | boolean | undefined | null | number)[]): string {
  return classes.filter((c): c is string => typeof c === 'string' && c.length > 0).join(' ')
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('he-IL').format(num)
}
