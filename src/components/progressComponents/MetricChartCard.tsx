// src/components/progress/MetricAreaChartCard.tsx

import React, { useMemo, useState } from 'react'
import { Card, CardContent, Typography, Stack, Button } from '@mui/material'
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Area
} from 'recharts'
import { MeasurementPoint } from '../../data/progressTypes'
import { formatShortDate } from './../../data/progressUtils'

// Tooltip as before
const CustomTooltip = ({ active, payload, label, title }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const main = payload[0]
  const value = main?.value

  return (
    <div
      style={{
        borderRadius: 6,
        border: '1px solid #444',
        background: '#151515',
        color: '#fff',
        padding: '6px 8px',
        fontSize: 12
      }}
    >
      <div style={{ marginBottom: 4, opacity: 0.85 }}>
        {formatShortDate(main?.payload?.ts)}
      </div>

      <div>
        <span style={{ opacity: 0.75, marginRight: 4 }}>{title}:</span>
        <span>{value}</span>
      </div>
    </div>
  )
}

interface MetricAreaChartCardProps {
  title: string
  data: MeasurementPoint[]
  goalValue?: number
}

export function MetricChartCard({ title, data, goalValue }: MetricAreaChartCardProps) {
  const [range, setRange] = useState<'7D' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('ALL')

  // Convert base data
  const baseData = useMemo(
    () =>
      data
        .filter(d => d.value != null)
        .map(d => ({
          date: d.date,
          ts: new Date(d.date).getTime(),
          value: d.value as number
        })),
    [data]
  )

  // --- TIME FILTERING ---
  const filteredData = useMemo(() => {
    if (range === 'ALL') return baseData
    if (baseData.length === 0) return baseData

    const now = baseData[baseData.length - 1].ts // latest data point

    const ranges: Record<string, number> = {
      '7D': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365
    }

    const days = ranges[range]
    const cutoff = now - days * 24 * 60 * 60 * 1000

    return baseData.filter(d => d.ts >= cutoff)
  }, [range, baseData])

  const chartData = filteredData

  // Segments (same logic)
  const segments = useMemo(() => {
    const segs: any[] = []
    for (let i = 0; i < chartData.length - 1; i++) {
      const p1 = chartData[i]
      const p2 = chartData[i + 1]

      let dir: 'up' | 'down' | 'flat' = 'flat'
      if (p2.value > p1.value) dir = 'up'
      else if (p2.value < p1.value) dir = 'down'

      segs.push({ direction: dir, data: [p1, p2] })
    }
    return segs
  }, [chartData])

  // Auto Y zoom
  const values = chartData.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = ((max - min) || 1) * 0.2
  const yMin = min - padding
  const yMax = max + padding

  const green = '#4caf50'
  const red = '#e53935'
  const neutral = '#8884d8'

  return (
    <Card sx={{ height: 320 }}>
      <CardContent sx={{ height: '100%', pb: 0 }}>

        {/* Title + Buttons */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle2">{title}</Typography>

          {/* Time Range Toggle */}
          <Stack
            direction="row"
            spacing={0}
            sx={{
              background: '#222',
              borderRadius: '20px',
              overflow: 'hidden'
            }}
          >
            {['7D', '1M', '3M', '6M', '1Y', 'ALL'].map((r) => (
              <Button
                key={r}
                size="small"
                onClick={() => setRange(r as any)}
                sx={{
                  minWidth: 35,
                  borderRadius: 0,
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
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

            <XAxis
              dataKey="ts"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(ts) => formatShortDate(ts)}
            />

            <YAxis domain={[yMin, yMax]} />

            <RechartsTooltip
              content={(props) => <CustomTooltip title={title} {...props} />}
            />

            {/* Goal Line */}
            {goalValue !== undefined && (
              <ReferenceLine
                y={goalValue}
                stroke={green}
                strokeDasharray="4 4"
              />
            )}

            {/* Segments */}
            {segments.map((seg, idx) => {
              const color =
                seg.direction === 'up'
                  ? green
                  : seg.direction === 'down'
                  ? red
                  : neutral

              return (
                <Area
                  key={idx}
                  type="monotone"
                  data={seg.data}
                  dataKey="value"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.25}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                />
              )
            })}

            {/* Main Area */}
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="value"
              stroke="#ffffff80"
              strokeWidth={2}
              fill="url(#valueGradient)"
              activeDot={{ r: 5, fill: '#fff' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
