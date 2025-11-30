// src/components/progress/TrendStatsCards.tsx
import React, { useMemo } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { ProfileData, DailyPoint } from '../../data/progressTypes'
import { safeNum, computeTrendSlope } from '../../data/progressUtils'

interface TrendStatsCardsProps {
  // NEW: full time series, needed for 14-day deltas & trend
  dailyPoints: DailyPoint[]

  latestDaily?: DailyPoint
  firstDaily?: DailyPoint
  latestBMI?: number
  weightChange?: number
  bmiChange?: number
  targetWeight?: number
  profile: ProfileData
  measurementDates: string[]
  bmiTrendText: string // kept for compatibility, but not used now
  onEditLatestWeight: () => void
  onEditLatestMeasurement: () => void
}

/* -------------------------
   Helper: color closer/further from goal
-------------------------- */
function colorByGoalProgress(
  prevValue: number | undefined,
  currentValue: number | undefined,
  goalValue: number | undefined
): string {
  if (
    prevValue === undefined ||
    currentValue === undefined ||
    goalValue === undefined
  ) {
    return 'text.secondary'
  }

  const prevDist = Math.abs(goalValue - prevValue)
  const currDist = Math.abs(goalValue - currentValue)

  const eps = 0.05

  if (currDist < prevDist - eps) return 'success.main' // moved closer to goal
  if (currDist > prevDist + eps) return 'error.main' // moved away from goal
  return 'text.secondary' // basically unchanged
}

/* -------------------------
   Helper: AUTO MODE bulk vs cut
-------------------------- */
function getWeightMode(
  currentWeight?: number,
  goalWeight?: number
): 'bulk' | 'cut' | 'maintain' | undefined {
  if (currentWeight === undefined || goalWeight === undefined) return undefined

  const diff = goalWeight - currentWeight
  const eps = 0.1

  if (diff > eps) return 'bulk'      // goal above current → gaining is good
  if (diff < -eps) return 'cut'      // goal below current → losing is good
  return 'maintain'
}

/* -------------------------
   Helper: get point ~N days before latest
-------------------------- */
function getBaselinePoint(
  dailyPoints: DailyPoint[],
  daysBack: number
): DailyPoint | undefined {
  if (!dailyPoints.length) return undefined

  const latest = dailyPoints[dailyPoints.length - 1]
  const latestDate = new Date(latest.date)
  const targetDate = new Date(latestDate)
  targetDate.setDate(targetDate.getDate() - daysBack)

  let best: DailyPoint | undefined
  let bestDiff = Infinity

  for (const p of dailyPoints) {
    const d = new Date(p.date)
    if (d > latestDate) continue
    const diff = Math.abs(d.getTime() - targetDate.getTime())
    if (diff < bestDiff) {
      bestDiff = diff
      best = p
    }
  }

  return best
}

export function TrendStatsCards({
  dailyPoints,
  latestDaily,
  latestBMI,
  profile,
  measurementDates,
  onEditLatestWeight,
  onEditLatestMeasurement
}: TrendStatsCardsProps) {
  const goalWeight = profile.goalWeight
  const targetBMI = profile.targetBMI

  const heightM =
    profile.heightCm && profile.heightCm > 0
      ? profile.heightCm / 100
      : undefined

  const latestWeight = latestDaily?.weight
  const mode = getWeightMode(latestWeight, goalWeight)

  /* =========================================================
     1) 14-DAY WEIGHT & BMI DELTAS
  ========================================================= */
  const { delta14Weight, delta14BMI, baseWeight14, baseBMI14 } = useMemo(() => {
    if (!dailyPoints.length || !latestDaily || !heightM) {
      return {
        delta14Weight: undefined,
        delta14BMI: undefined,
        baseWeight14: undefined,
        baseBMI14: undefined
      }
    }

    const baseline = getBaselinePoint(dailyPoints, 14)
    if (!baseline) {
      return {
        delta14Weight: undefined,
        delta14BMI: undefined,
        baseWeight14: undefined,
        baseBMI14: undefined
      }
    }

    const baseW = baseline.weight
    const baseBMI = baseW / (heightM * heightM)
    const latestBMIValue = latestBMI ?? latestDaily.weight / (heightM * heightM)

    const dW = latestDaily.weight - baseW
    const dBMI = latestBMIValue - baseBMI

    return {
      delta14Weight: dW,
      delta14BMI: dBMI,
      baseWeight14: baseW,
      baseBMI14: baseBMI
    }
  }, [dailyPoints, latestDaily, latestBMI, heightM])

  const weightDeltaColor = useMemo(
    () =>
      colorByGoalProgress(baseWeight14, latestWeight, goalWeight) ??
      'text.secondary',
    [baseWeight14, latestWeight, goalWeight]
  )

  const bmiDeltaColor = useMemo(
    () => colorByGoalProgress(baseBMI14, latestBMI, targetBMI),
    [baseBMI14, latestBMI, targetBMI]
  )

  /* =========================================================
     2) GOAL WEIGHT PROJECTION (ETA)
     - Auto bulk/cut based on goal vs current
  ========================================================= */
  const goalTrendText = useMemo(() => {
    if (!goalWeight) {
      return 'Set a goal weight in your profile to see projections.'
    }
    if (!dailyPoints.length || !latestDaily) {
      return 'Log more days of weight data to see projections.'
    }
    if (dailyPoints.length < 2) {
      return 'Not enough data yet to project trend.'
    }

    const slope = computeTrendSlope(dailyPoints) // kg per day
    if (!slope || slope === 0) {
      return 'Weight trend is flat; no ETA can be projected.'
    }

    const remaining = goalWeight - latestDaily.weight
    if (Math.abs(remaining) < 0.1) {
      return `You are at your goal weight of ${goalWeight.toFixed(1)} kg.`
    }

    // If remaining and slope have opposite signs, you're moving away from goal
    if (remaining * slope <= 0) {
      return 'Current trend is moving away from your goal weight.'
    }

    const daysToGoal = remaining / slope
    if (!Number.isFinite(daysToGoal) || daysToGoal < 0) {
      return 'Trend is unstable; unable to project a reliable ETA.'
    }

    const latestDate = new Date(latestDaily.date)
    const eta = new Date(latestDate.getTime() + daysToGoal * 86400000)
    const etaStr = eta.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

    return `At current pace, you may reach ${goalWeight.toFixed(
      1
    )} kg around ${etaStr}.`
  }, [goalWeight, dailyPoints, latestDaily])

  /* =========================================================
     3) GOAL WEIGHT CARD COLOR
  ========================================================= */
  const goalDiffColor = useMemo(() => {
    if (latestWeight === undefined || goalWeight === undefined) {
      return 'text.secondary'
    }

    const diff = goalWeight - latestWeight // positive = below goal, negative = above

    if (mode === 'bulk') {
      // Want to go UP
      if (diff > 0.1) return 'error.main' // still below goal
      return 'success.main' // at or above goal
    }

    if (mode === 'cut') {
      // Want to go DOWN
      if (diff < -0.1) return 'error.main' // still above goal
      return 'success.main' // at or below goal
    }

    return 'text.secondary'
  }, [latestWeight, goalWeight, mode])

  const modeLabel = useMemo(() => {
    if (!mode) return ''
    if (mode === 'bulk') return 'Mode: Bulking (gaining is good)'
    if (mode === 'cut') return 'Mode: Cutting (losing is good)'
    return 'Mode: Maintenance'
  }, [mode])

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* 1) WEIGHT CARD (Last 14 days) */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Weight (last 14 days)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {safeNum(latestWeight)} kg
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: weightDeltaColor
                  }}
                >
                  {delta14Weight !== undefined
                    ? `${delta14Weight > 0 ? '+' : ''}${delta14Weight.toFixed(
                        1
                      )} kg in last 14 days`
                    : 'Not enough data for 14-day change'}
                </Typography>
              </Box>

              {latestDaily && (
                <Tooltip title="Edit latest weight">
                  <IconButton size="small" onClick={onEditLatestWeight}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 2) BMI CARD (Last 14 days) */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              BMI (last 14 days)
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {safeNum(latestBMI)}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: bmiDeltaColor
              }}
            >
              {delta14BMI !== undefined
                ? `${delta14BMI > 0 ? '+' : ''}${delta14BMI.toFixed(
                    1
                  )} BMI in last 14 days`
                : 'Not enough data for 14-day change'}
            </Typography>

            {targetBMI !== undefined && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Target BMI: {targetBMI}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 3) GOAL WEIGHT CARD (AUTO BULK / CUT) */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Goal Weight
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {safeNum(goalWeight)} kg
            </Typography>

            {latestWeight !== undefined && goalWeight !== undefined && (
              <>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Current: {latestWeight.toFixed(1)} kg
                </Typography>

                <Typography variant="body2" sx={{ mt: 0.5, color: goalDiffColor }}>
                  {(() => {
                    const diff = goalWeight - latestWeight
                    if (Math.abs(diff) < 0.1) {
                      return 'At goal weight'
                    }
                    if (diff > 0) {
                      return `Need +${diff.toFixed(1)} kg to reach goal`
                    }
                    return `Over goal by ${Math.abs(diff).toFixed(1)} kg`
                  })()}
                </Typography>
              </>
            )}

            {profile.heightCm && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Height: {profile.heightCm} cm
              </Typography>
            )}

            {modeLabel && (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}
              >
                {modeLabel}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 4) GOAL WEIGHT PROJECTION CARD */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', mb: 0.5 }}
            >
              Goal Weight Projection
            </Typography>

            <Typography variant="body2">{goalTrendText}</Typography>

            {measurementDates.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Latest measurement:{' '}
                  {measurementDates[measurementDates.length - 1]}
                </Typography>

                <Tooltip title="Edit latest measurements">
                  <IconButton
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={onEditLatestMeasurement}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
