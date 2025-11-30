// src/components/progressComponents/WorkoutProgressTracking.tsx
import React, { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Chip,
  Stack,
  Divider
} from '@mui/material'

/** One entry from progressData.workoutLog */
export interface WorkoutLogEntry {
  date: string // 'YYYY-MM-DD'
  variantId: string
  variantName: string
  completed: boolean
}

export interface WorkoutProgressTrackingProps {
  workouts: WorkoutLogEntry[]
}

/** Rolling windows in days */
const WINDOW_DAYS = {
  week: 7,
  month: 30,
  year: 365
} as const

type Mode = 'week' | 'month' | 'year'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Normalize a YYYY-MM-DD string to a Date at local midnight */
function dateFromIso(iso: string): Date {
  // Ensure it's treated as local date by splitting
  const [y, m, d] = iso.split('-').map((n) => Number(n))
  return new Date(y, m - 1, d)
}

/** Today at local midnight */
function todayMidnight(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Days between d and today (0 = today, 1 = yesterday, etc.) */
function daysAgo(d: Date, today: Date): number {
  return Math.floor((today.getTime() - d.getTime()) / MS_PER_DAY)
}

/** Map variantName → muscle group based on keywords in the name */
function getMuscleGroup(variantName: string): string {
  const upper = variantName.toUpperCase()

  const groups = [
    'CHEST',
    'BACK',
    'LEGS',
    'PUSH',
    'PULL',
    'SHOULDERS',
    'ARMS',
    'CORE',
    'UPPER',
    'LOWER',
    'FULL BODY'
  ]

  for (const g of groups) {
    if (upper.includes(g)) return g
  }

  return 'OTHER'
}

/** Safe number → string */
function safeNum(n: number | undefined, decimals = 1): string {
  if (n === undefined || Number.isNaN(n)) return '-'
  return n.toFixed(decimals)
}

const WeeklyTarget = 14
const MonthlyTarget = WeeklyTarget * 4 // 56
const YearlyTarget = WeeklyTarget * 52 // 728

/** MAIN COMPONENT */
const WorkoutProgressTracking: React.FC<WorkoutProgressTrackingProps> = ({
  workouts
}) => {
  const [mode, setMode] = useState<Mode>('week')

  const today = todayMidnight()

  /** Filter workouts by rolling window & pre-derive base stuff once */
  const filtered = useMemo(() => {
    const windowDays = WINDOW_DAYS[mode]

    return workouts
      .map((w) => ({
        ...w,
        dateObj: dateFromIso(w.date),
        group: getMuscleGroup(w.variantName)
      }))
      .filter((w) => {
        const diff = daysAgo(w.dateObj, today)
        return diff >= 0 && diff < windowDays
      })
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
  }, [workouts, mode])

  /** POINTS STATS (A) */
  const pointStats = useMemo(() => {
    const totalPoints = filtered.reduce(
      (sum, w) => sum + (w.completed ? 2 : 1),
      0
    )

    let targetPoints = WeeklyTarget
    let label = 'Last 7 days'

    if (mode === 'month') {
      targetPoints = MonthlyTarget
      label = 'Last 30 days'
    } else if (mode === 'year') {
      targetPoints = YearlyTarget
      label = 'Last 365 days'
    }

    const percentage =
      targetPoints > 0
        ? Math.min((totalPoints / targetPoints) * 100, 100)
        : 0

    const remaining = Math.max(targetPoints - totalPoints, 0)

    return { totalPoints, targetPoints, percentage, remaining, label }
  }, [filtered, mode])

  /** MUSCLE GROUP DISTRIBUTION (B) */
  const muscleStats = useMemo(() => {
    const groupCounts: Record<
      string,
      { total: number; completed: number; partial: number }
    > = {}

    filtered.forEach((w) => {
      const g = w.group
      if (!groupCounts[g]) {
        groupCounts[g] = { total: 0, completed: 0, partial: 0 }
      }
      groupCounts[g].total += 1
      if (w.completed) groupCounts[g].completed += 1
      else groupCounts[g].partial += 1
    })

    const entries = Object.entries(groupCounts)
      .map(([group, stats]) => ({
        group,
        ...stats
      }))
      .sort((a, b) => b.total - a.total)

    const totalWorkouts = entries.reduce((s, e) => s + e.total, 0)

    return { entries, totalWorkouts }
  }, [filtered])

  /** RECENT ACTIVITY LIST (C) – show last 10 (from *all* log, not just window) */
  const recent = useMemo(() => {
    return [...workouts]
      .map((w) => ({
        ...w,
        dateObj: dateFromIso(w.date),
        group: getMuscleGroup(w.variantName)
      }))
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .slice(0, 10)
  }, [workouts])

  const modeLabel = mode === 'week' ? 'Week' : mode === 'month' ? 'Month' : 'Year'

  return (
    <Box sx={{ mt: 4 ,mb: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Workout Progress & Volume
      </Typography>

      <Grid container spacing={2}>
        {/* LEFT: POINTS CARD */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {modeLabel} Points
                </Typography>

                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={(_, v) => v && setMode(v)}
                  size="small"
                >
                  <ToggleButton value="week">7d</ToggleButton>
                  <ToggleButton value="month">30d</ToggleButton>
                  <ToggleButton value="year">365d</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Rolling window · {pointStats.label}
              </Typography>

              <Box sx={{ mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {pointStats.totalPoints} / {pointStats.targetPoints} pts
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {pointStats.remaining === 0
                    ? 'Weekly goal hit.'
                    : `${pointStats.remaining} points to goal.`}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={pointStats.percentage}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  mt: 1,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6
                  }
                }}
              />

              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                2 points = completed workout · 1 point = partial workout
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: MUSCLE GROUP DISTRIBUTION + COUNTS */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Muscle Group Volume ({modeLabel.toLowerCase()})
              </Typography>

              {muscleStats.totalWorkouts === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No workouts logged in this window yet.
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Total workouts: {muscleStats.totalWorkouts}
                  </Typography>

                  <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
                    {muscleStats.entries.map((e) => {
                      const percentage =
                        muscleStats.totalWorkouts > 0
                          ? (e.total / muscleStats.totalWorkouts) * 100
                          : 0

                      return (
                        <Box key={e.group} sx={{ mb: 1.2 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 0.3 }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={e.group}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {e.completed} full · {e.partial} partial
                              </Typography>
                            </Stack>

                            <Typography variant="caption">
                              {safeNum(percentage, 0)}%
                            </Typography>
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>
                      )
                    })}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* BOTTOM: RECENT ACTIVITY TIMELINE */}
        {/* <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Recent Workouts
              </Typography>
              {recent.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No workouts logged yet.
                </Typography>
              ) : (
                <Box>
                  {recent.map((w, idx) => {
                    const dateLabel = w.date
                    const statusLabel = w.completed ? 'Completed' : 'Partial'
                    const statusColor = w.completed ? 'success' : 'warning'
                    const group = getMuscleGroup(w.variantName)

                    return (
                      <Box key={`${w.date}-${w.variantId}-${idx}`}>
                        {idx > 0 && <Divider sx={{ my: 0.75 }} />}

                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {w.variantName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {dateLabel} · {group}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={statusLabel}
                              size="small"
                              color={statusColor as any}
                              variant="outlined"
                            />
                          </Stack>
                        </Stack>
                      </Box>
                    )
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Box>
  )
}

export default WorkoutProgressTracking
