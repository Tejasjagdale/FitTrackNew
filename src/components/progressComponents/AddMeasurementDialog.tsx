// src/components/progressComponents/AddMeasurementDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  Typography
} from '@mui/material';

import { MeasurementsEntry, ProfileData } from '../../data/progressTypes';
import { getTodayIndia } from '../../data/progressUtils';

/* -----------------------------------------
   Utility: Convert inches → centimeters
------------------------------------------ */
const inToCm = (inch?: number) =>
  inch === undefined ? undefined : inch * 2.54;

/* -----------------------------------------
   Male-Only US Navy Body Fat Formula
   NOTE: expects measurements in CM
------------------------------------------ */
function calculateBodyFat(heightCm?: number, neckCm?: number, waistCm?: number) {
  if (!heightCm || !neckCm || !waistCm) return undefined;
  if (waistCm <= neckCm) return undefined;

  return (
    495 /
      (1.0324 -
        0.19077 * Math.log10(waistCm - neckCm) +
        0.15456 * Math.log10(heightCm)) -
    450
  );
}

function calculateFatFreeMass(weightKg?: number, bfPercent?: number) {
  if (!weightKg || !bfPercent) return undefined;
  return weightKg * (1 - bfPercent / 100);
}

/* -----------------------------------------
   MAIN COMPONENT
------------------------------------------ */
interface MeasurementDialogProps {
  open: boolean;
  date?: string;
  initial?: MeasurementsEntry;
  onClose: () => void;
  onSave: (date: string, data: MeasurementsEntry) => void;
  profile: ProfileData;
  latestWeight?: number; // in KG
}

export function AddMeasurementDialog({
  open,
  date,
  initial,
  onClose,
  onSave,
  profile,
  latestWeight
}: MeasurementDialogProps) {
  const [localDate, setLocalDate] = useState('');
  const [form, setForm] = useState<MeasurementsEntry>({});

  useEffect(() => {
    if (open) {
      setLocalDate(date || getTodayIndia());
      setForm(initial || {});
    }
  }, [open, date, initial]);

  /* -----------------------------------------
     HANDLE CHANGE (VALUES ENTERED IN INCHES)
  ------------------------------------------ */
  const handleChange =
    (key: keyof MeasurementsEntry) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const numInches = raw === '' ? undefined : Number(raw);

      setForm(prev => {
        const updated = { ...prev, [key]: numInches };

        // Convert neck/waist to cm for BF formula
        const waistCm = inToCm(updated.waist);
        const neckCm = inToCm(updated.neck);
        const heightCm = profile.heightCm;

        // Auto Body Fat %
        const bf = calculateBodyFat(heightCm, neckCm, waistCm);
        if (bf && !isNaN(bf)) {
          updated.bodyFat = Number(bf.toFixed(2));
        } else {
          updated.bodyFat = undefined;
        }

        // Auto Fat Free Mass
        if (latestWeight && updated.bodyFat !== undefined) {
          const ffm = calculateFatFreeMass(latestWeight, updated.bodyFat);
          if (ffm && !isNaN(ffm)) {
            updated.fatFreeMass = Number(ffm.toFixed(2));
          } else {
            updated.fatFreeMass = undefined;
          }
        }

        return updated;
      });
    };

  /* -----------------------------------------
     SAVE
  ------------------------------------------ */
  const handleSubmit = () => {
    if (!localDate) return;
    onSave(localDate, form);
    onClose();
  };

  /* -----------------------------------------
     RENDER
  ------------------------------------------ */
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initial ? 'Edit Measurements' : 'Add Measurements'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Date"
            type="date"
            value={localDate}
            onChange={e => setLocalDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* Arms */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Unflexed Arms (in)"
              type="number"
              value={form.unflexedArms ?? ''}
              onChange={handleChange('unflexedArms')}
            />
            <TextField
              fullWidth
              label="Flexed Arms (in)"
              type="number"
              value={form.flexedArms ?? ''}
              onChange={handleChange('flexedArms')}
            />
          </Stack>

          {/* Forearms + Thighs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Forearms (in)"
              type="number"
              value={form.forearms ?? ''}
              onChange={handleChange('forearms')}
            />
            <TextField
              fullWidth
              label="Thighs (in)"
              type="number"
              value={form.thighs ?? ''}
              onChange={handleChange('thighs')}
            />
          </Stack>

          {/* Calf + Chest */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Calf (in)"
              type="number"
              value={form.calf ?? ''}
              onChange={handleChange('calf')}
            />
            <TextField
              fullWidth
              label="Chest (in)"
              type="number"
              value={form.chest ?? ''}
              onChange={handleChange('chest')}
            />
          </Stack>

          {/* Stomach + Waist */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Stomach (in)"
              type="number"
              value={form.stomach ?? ''}
              onChange={handleChange('stomach')}
            />
            <TextField
              fullWidth
              label="Waist (in)"
              type="number"
              value={form.waist ?? ''}
              onChange={handleChange('waist')}
            />
          </Stack>

          {/* Neck + Body Fat */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Neck (in)"
              type="number"
              value={form.neck ?? ''}
              onChange={handleChange('neck')}
            />
            <TextField
              fullWidth
              label="Body Fat (%)"
              type="number"
              value={form.bodyFat ?? ''}
              disabled // auto-calculated
            />
          </Stack>

          {/* FFM */}
          <TextField
            fullWidth
            label="Fat Free Mass (kg)"
            type="number"
            value={form.fatFreeMass ?? ''}
            disabled
          />

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            All inputs are in inches. Body Fat % & Fat-Free Mass auto-calc from neck, waist,
            height, and today's weight.
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
  );
}
