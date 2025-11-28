// src/components/progress/ProfileDialog.tsx
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  MenuItem
} from '@mui/material'
import { ProfileData } from '../../data/progressTypes'

interface ProfileDialogProps {
  open: boolean
  initial: ProfileData
  onClose: () => void
  onSave: (data: ProfileData) => void
}

export function ProfileDialog({
  open,
  initial,
  onClose,
  onSave
}: ProfileDialogProps) {
  const [form, setForm] = useState<ProfileData>(initial)

  useEffect(() => {
    if (open) setForm(initial)
  }, [open, initial])

  const handleChange =
    (key: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setForm((prev) => ({
        ...prev,
        [key]: key === 'age' || key === 'heightCm' ? Number(val) : val
      }))
    }

  const handleSubmit = () => {
    onSave(form)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>User Profile</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            value={form.name || ''}
            onChange={handleChange('name')}
            fullWidth
          />
          <TextField
            label="Age"
            type="number"
            value={form.age || ''}
            onChange={handleChange('age')}
            fullWidth
          />
          <TextField
            select
            label="Gender"
            value={form.gender || ''}
            onChange={handleChange('gender')}
            fullWidth
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            label="Height (cm)"
            type="number"
            value={form.heightCm || ''}
            onChange={handleChange('heightCm')}
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
