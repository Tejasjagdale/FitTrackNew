// src/components/progressComponents/AddMeasurementDialog.tsx
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
import { MeasurementsEntry, ProfileData } from '../../data/progressTypes'
import { getTodayIndia } from '../../data/progressUtils'

interface MeasurementDialogProps {
  open: boolean
  date?: string
  initial?: MeasurementsEntry
  onClose: () => void
  onSave: (date: string, data: MeasurementsEntry) => void

  // NEW
  profile: ProfileData
  latestWeight?: number
}

/* ----------------------------------------------------
   BODY FAT FORMULAS (US NAVY)
---------------------------------------------------- */
function calculateBodyFat(
  gender: string | undefined,
  heightCm: number | undefined,
  neck: number | undefined,
  waist: number | undefined,
) {
  if (!gender || !heightCm || !neck || !waist) return undefined;

  const height = heightCm;

  if (gender === "male") {
    if (waist <= neck) return undefined; // avoid log10 error
    return (
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist - neck) +
          0.15456 * Math.log10(height)) -
      450
    );
  }
}

function calculateFatFreeMass(weightKg: number | undefined, bodyFatPercent: number | undefined) {
  if (!weightKg || !bodyFatPercent) return undefined;
  return weightKg * (1 - bodyFatPercent / 100);
}

/* ----------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------- */
export function AddMeasurementDialog({
  open,
  date,
  initial,
  onClose,
  onSave,
  profile,
  latestWeight
}: MeasurementDialogProps) {

  const [localDate, setLocalDate] = useState<string>('')
  const [form, setForm] = useState<MeasurementsEntry>({})

  useEffect(() => {
    if (open) {
      setLocalDate(date || getTodayIndia())
      setForm(initial || {})
    }
  }, [open, date, initial])

  /* ----------------------------------------------------
     HANDLE FIELD CHANGE + AUTO CALCULATIONS
  ---------------------------------------------------- */
  const handleChange =
    (key: keyof MeasurementsEntry) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      const num = v === '' ? undefined : Number(v)

      setForm((prev) => {
        const updated: MeasurementsEntry = { ...prev, [key]: num }

        // AUTO-CALC BODY FAT %
        const bf = calculateBodyFat(
          profile.gender,
          profile.heightCm,
          updated.neck,
          updated.waist,
        );

        if (bf !== undefined && !isNaN(bf)) {
          updated.bodyFat = Number(bf.toFixed(2))
        }

        // AUTO-CALC FAT FREE MASS
        if (latestWeight && updated.bodyFat !== undefined) {
          const ffm = calculateFatFreeMass(latestWeight, updated.bodyFat)
          if (ffm !== undefined) {
            updated.fatFreeMass = Number(ffm.toFixed(2))
          }
        }

        return updated
      })
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

          {/* ARMS */}
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

          {/* FOREARMS + THIGHS */}
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

          {/* CALF + CHEST */}
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

          {/* STOMACH + WAIST */}
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

          {/* NECK + BODY FAT (auto) */}
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
              disabled // AUTO-CALCULATED
            />
          </Stack>

          {/* FAT FREE MASS (auto) */}
          <TextField
            label="Fat Free Mass"
            type="number"
            value={form.fatFreeMass ?? ''}
            onChange={handleChange('fatFreeMass')}
            fullWidth
            disabled // AUTO-CALCULATED
          />

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            BodyFat% and Fat-Free Mass auto-calculate based on your height, weight, waist & neck.
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
