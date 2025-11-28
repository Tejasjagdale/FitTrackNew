// src/components/progress/AddMeasurementDialog.tsx
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  Typography
} from '@mui/material'
import { MeasurementsEntry } from '../../data/progressTypes'
import { getTodayIndia } from '../../data/progressUtils'

interface MeasurementDialogProps {
  open: boolean
  date?: string
  initial?: MeasurementsEntry
  onClose: () => void
  onSave: (date: string, data: MeasurementsEntry) => void
}

export function AddMeasurementDialog({
  open,
  date,
  initial,
  onClose,
  onSave
}: MeasurementDialogProps) {
  const [localDate, setLocalDate] = useState<string>('')
  const [form, setForm] = useState<MeasurementsEntry>({})

  useEffect(() => {
    if (open) {
      setLocalDate(date || getTodayIndia())
      setForm(initial || {})
    }
  }, [open, date, initial])

  const handleChange =
    (key: keyof MeasurementsEntry) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setForm((prev) => ({
        ...prev,
        [key]: v === '' ? undefined : Number(v)
      }))
    }

  const handleSubmit = () => {
    if (!localDate) return
    onSave(localDate, form)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Edit Measurements' : 'Add Measurements'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Date"
            type="date"
            value={localDate}
            onChange={(e) => setLocalDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Unflexed Arms"
              type="number"
              value={form.unflexedArms ?? ''}
              onChange={handleChange('unflexedArms')}
              fullWidth
            />
            <TextField
              label="Flexed Arms"
              type="number"
              value={form.flexedArms ?? ''}
              onChange={handleChange('flexedArms')}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Forearms"
              type="number"
              value={form.forearms ?? ''}
              onChange={handleChange('forearms')}
              fullWidth
            />
            <TextField
              label="Thighs"
              type="number"
              value={form.thighs ?? ''}
              onChange={handleChange('thighs')}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Calf"
              type="number"
              value={form.calf ?? ''}
              onChange={handleChange('calf')}
              fullWidth
            />
            <TextField
              label="Chest"
              type="number"
              value={form.chest ?? ''}
              onChange={handleChange('chest')}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Stomach"
              type="number"
              value={form.stomach ?? ''}
              onChange={handleChange('stomach')}
              fullWidth
            />
            <TextField
              label="Waist"
              type="number"
              value={form.waist ?? ''}
              onChange={handleChange('waist')}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Neck"
              type="number"
              value={form.neck ?? ''}
              onChange={handleChange('neck')}
              fullWidth
            />
            <TextField
              label="Body Fat (%)"
              type="number"
              value={form.bodyFat ?? ''}
              onChange={handleChange('bodyFat')}
              fullWidth
            />
          </Stack>

          <TextField
            label="Fat Free Mass"
            type="number"
            value={form.fatFreeMass ?? ''}
            onChange={handleChange('fatFreeMass')}
            fullWidth
          />

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Tip: You usually only update these full measurements every ~15 days.
          </Typography>
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
