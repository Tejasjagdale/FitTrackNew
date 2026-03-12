import React, { useEffect, useState, useMemo } from 'react'
import {
  Container,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  useTheme
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

  const theme = useTheme()

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
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>

        {/* ===== Premium Hero Header ===== */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 2,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',

            background: `linear-gradient(
              160deg,
              ${theme.palette.primary.main}20 0%,
              ${theme.palette.primary.main}08 100%
            )`,

            border: `1px solid ${theme.palette.primary.main}40`,
            backdropFilter: 'blur(14px)',
            boxShadow: `0 20px 60px ${theme.palette.primary.main}25`,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(
    circle at top left,
    ${theme.palette.primary.main}22,
    transparent 40%
  )`,
              pointerEvents: 'none'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2
            }}
          >
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.4px',

                  fontSize: {
                    xs: '1.4rem',
                    sm: '1.8rem',
                    md: '2rem'
                  },

                  lineHeight: 1.2,

                  background: `linear-gradient(
      135deg,
      ${theme.palette.primary.light} 0%,
      ${theme.palette.primary.dark} 100%
    )`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Workout Variants
              </Typography>

              {unsavedChanges ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.success.main,
                    fontWeight: 700,
                    mt: 0.5
                  }}
                >
                  Unsaved changes detected — sync to GitHub to persist.
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ opacity: 0.7, mt: 0.5 }}
                >
                  Loaded from GitHub. Changes remain local until synced.
                </Typography>
              )}
            </Box>

            {/* ===== Action Buttons ===== */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                width: { xs: '100%', sm: 'auto' },

                '& button': {
                  width: { xs: '100%', sm: 'auto' }
                }
              }}
            >
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddVariant}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,

                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    background: `${theme.palette.primary.main}15`
                  }
                }}
              >
                Add Variant
              </Button>

              {hasGitHubToken && unsavedChanges && (
                <Button
                  startIcon={isSyncing ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  onClick={handleSyncToGitHub}
                  variant="contained"
                  disabled={isSyncing}
                  sx={{
                    fontWeight: 800,
                    position: 'relative',

                    background: `linear-gradient(
    135deg,
    ${theme.palette.primary.light} 0%,
    ${theme.palette.primary.dark} 100%
  )`,

                    animation: !isSyncing && unsavedChanges
                      ? 'syncPulse 2.4s ease-in-out infinite'
                      : 'none',

                    boxShadow: `0 12px 30px ${theme.palette.primary.main}50`,

                    '&:hover': {
                      boxShadow: `0 18px 45px ${theme.palette.primary.main}70`
                    },

                    '&::after': !isSyncing && unsavedChanges ? {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: 'inherit',
                      border: `1px solid ${theme.palette.primary.light}`,
                      animation: 'syncRing 2.4s ease-in-out infinite'
                    } : {},

                    '@keyframes syncPulse': {
                      '0%': {
                        transform: 'scale(1)',
                        boxShadow: `0 10px 25px ${theme.palette.primary.main}35`
                      },
                      '50%': {
                        transform: 'scale(1.04)',
                        boxShadow: `0 18px 50px ${theme.palette.primary.main}70`
                      },
                      '100%': {
                        transform: 'scale(1)',
                        boxShadow: `0 10px 25px ${theme.palette.primary.main}35`
                      }
                    },

                    '@keyframes syncRing': {
                      '0%': { opacity: 0.7, transform: 'scale(1)' },
                      '50%': { opacity: 0.2, transform: 'scale(1.08)' },
                      '100%': { opacity: 0.7, transform: 'scale(1)' }
                    }
                  }}

                >
                  {isSyncing ? 'Syncing…' : 'Sync'}
                </Button>
              )}
            </Stack>
          </Box>
        </Box>

        {/* ===== Premium Variants Section ===== */}
        <Box
          sx={{
            p: { xs: 1.5, md: 2.5 },
            borderRadius: 1,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(12px)'
          }}
        >
          {variants.map((variant, idx) => (
            <EditVariantCard
              key={variant.id}
              variant={variant}
              onUpdate={(u) => handleVariantUpdate(idx, u)}
              onDelete={() => handleDeleteVariant(idx)}
            />
          ))}
        </Box>
      </Box>

      {/* Notifications unchanged */}
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
