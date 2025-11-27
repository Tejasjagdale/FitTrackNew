import React, { useState } from 'react'
import { Container, Box, Typography, Button, Snackbar, Alert, CircularProgress, Stack } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { EditVariantCard } from '../components/EditVariantCard'
import workoutData, { getWorkoutState } from '../data/workoutUtils'
import { getGitHubService } from '../data/githubService'
import type { Variant } from '../data/workoutUtils'

export default function VariantPage() {
  const [variants, setVariants] = useState<Variant[]>(workoutData.variants)
  const [saved, setSaved] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [hasGitHubToken, setHasGitHubToken] = useState(!!localStorage.getItem('gitHubToken'))

  const handleVariantUpdate = (index: number, updated: Variant) => {
    const newVariants = [...variants]
    newVariants[index] = updated
    setVariants(newVariants)
  }

  const handleSaveLocal = () => {
    localStorage.setItem('customVariants', JSON.stringify(variants))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSyncToGitHub = async () => {
    setIsSyncing(true)
    setSyncError('')
    setSyncMessage('')

    try {
      const githubService = getGitHubService()

      if (!githubService) {
        setSyncError('GitHub token not configured. Go to Settings to add your token.')
        setIsSyncing(false)
        return
      }

      // Prepare the data structure
      const dataToSync = {
        weeklyOrder: workoutData.weeklyOrder,
        variants: variants
      }

      // Update on GitHub
      await githubService.updateWorkoutData(dataToSync, `Update workout variants - ${new Date().toLocaleString()}`)

      setSyncMessage('✓ Successfully synced to GitHub!')
      setTimeout(() => setSyncMessage(''), 3000)
    } catch (error) {
      setSyncError(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const state = getWorkoutState()
  const nextVariantIndex = workoutData.weeklyOrder.findIndex((name) => !state.completedVariants.includes(name))

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Workout Variants
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Edit exercises, sets, reps, and rest times. Changes save to your device.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button startIcon={<SaveIcon />} onClick={handleSaveLocal} variant="contained">
              Save Locally
            </Button>
            {hasGitHubToken && (
              <Button
                startIcon={isSyncing ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                onClick={handleSyncToGitHub}
                variant="contained"
                color="success"
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync to GitHub'}
              </Button>
            )}
          </Stack>
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
        <Alert severity="success">Changes saved to device!</Alert>
      </Snackbar>

      {syncMessage && (
        <Snackbar open={true} autoHideDuration={3000} onClose={() => setSyncMessage('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="success">{syncMessage}</Alert>
        </Snackbar>
      )}

      {syncError && (
        <Snackbar open={true} autoHideDuration={5000} onClose={() => setSyncError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="error">{syncError}</Alert>
        </Snackbar>
      )}
    </Container>
  )
}
