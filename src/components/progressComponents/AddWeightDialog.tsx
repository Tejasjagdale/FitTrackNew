// src/components/progress/AddWeightDialog.tsx
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button
} from '@mui/material'
import { getTodayIndia } from './../../data/progressUtils'

interface WeightDialogProps {
  open: boolean
  initialDate?: string
  initialWeight?: number
  onClose: () => void
  onSave: (date: string, weight: number) => void
}

export function AddWeightDialog({
  open,
  initialDate,
  initialWeight,
  onClose,
  onSave
}: WeightDialogProps) {
  const [date, setDate] = useState<string>('')
  const [weight, setWeight] = useState<string>('')

  useEffect(() => {
    if (open) {
      setDate(initialDate || getTodayIndia())
      setWeight(initialWeight !== undefined ? String(initialWeight) : '')
    }
  }, [open, initialDate, initialWeight])

  const handleSubmit = () => {
    const w = Number(weight)
    if (!date || Number.isNaN(w) || w <= 0) return
    onSave(date, w)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{initialDate ? 'Edit Weight' : 'Add Weight'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Weight (kg)"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
