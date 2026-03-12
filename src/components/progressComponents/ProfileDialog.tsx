import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography
} from "@mui/material"

import { ProfileData } from "../../data/progressTypes"
import { useAppTheme } from "../../theme/ThemeContext"

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

  const { theme, setTheme } = useAppTheme()

  /* sync initial data */
  useEffect(() => {
    if (open) setForm(initial)
  }, [open, initial])

  /* auto BMI */
  useEffect(() => {
    const h = form.heightCm ? form.heightCm / 100 : undefined
    if (form.goalWeight && h) {
      const bmi = form.goalWeight / (h * h)
      setForm(prev => ({
        ...prev,
        targetBMI: Number(bmi.toFixed(1))
      }))
    }
  }, [form.goalWeight, form.heightCm])

  const handleChange =
    (key: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {

      const val = e.target.value
      let parsed: any = val

      if (key === "age" || key === "heightCm" || key === "goalWeight") {
        parsed = val === "" ? undefined : Number(val)
      }

      setForm(prev => ({
        ...prev,
        [key]: parsed
      }))
    }

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = e.target.value as any

    setForm(prev => ({
      ...prev,
      theme: newTheme
    }))

    setTheme(newTheme)
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
            value={form.name || ""}
            onChange={handleChange("name")}
            fullWidth
          />

          <TextField
            label="Age"
            type="number"
            value={form.age || ""}
            onChange={handleChange("age")}
            fullWidth
          />

          <TextField
            select
            label="Gender"
            value={form.gender || ""}
            onChange={handleChange("gender")}
            fullWidth
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>

          <TextField
            label="Height (cm)"
            type="number"
            value={form.heightCm || ""}
            onChange={handleChange("heightCm")}
            fullWidth
          />

          <TextField
            label="Goal Weight (kg)"
            type="number"
            value={form.goalWeight || ""}
            onChange={handleChange("goalWeight")}
            fullWidth
          />

          <TextField
            label="Target BMI"
            type="number"
            value={form.targetBMI || ""}
            disabled
            fullWidth
            helperText="Auto-calculated from height & goal weight"
          />

          <Box pt={1}>
            <Typography variant="subtitle2" gutterBottom>
              App Theme
            </Typography>

            <TextField
              select
              value={form.theme || theme}
              onChange={handleThemeChange}
              fullWidth
            >
              <MenuItem value="apple">Apple Liquid Glass</MenuItem>
              <MenuItem value="jarvis">AI Jarvis</MenuItem>
              <MenuItem value="pokemon">Pokemon</MenuItem>
              <MenuItem value="cherry">Cherry Blossom</MenuItem>
            </TextField>
          </Box>

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