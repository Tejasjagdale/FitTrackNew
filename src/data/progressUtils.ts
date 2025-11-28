// src/components/progress/progressUtils.ts
import { DailyPoint } from './progressTypes'

export const getTodayIndia = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

export const sortedDates = (map: Record<string, any>): string[] =>
  Object.keys(map).sort((a, b) => a.localeCompare(b))

// Safe formatter that handles ISO strings, timestamps, and Date objects
export const formatShortDate = (input: any): string => {
  // ISO string "YYYY-MM-DD"
  if (typeof input === 'string' && input.includes('-')) {
    return input.slice(5)
  }

  // Timestamp number
  if (typeof input === 'number') {
    const d = new Date(input)
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(5)
  }

  // Date object
  if (input instanceof Date) {
    return input.toISOString().slice(5)
  }

  return ''
}

export const computeBMI = (
  weight: number,
  heightCm?: number
): number | undefined => {
  if (!heightCm) return undefined
  const h = heightCm / 100
  if (!h) return undefined
  return weight / (h * h)
}

export const computeTrendSlope = (
  points: DailyPoint[]
): number | undefined => {
  if (points.length < 2) return undefined
  const first = points[0]
  const last = points[points.length - 1]

  const dx =
    (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000
  if (dx <= 0) return undefined

  return (last.weight - first.weight) / dx
}

export const safeNum = (n: number | undefined, decimals = 1): string =>
  n === undefined || Number.isNaN(n) ? '-' : n.toFixed(decimals)
