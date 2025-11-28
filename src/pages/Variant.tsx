import React, { useEffect, useState, useMemo } from 'react'
import {
  Container,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AddIcon from '@mui/icons-material/Add'
import { EditVariantCard } from '../components/EditVariantCard'
import { getWorkoutState } from '../data/workoutUtils'
import { getGitHubService, isGitHubConfigured } from '../data/githubService'
import { loadData, getData, setData, syncToGitHub } from '../data/dataService'
import type { Variant } from '../data/workoutUtils'

export default function VariantPage() {
  const [loading, setLoading] = useState(true)
  const [variants, setVariants] = useState<Variant[]>([])
  const [syncMessage, setSyncMessage] = useState('')
  const [syncError, setSyncError] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const hasGitHubToken = isGitHubConfigured()

  // load GitHub data on mount
  useEffect(() => {
    const load = async () => {
      try {
        await loadData()
        const baseData = getData()
        setVariants(baseData.variants || [])
      } catch (err) {
        console.error(err)
        setSyncError('Failed to load data from GitHub.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // detect unsaved changes
  const unsavedChanges = useMemo(() => {
    if (loading) return false
    try {
      const base = getData().variants || []
      return JSON.stringify(base) !== JSON.stringify(variants)
    } catch {
      return false
    }
  }, [variants, loading])

  const handleVariantUpdate = (index: number, updated: Variant) => {
    const newVariants = [...variants]
    newVariants[index] = updated
    setVariants(newVariants)
  }

  const handleAddVariant = () => {
    const newVariant: Variant = {
      variantName: `New Variant ${variants.length + 1}`,
      exercisesList: [],
      exerciseOrder: []
    }
    setVariants([...variants, newVariant])
  }

  const handleDeleteVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSyncToGitHub = async () => {
    setIsSyncing(true)
    setSyncError('')
    setSyncMessage('')

    try {
      const githubService = getGitHubService()
      if (!githubService) {
        setSyncError('GitHub token not configured in .env file')
        setIsSyncing(false)
        return
      }

      // update in-memory JSON before push
      const current = getData()
      const newData = { ...current, variants }
      setData(newData)

      await syncToGitHub(`Update workout variants - ${new Date().toLocaleString()}`)

      setSyncMessage('✓ Successfully synced to GitHub!')
      setTimeout(() => setSyncMessage(''), 3000)
    } catch (error) {
      setSyncError(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSyncing(false)
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }}>Loading workout variants from GitHub…</Typography>
      </Container>
    )
  }

  const baseData = getData()
  const state = getWorkoutState()
  const weeklyOrder = baseData.weeklyOrder || []
  const nextVariantIndex = weeklyOrder.findIndex(
    (name: string) => !state.completedVariants.includes(name)
  )

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Workout Variants
            </Typography>

            {unsavedChanges ? (
              <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
                You have unsaved changes. Sync to GitHub to persist them.
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Loaded from GitHub. Changes are temporary until synced.
              </Typography>
            )}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddVariant}
            >
              Add Variant
            </Button>

            {hasGitHubToken && unsavedChanges && (
              <Button
                startIcon={isSyncing ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                onClick={handleSyncToGitHub}
                variant="contained"
                color="success"
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing…' : 'Sync to GitHub'}
              </Button>
            )}
          </Stack>
        </Box>

        {nextVariantIndex >= 0 && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              background: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(0,200,83,0.12)'
                  : 'rgba(0,200,83,0.08)',
              border: '1px solid rgba(0,200,83,0.25)'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ⭐ Next in rotation: <strong>{weeklyOrder[nextVariantIndex]}</strong>
            </Typography>
          </Box>
        )}

        {variants.map((variant, idx) => (
          <EditVariantCard
            key={variant.variantName ?? idx}
            variant={variant}
            onUpdate={(updated) => handleVariantUpdate(idx, updated)}
            onDelete={() => handleDeleteVariant(idx)}
          />
        ))}
      </Box>

      {syncMessage && (
        <Snackbar
          open={true}
          autoHideDuration={3000}
          onClose={() => setSyncMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success">{syncMessage}</Alert>
        </Snackbar>
      )}

      {syncError && (
        <Snackbar
          open={true}
          autoHideDuration={5000}
          onClose={() => setSyncError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error">{syncError}</Alert>
        </Snackbar>
      )}
    </Container>
  )
}
