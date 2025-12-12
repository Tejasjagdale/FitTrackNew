import React, { useMemo, useState } from 'react'
import { Card, CardContent, Typography, Stack, Button, Box } from '@mui/material'
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Area,
  Line
} from 'recharts'
import { MeasurementPoint } from '../../data/progressTypes'
import { formatShortDate } from '../../data/progressUtils'

interface MetricAreaChartCardProps {
  title: string
  data: MeasurementPoint[]
  goalValue?: number
  metricKey?: string
}

/* -------------------------
   Conservative defaults (Option A)
------------------------- */

/* -------------------------
   Defaults updated for INCHES progress
------------------------- */

const DEFAULTS = {
  weight: {
    bulkPerWeek: 0.25,     // kg/week
    cutPerWeek: -0.30      // kg/week
  },

  // Inches per week (muscle measurements: arms/chest/shoulders/legs)
  // 0.035 in/week ≈ ~0.14 in/month → realistic lean bulk pace
  muscle: {
    growthPerWeek: 0.035
  },

  // Waist / stomach fat-area change in inches
  // Conservative so chart slope is realistic
  fatArea: {
    cutPerWeek: -0.12,      // -0.12 in/week
    recompPerWeek: -0.06    // slow recomposition
  },

  // Bodyfat % (unchanged)
  bodyFat: {
    cutPerWeek: -0.20       // % per week
  },

  // FFM (fat-free mass) — grows slower than circumference
  // 0.02–0.04 inches/week is realistic → use midpoint
  ffm: {
    gainPerWeek: 0.03
  }
}

/* -------------------------
   Helpers
------------------------- */

function daysBetweenTs(aTs: number, bTs: number) {
  return Math.round((bTs - aTs) / (1000 * 60 * 60 * 24))
}

/* -------------------------
   Category detection
------------------------- */
function metricCategory(metricKey?: string, title?: string) {
  const t = (metricKey || title || '').toLowerCase()

  if (t.includes('weight')) return 'weight'
  if (t.includes('bodyfat')) return 'bodyfat'
  if (t.includes('fatfreemass') || t.includes('ffm')) return 'ffm'

  if (t.includes('waist') || t.includes('stomach') || t.includes('belly'))
    return 'fat-area'

  if (
    t.includes('arm') ||
    t.includes('flexed') ||
    t.includes('unflexed') ||
    t.includes('forearm') ||
    t.includes('thigh') ||
    t.includes('calf') ||
    t.includes('chest') ||
    t.includes('neck') ||
    t.includes('shoulder') ||
    t.includes('quad')
  ) {
    return 'muscle'
  }

  return 'generic'
}

/* -------------------------
   Build ideal visible line
------------------------- */

function buildIdealSeries(
  chartData: { date: string; ts: number; value: number }[],
  metricKey: string | undefined,
  goalValue: number | undefined,
  profileMode: 'bulk' | 'cut' | 'recomp' | 'unknown'
) {
  if (!chartData || chartData.length === 0) return []

  const cat = metricCategory(metricKey)
  let perDay = 0
  const baseTs = chartData[0].ts
  const baseVal = chartData[0].value

  /* ---- Weight ---- */
  if (cat === 'weight') {
    if (profileMode === 'bulk') perDay = DEFAULTS.weight.bulkPerWeek / 7
    else if (profileMode === 'cut') perDay = DEFAULTS.weight.cutPerWeek / 7
    else perDay = 0
  }

  /* ---- Bodyfat ---- */
  else if (cat === 'bodyfat') {
    if (profileMode === 'cut') perDay = DEFAULTS.bodyFat.cutPerWeek / 7
    else if (profileMode === 'recomp') perDay = DEFAULTS.fatArea.recompPerWeek / 7
    else perDay = DEFAULTS.fatArea.cutPerWeek / 7
  }

  /* ---- Waist / Stomach ---- */
  else if (cat === 'fat-area') {
    if (profileMode === 'cut') perDay = DEFAULTS.fatArea.cutPerWeek / 7
    else if (profileMode === 'recomp') perDay = DEFAULTS.fatArea.recompPerWeek / 7
    else perDay = 0
  }

  /* ---- MUSCLE (arms/chest/legs/neck/calf/forearm etc.) ---- */
  else if (cat === 'muscle') {
    if (profileMode === 'cut') {
      perDay = 0 // fat loss phase → muscle stable
    } else if (profileMode === 'recomp') {
      perDay = (DEFAULTS.muscle.growthPerWeek * 0.6) / 7
    } else {
      perDay = DEFAULTS.muscle.growthPerWeek / 7 // bulk or unknown
    }
  }

  /* ---- Fat Free Mass (FFM) ---- */
  else if (cat === 'ffm') {
    if (profileMode === 'cut') perDay = 0
    else if (profileMode === 'recomp') perDay = (DEFAULTS.ffm.gainPerWeek * 0.5) / 7
    else perDay = DEFAULTS.ffm.gainPerWeek / 7
  }

  /* Build ideal by slope */
  let ideal = chartData.map((pt) => {
    const days = daysBetweenTs(baseTs, pt.ts)
    return { ...pt, ideal: baseVal + perDay * days }
  })

  /* Weight: interpolate toward goal (conservatively) */
  if (cat === 'weight' && typeof goalValue === 'number') {
    const lastTs = chartData[chartData.length - 1].ts
    const totalDays = daysBetweenTs(baseTs, lastTs)

    if (totalDays > 0) {
      const desiredPerDay = (goalValue - baseVal) / totalDays
      const cap = Math.abs(DEFAULTS.weight.bulkPerWeek) / 7

      const finalPerDay =
        Math.sign(desiredPerDay) *
        Math.min(Math.abs(desiredPerDay), Math.max(Math.abs(perDay), cap))

      ideal = chartData.map((pt) => {
        const days = daysBetweenTs(baseTs, pt.ts)
        return { ...pt, ideal: baseVal + finalPerDay * days }
      })
    }
  }

  return ideal
}

/* -------------------------
   Tooltip (Actual vs Ideal)
------------------------- */

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const byKey: Record<string, any> = {}
  for (const p of payload) {
    if (p?.dataKey) byKey[p.dataKey] = p
  }

  const actual = byKey['value']?.value
  const ideal = byKey['ideal']?.value
  const ts = payload[0]?.payload?.ts

  const diff =
    typeof actual === 'number' && typeof ideal === 'number'
      ? actual - ideal
      : null

  return (
    <div
      style={{
        borderRadius: 6,
        border: '1px solid #444',
        background: '#151515',
        color: '#fff',
        padding: 8,
        fontSize: 12
      }}
    >
      <div style={{ marginBottom: 6, opacity: 0.9 }}>
        {ts ? formatShortDate(ts) : ''}
      </div>

      {/* Actual */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ opacity: 0.8 }}>Actual</div>
        <strong>{typeof actual === 'number' ? actual.toFixed(2) : '—'}</strong>
      </div>

      {/* Ideal */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4
        }}
      >
        <div style={{ opacity: 0.8 }}>Ideal</div>
        <strong style={{ color: '#42a5f5' }}>
          {typeof ideal === 'number' ? ideal.toFixed(2) : '—'}
        </strong>
      </div>

      {/* Diff */}
      {diff !== null && (
        <div
          style={{
            marginTop: 6,
            fontWeight: 700,
            color: diff >= 0 ? '#4caf50' : '#e53935'
          }}
        >
          Diff: {(diff >= 0 ? '+' : '') + diff.toFixed(2)}
        </div>
      )}
    </div>
  )
}

/* -------------------------
   Main Component
------------------------- */

export function MetricChartCard({
  title,
  data,
  goalValue,
  metricKey
}: MetricAreaChartCardProps) {
  const [range, setRange] = useState<'7D' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>(
    'ALL'
  )
  const [showIdeal, setShowIdeal] = useState(false)

  const green = '#4caf50'
  const red = '#e53935'
  const whiteStroke = '#ffffff'
  const blue = '#42a5f5'

  /* Normalize base data */
  const baseData = useMemo(() => {
    return data
      .filter((d) => d.value != null)
      .map((d) => ({
        date: d.date,
        ts: new Date(d.date).getTime(),
        value: Number(d.value)
      }))
      .sort((a, b) => a.ts - b.ts)
  }, [data])

  /* Range filtering */
  const chartData = useMemo(() => {
    if (range === 'ALL') return baseData
    if (!baseData.length) return baseData

    const nowTs = baseData[baseData.length - 1].ts
    const ranges: Record<string, number> = {
      '7D': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365
    }
    const cutoff = nowTs - ranges[range] * 86400000

    return baseData.filter((d) => d.ts >= cutoff)
  }, [range, baseData])

  /* Compute segments for original green/red graph */
  const segments = useMemo(() => {
    const segs: any[] = []
    for (let i = 0; i < chartData.length - 1; i++) {
      const p1 = chartData[i]
      const p2 = chartData[i + 1]

      const dir =
        p2.value > p1.value ? 'up' : p2.value < p1.value ? 'down' : 'flat'

      segs.push({
        direction: dir,
        data: [p1, p2]
      })
    }
    return segs
  }, [chartData])

  /* Determine profile mode */
  const profileMode = useMemo(() => {
    if (typeof goalValue !== 'number' || !baseData.length) return 'unknown'
    const latest = baseData[baseData.length - 1].value
    const eps = 0.5

    if (goalValue > latest + eps) return 'bulk'
    if (goalValue < latest - eps) return 'cut'
    return 'recomp'
  }, [goalValue, baseData])

  /* Ideal series */
  const idealSeries = useMemo(
    () => buildIdealSeries(chartData, metricKey, goalValue, profileMode),
    [chartData, metricKey, goalValue, profileMode]
  )

  /* Merge actual + ideal for compare mode */
  const mergedData = useMemo(() => {
    const idealByTs: Record<number, number> = {}
    for (const it of idealSeries) idealByTs[it.ts] = it.ideal

    return chartData.map((pt) => ({
      ...pt,
      ideal:
        idealByTs[pt.ts] !== undefined ? Number(idealByTs[pt.ts]) : null
    }))
  }, [chartData, idealSeries])

  /* Y axis extents */
  const vals = chartData.map((d) => d.value)
  const min = vals.length ? Math.min(...vals) : 0
  const max = vals.length ? Math.max(...vals) : 1
  const pad = ((max - min) || 1) * 0.2
  const yMin = min - pad
  const yMax = max + pad

  const safeId = (s: string) =>
    s.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)

  const valueGradId = `valueGrad_${safeId(title)}`
  const idealGradId = `idealGrad_${safeId(title)}`

  /* Peak value for range */
  const peakValue = useMemo(
    () => (mergedData.length ? Math.max(...mergedData.map((d) => d.value)) : null),
    [mergedData]
  )

  return (
    <Card sx={{ height: 360 }}>
      <CardContent sx={{ height: '100%', pb: 0, position: 'relative' }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">{title}</Typography>

          <Stack
            direction="row"
            spacing={0}
            sx={{ background: '#222', borderRadius: '20px', overflow: 'hidden' }}
          >
            {['7D', '1M', '3M', '6M', '1Y', 'ALL'].map((r) => (
              <Button
                key={r}
                size="small"
                onClick={() => setRange(r as any)}
                sx={{
                  minWidth: 35,
                  textTransform: 'none',
                  color: range === r ? '#fff' : '#aaa',
                  background: range === r ? '#444' : 'transparent',
                  '&:hover': { background: '#555' }
                }}
              >
                {r}
              </Button>
            ))}
          </Stack>
        </Stack>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={showIdeal ? mergedData : chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
            <XAxis
              dataKey="ts"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(ts) => formatShortDate(ts)}
            />
            <YAxis domain={[yMin, yMax]} />

            <RechartsTooltip content={(props) => <CustomTooltip {...props} />} />

            {typeof goalValue === 'number' && (
              <ReferenceLine y={goalValue} stroke={green} strokeDasharray="4 4" />
            )}

            <defs>
              <linearGradient id={valueGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
              </linearGradient>

              <linearGradient id={idealGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={blue} stopOpacity={0.3} />
                <stop offset="100%" stopColor={blue} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            {/* Normal Mode green/red segments */}
            {!showIdeal &&
              segments.map((seg, idx) => {
                const color =
                  seg.direction === 'up'
                    ? green
                    : seg.direction === 'down'
                      ? red
                      : whiteStroke

                return (
                  <Area
                    key={`seg-${idx}`}
                    type="monotone"
                    data={seg.data}
                    dataKey="value"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.18}
                    isAnimationActive={false}
                    dot={false}
                    activeDot={false}
                  />
                )
              })}

            {/* Main actual line */}
            <Area
              type="monotone"
              dataKey="value"
              stroke={whiteStroke}
              strokeWidth={2}
              fill={`url(#${valueGradId})`}
              activeDot={{ r: 5, fill: '#fff' }}
              isAnimationActive={false}
            />

            {/* Compare Mode ideal */}
            {showIdeal && idealSeries.length > 0 && (
              <>
                <Area
                  type="monotone"
                  dataKey="ideal"
                  stroke="none"
                  fill={`url(#${idealGradId})`}
                  isAnimationActive={true}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="ideal"
                  stroke={blue}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: blue }}
                  isAnimationActive={true}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Bottom-left toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Button
            size="small"
            variant={showIdeal ? 'contained' : 'outlined'}
            onClick={() => setShowIdeal((s) => !s)}
            sx={{ textTransform: 'none', fontSize: 12, px: 1, py: 0.5, borderRadius: 1 }}
          >
            {showIdeal ? 'Hide ideal' : 'Compare pace'}
          </Button>

          {showIdeal && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 10, height: 6, background: blue, borderRadius: '2px' }} />
              <Typography variant="caption" sx={{ color: '#aaa' }}>
                Ideal
              </Typography>
            </Box>
          )}
        </Box>

        {/* Peak badge */}
        {peakValue != null && (
          <Box
            sx={{
              position: 'absolute',
              right: 12,
              bottom: 16,
              bgcolor: '#222',
              px: 1.2,
              py: 0.5,
              borderRadius: 1,
              fontSize: 12,
              color: '#fff',
              opacity: 0.95,
              border: '1px solid #444'
            }}
          >
            Peak: {peakValue.toFixed(2)}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
