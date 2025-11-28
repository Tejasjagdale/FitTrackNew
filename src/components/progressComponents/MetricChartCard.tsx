// src/components/progress/MetricChartCard.tsx
import React, { useMemo } from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Line,
  Area
} from 'recharts'
import { MeasurementPoint } from '../../data/progressTypes'
import { formatShortDate } from './../../data/progressUtils'

interface MetricChartCardProps {
  title: string
  data: MeasurementPoint[]
  goalValue?: number
}

export function MetricChartCard({ title, data, goalValue }: MetricChartCardProps) {
  // Convert to Recharts-friendly structure with timestamp
  const chartData = useMemo(
    () =>
      data
        .filter((d) => d.value !== undefined && d.value !== null)
        .map((d) => ({
          date: d.date,
          ts: new Date(d.date).getTime(),
          value: d.value as number
        })),
    [data]
  )

  const segments = useMemo(() => {
    const segs: {
      direction: 'up' | 'down' | 'flat'
      data: { date: string; ts: number; value: number }[]
    }[] = []

    for (let i = 0; i < chartData.length - 1; i++) {
      const p1 = chartData[i]
      const p2 = chartData[i + 1]

      let direction: 'up' | 'down' | 'flat' = 'flat'
      if (p2.value > p1.value) direction = 'up'
      else if (p2.value < p1.value) direction = 'down'

      segs.push({
        direction,
        data: [p1, p2]
      })
    }
    return segs
  }, [chartData])

  const green = '#4caf50'
  const red = '#e53935'
  const neutral = '#8884d8'

  return (
    <Card sx={{ height: 260 }}>
      <CardContent sx={{ height: '100%' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {title}
        </Typography>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(ts) => formatShortDate(ts)}
            />
            <YAxis />
            <RechartsTooltip
              labelFormatter={(ts) => formatShortDate(ts)}
              formatter={(value: any) => [value, title]}
            />

            {goalValue !== undefined && (
              <ReferenceLine
                y={goalValue}
                label="Goal"
                stroke="#4caf50"
                strokeDasharray="4 4"
              />
            )}

            {/* Segment areas */}
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
                />
              )
            })}

            {/* Overlay line with dots on all data points */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00000050"
              dot={{ r: 3, strokeWidth: 1, fill: '#000' }}
              activeDot={{ r: 5 }}
              strokeWidth={1}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
