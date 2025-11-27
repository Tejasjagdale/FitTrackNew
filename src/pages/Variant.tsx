import React, { useState } from 'react'
import { Container, Box, Typography, Button, Snackbar, Alert } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { EditVariantCard } from '../components/EditVariantCard'
import workoutData, { getWorkoutState } from '../data/workoutUtils'
import type { Variant } from '../data/workoutUtils'

export default function VariantPage() {
  const [variants, setVariants] = useState<Variant[]>(workoutData.variants)
  const [saved, setSaved] = useState(false)

  const handleVariantUpdate = (index: number, updated: Variant) => {
    const newVariants = [...variants]
    newVariants[index] = updated
    setVariants(newVariants)
  }

  const handleSaveAll = () => {
    localStorage.setItem('customVariants', JSON.stringify(variants))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const state = getWorkoutState()
  const nextVariantIndex = workoutData.weeklyOrder.findIndex((name) => !state.completedVariants.includes(name))

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Workout Variants
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Edit exercises, sets, reps, and rest times. Changes save to your device.
            </Typography>
          </Box>
          <Button startIcon={<SaveIcon />} onClick={handleSaveAll} variant="contained">
            Save Changes
          </Button>
        </Box>

        {nextVariantIndex >= 0 && (
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: (t) => t.palette.mode === 'dark' ? 'rgba(0,200,83,0.1)' : 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.2)' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ⭐ Next in rotation: <strong>{workoutData.weeklyOrder[nextVariantIndex]}</strong>
            </Typography>
          </Box>
        )}

        {variants.map((variant, idx) => (
          <EditVariantCard key={variant.variantName} variant={variant} onUpdate={(updated) => handleVariantUpdate(idx, updated)} />
        ))}
      </Box>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success">Changes saved successfully!</Alert>
      </Snackbar>
    </Container>
  )
}
