// src/components/progressComponents/TrendStatsCards.tsx
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
import { computeTrendSlope } from '../../data/progressUtils'

interface TrendStatsCardsProps {
  dailyPoints: DailyPoint[]
  profile: ProfileData
  measurementDates: string[]

  onEditLatestWeight: () => void
  onEditLatestMeasurement: () => void
}

/* ----------------------------
   Helpers
----------------------------- */

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
  if (currDist < prevDist - eps) return 'success.main'
  if (currDist > prevDist + eps) return 'error.main'
  return 'text.secondary'
}

function getMode(currentWeight?: number, goalWeight?: number) {
  if (currentWeight === undefined || goalWeight === undefined) return undefined
  const diff = goalWeight - currentWeight
  const eps = 0.1
  if (diff > eps) return 'bulk'
  if (diff < -eps) return 'cut'
  return 'maintain'
}

function getBaselinePoint(dps: DailyPoint[], daysBack: number) {
  if (!dps.length) return undefined

  const latest = dps[dps.length - 1]
  const latestDate = new Date(latest.date)
  const target = new Date(latestDate)
  target.setDate(latestDate.getDate() - daysBack)

  let best: DailyPoint | undefined
  let bestDiff = Infinity

  for (const p of dps) {
    const d = new Date(p.date)
    if (d > latestDate) continue
    const diff = Math.abs(d.getTime() - target.getTime())
    if (diff < bestDiff) {
      bestDiff = diff
      best = p
    }
  }
  return best
}

/* ===================================================================
   COMPONENT
=================================================================== */

export function TrendStatsCards({
  dailyPoints,
  profile,
  measurementDates,
  onEditLatestWeight,
  onEditLatestMeasurement
}: TrendStatsCardsProps) {
  const { goalWeight, targetBMI, heightCm } = profile

  /* ----------------------------
     Sort dailyPoints chronologically ASC
  ----------------------------- */
  const sorted = useMemo(() => {
    return [...dailyPoints].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [dailyPoints])

  const latest = sorted.at(-1)
  const heightM = heightCm ? heightCm / 100 : undefined
  const latestBMI = latest && heightM ? latest.weight / (heightM * heightM) : undefined

  /* ----------------------------
     14-DAY DELTAS
  ----------------------------- */
  const {
    delta14Weight,
    delta14BMI,
    baseWeight14,
    baseBMI14
  } = useMemo(() => {
    if (!sorted.length || !latest || !heightM) {
      return {
        delta14Weight: undefined,
        delta14BMI: undefined,
        baseWeight14: undefined,
        baseBMI14: undefined
      }
    }

    const baseline = getBaselinePoint(sorted, 14)
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
    const latestBMIValue = latestBMI ?? latest.weight / (heightM * heightM)

    return {
      delta14Weight: latest.weight - baseW,
      delta14BMI: latestBMIValue - baseBMI,
      baseWeight14: baseW,
      baseBMI14: baseBMI
    }
  }, [sorted, latest, heightM, latestBMI])

  const weightDeltaColor = useMemo(
    () => colorByGoalProgress(baseWeight14, latest?.weight, goalWeight),
    [baseWeight14, latest?.weight, goalWeight]
  )

  const bmiDeltaColor = useMemo(
    () => colorByGoalProgress(baseBMI14, latestBMI, targetBMI),
    [baseBMI14, latestBMI, targetBMI]
  )

  /* ----------------------------
     Mode (bulk / cut / maintain)
  ----------------------------- */
  const mode = getMode(latest?.weight, goalWeight)

  const modeLabel =
    mode === 'bulk'
      ? 'Mode: Bulking (gaining is good)'
      : mode === 'cut'
      ? 'Mode: Cutting (losing is good)'
      : mode === 'maintain'
      ? 'Mode: Maintenance'
      : ''

  /* ----------------------------
     Goal projection (ETA)
  ----------------------------- */
  const goalTrendText = useMemo(() => {
    if (!goalWeight) return 'Set a goal weight in your profile.'
    if (!sorted.length || !latest) return 'Not enough data to project.'
    if (sorted.length < 2) return 'Need more days of data to project.'

    const slope = computeTrendSlope(sorted) // kg/day

    if (!slope || slope === 0) return 'Trend is flat; no ETA.'

    const remaining = goalWeight - latest.weight
    if (Math.abs(remaining) < 0.1)
      return `You are at your goal weight of ${goalWeight.toFixed(1)} kg.`

    if (remaining * slope <= 0)
      return 'Current trend is moving away from your goal weight.'

    const daysToGoal = remaining / slope
    if (!Number.isFinite(daysToGoal) || daysToGoal < 0)
      return 'Unable to estimate ETA.'

    const eta = new Date(new Date(latest.date).getTime() + daysToGoal * 86400000)
    const etaStr = eta.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

    return `At current pace, estimated to reach ${goalWeight.toFixed(
      1
    )} kg around ${etaStr}.`
  }, [goalWeight, sorted, latest])

  /* ----------------------------
     Goal card color logic
  ----------------------------- */
  const goalDiffColor = useMemo(() => {
    if (!latest || goalWeight === undefined) return 'text.secondary'
    const diff = goalWeight - latest.weight

    if (mode === 'bulk') return diff > 0.1 ? 'error.main' : 'success.main'
    if (mode === 'cut') return diff < -0.1 ? 'error.main' : 'success.main'
    return 'text.secondary'
  }, [latest, goalWeight, mode])

  /* ===================================================================
     RENDER
  ================================================================== */

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* WEIGHT (14d) */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Weight (last 14 days)
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {latest?.weight ?? '--'} kg
                </Typography>

                <Typography variant="body2" sx={{ mt: 0.5, color: weightDeltaColor }}>
                  {delta14Weight !== undefined
                    ? `${delta14Weight > 0 ? '+' : ''}${delta14Weight.toFixed(
                        1
                      )} kg in last 14 days`
                    : 'Not enough data'}
                </Typography>
              </Box>

              {latest && (
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

      {/* BMI (14d) */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              BMI (last 14 days)
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {latestBMI ? latestBMI.toFixed(1) : '--'}
            </Typography>

            <Typography variant="body2" sx={{ mt: 0.5, color: bmiDeltaColor }}>
              {delta14BMI !== undefined
                ? `${delta14BMI > 0 ? '+' : ''}${delta14BMI.toFixed(
                    1
                  )} in last 14 days`
                : 'Not enough data'}
            </Typography>

            {targetBMI !== undefined && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Target BMI: {targetBMI}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* GOAL WEIGHT */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Goal Weight
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {goalWeight ?? '--'} kg
            </Typography>

            {latest && goalWeight !== undefined && (
              <>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Current: {latest.weight.toFixed(1)} kg
                </Typography>

                <Typography variant="body2" sx={{ mt: 0.5, color: goalDiffColor }}>
                  {(() => {
                    const diff = goalWeight - latest.weight
                    if (Math.abs(diff) < 0.1) return 'At goal weight'
                    if (diff > 0) return `Need +${diff.toFixed(1)} kg`
                    return `Over goal by ${Math.abs(diff).toFixed(1)} kg`
                  })()}
                </Typography>
              </>
            )}

            {heightCm && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Height: {heightCm} cm
              </Typography>
            )}

            {modeLabel && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {modeLabel}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* GOAL PROJECTION */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Goal Projection
            </Typography>

            <Typography variant="body2">{goalTrendText}</Typography>

            {measurementDates.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Latest measurement: {measurementDates.at(-1)}
                </Typography>

                <Tooltip title="Edit latest measurements">
                  <IconButton size="small" sx={{ ml: 1 }} onClick={onEditLatestMeasurement}>
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
