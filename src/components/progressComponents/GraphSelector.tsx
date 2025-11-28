// src/components/progress/GraphSelector.tsx
import React from 'react'
import { Box, TextField } from '@mui/material'

interface GraphSelectorProps {
  selectedGraph: string
  onChange: (value: string) => void
  measurementKeys: string[]
}

export function GraphSelector({
  selectedGraph,
  onChange,
  measurementKeys
}: GraphSelectorProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        select
        label="Select Graph"
        value={selectedGraph}
        onChange={(e) => onChange(e.target.value)}
        SelectProps={{ native: true }}
        sx={{ minWidth: 240 }}
      >
        <option value="none">None</option>
        <option value="weight">Weight</option>
        <option value="bmi">BMI</option>
        <option value="seeAll">See All</option>
        {measurementKeys.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </TextField>
    </Box>
  )
}
