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

  // Ensure every loaded variant has an ID
  const ensureIds = (v: Variant[]): Variant[] =>
    v.map((item) => ({
      ...item,
      id: item.id ?? crypto.randomUUID()
    }))

  // Load GitHub data + normalize IDs
  useEffect(() => {
    const load = async () => {
      try {
        await loadData()
        const base = getData()
        const fixed = ensureIds(base.variants || [])
        setVariants(fixed)

        // Write IDs back to memory so sync includes them
        setData({ ...base, variants: fixed })
      } catch (err) {
        console.error(err)
        setSyncError('Failed to load data from GitHub.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Detect unsaved changes
  const unsavedChanges = useMemo(() => {
    if (loading) return false
    try {
      const baseVariants = (getData().variants || []).map((v: Variant) => ({
        ...v,
        // Remove ordering differences
        exerciseOrder: v.exerciseOrder || [],
        exercisesList: v.exercisesList || []
      }))
      const local = variants.map((v) => ({
        ...v,
        exerciseOrder: v.exerciseOrder || [],
        exercisesList: v.exercisesList || []
      }))
      return JSON.stringify(baseVariants) !== JSON.stringify(local)
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
      id: crypto.randomUUID(),
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
      const github = getGitHubService()
      if (!github) {
        setSyncError('GitHub token not configured')
        setIsSyncing(false)
        return
      }

      const current = getData()
      const updated = { ...current, variants }

      setData(updated)

      await syncToGitHub(
        `Update workout variants - ${new Date().toLocaleString('en-IN')}`
      )

      setSyncMessage('✓ Successfully synced to GitHub!')
      setTimeout(() => setSyncMessage(''), 3000)
    } catch (err: any) {
      setSyncError(`Sync failed: ${err?.message || 'Unknown error'}`)
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

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        {/* Header + Actions */}
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
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddVariant}>
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

        {/* All Variant Cards */}
        {variants.map((variant, idx) => (
          <EditVariantCard
            key={variant.id}
            variant={variant}
            onUpdate={(u) => handleVariantUpdate(idx, u)}
            onDelete={() => handleDeleteVariant(idx)}
          />
        ))}
      </Box>

      {/* Notifications */}
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
