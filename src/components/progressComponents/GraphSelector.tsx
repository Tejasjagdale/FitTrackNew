// src/components/progress/GraphSelector.tsx
import React from 'react'
import { Box, MenuItem, TextField } from '@mui/material'

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
        sx={{ minWidth: 240 }}
      >
        <MenuItem value="none">None</MenuItem>
        <MenuItem value="weight">Weight</MenuItem>
        <MenuItem value="bmi">BMI</MenuItem>
        <MenuItem value="seeAll">See All</MenuItem>

        {measurementKeys.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}
