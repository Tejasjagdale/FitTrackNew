// src/components/progressComponents/AddDailyHealthDialog.tsx

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  FormControlLabel,
  Checkbox
} from '@mui/material'

import { DailyHealthStatus } from '../../data/progressTypes'
import { getTodayIndia } from '../../data/progressUtils'

interface Props {
  open: boolean
  date?: string
  initial?: DailyHealthStatus
  onClose: () => void
  onSave: (date: string, data: DailyHealthStatus) => void
}

export default function AddDailyHealthDialog({
  open,
  date,
  initial,
  onClose,
  onSave
}: Props) {
  const today = getTodayIndia()
  const [entryDate, setEntryDate] = useState(date || today)

  const [condition, setCondition] = useState<DailyHealthStatus['condition']>(
    initial?.condition || 'healthy'
  )

  const [dietQuality, setDietQuality] =
    useState<DailyHealthStatus['dietQuality']>(
      initial?.dietQuality || 'adequate'
    )

  const [mood, setMood] = useState<DailyHealthStatus['mood']>(
    initial?.mood || 'neutral'
  )

  const [studied, setStudied] = useState<boolean>(initial?.studied || false)

  const handleSave = () => {
    onSave(entryDate, { condition, dietQuality, mood, studied })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Daily Health Status</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>

          <TextField
            label="Date"
            type="date"
            fullWidth
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="stomachIssue">Stomach Issue</MenuItem>
            <MenuItem value="bodyPain">Body Pain</MenuItem>
            <MenuItem value="coldOrFever">Cold / Fever</MenuItem>
            <MenuItem value="healthy">Healthy</MenuItem>
          </TextField>

          <TextField
            select
            label="Diet Quality"
            value={dietQuality}
            onChange={(e) => setDietQuality(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="insufficient">Less / Insufficient</MenuItem>
            <MenuItem value="adequate">Adequate / On Point</MenuItem>
            <MenuItem value="excess">More / Excess</MenuItem>
          </TextField>

          <TextField
            select
            label="Mood"
            value={mood}
            onChange={(e) => setMood(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="sad">Sad</MenuItem>
            <MenuItem value="neutral">Neutral</MenuItem>
            <MenuItem value="happy">Happy</MenuItem>
          </TextField>

          <FormControlLabel
            control={
              <Checkbox
                checked={studied}
                onChange={(e) => setStudied(e.target.checked)}
              />
            }
            label="Studied Today"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}
