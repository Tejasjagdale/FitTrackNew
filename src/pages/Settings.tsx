import React, { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Divider
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import GitHubIcon from '@mui/icons-material/GitHub'
import { getGitHubService, setGitHubToken, removeGitHubToken } from '../data/githubService'

export default function SettingsPage() {
  const [token, setToken] = useState('')
  const [isTokenSet, setIsTokenSet] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showTokenDialog, setShowTokenDialog] = useState(false)

  useEffect(() => {
    // Check if token is already set
    const savedToken = localStorage.getItem('gitHubToken')
    setIsTokenSet(!!savedToken)
  }, [])

  const handleValidateAndSave = async () => {
    if (!token.trim()) {
      setValidationError('Please enter a token')
      return
    }

    setIsValidating(true)
    setValidationError('')
    setSuccessMessage('')

    try {
      // Create a temporary service to validate
      const tempService = new (await import('../data/githubService')).GitHubService(token)
      const isValid = await tempService.validateToken()

      if (isValid) {
        setGitHubToken(token)
        setIsTokenSet(true)
        setSuccessMessage('GitHub token saved successfully!')
        setToken('')
        setShowTokenDialog(false)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setValidationError('Invalid token. Please check your GitHub Personal Access Token.')
      }
    } catch (error) {
      setValidationError(`Error validating token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveToken = () => {
    removeGitHubToken()
    setIsTokenSet(false)
    setSuccessMessage('GitHub token removed')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Settings
        </Typography>

        {/* GitHub Integration Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GitHubIcon sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                GitHub Integration
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Connect your GitHub account to sync workout data with your github-db repository.
            </Typography>

            {isTokenSet ? (
              <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 2 }}>
                ✓ GitHub token is configured
              </Alert>
            ) : (
              <Alert icon={<ErrorIcon />} severity="warning" sx={{ mb: 2 }}>
                ⚠ GitHub token not configured. Your changes will only be saved locally.
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            {validationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationError}
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              {isTokenSet ? (
                <>
                  <Button variant="contained" color="error" onClick={handleRemoveToken}>
                    Remove Token
                  </Button>
                  <Button variant="outlined" onClick={() => setShowTokenDialog(true)}>
                    Update Token
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => setShowTokenDialog(true)}>
                  Set GitHub Token
                </Button>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              How to get your GitHub Personal Access Token:
            </Typography>
            <Typography variant="body2" component="ol" sx={{ pl: 2, color: 'text.secondary' }}>
              <li>Go to <Link href="https://github.com/settings/tokens" target="_blank">GitHub Settings → Personal Access Tokens</Link></li>
              <li>Click "Generate new token (classic)"</li>
              <li>Give it a name (e.g., "FitTrack")</li>
              <li>Select scopes: <code>repo</code> (full control of repositories)</li>
              <li>Click "Generate token"</li>
              <li>Copy the token and paste it below</li>
            </Typography>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Repository Configuration
            </Typography>
            <Box sx={{ p: 1.5, background: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
              <div>Owner: Tejasjagdale</div>
              <div>Repo: github-db</div>
              <div>File: workoutData.json</div>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Token Input Dialog */}
      <Dialog open={showTokenDialog} onClose={() => setShowTokenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>GitHub Personal Access Token</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Your token will be stored securely in your browser's local storage and never sent anywhere except to GitHub API.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="GitHub Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            disabled={isValidating}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTokenDialog(false)} disabled={isValidating}>
            Cancel
          </Button>
          <Button
            onClick={handleValidateAndSave}
            variant="contained"
            disabled={isValidating || !token.trim()}
            startIcon={isValidating ? <CircularProgress size={20} /> : undefined}
          >
            {isValidating ? 'Validating...' : 'Save Token'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
