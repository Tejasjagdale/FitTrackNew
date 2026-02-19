import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Stack
} from '@mui/material'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import TodayIcon from '@mui/icons-material/Today'
import ChecklistIcon from '@mui/icons-material/Checklist'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import { useNavigate } from 'react-router-dom'
import { loadTodoData, getTodoData } from '../data/todoDataService'
import { QUOTES } from '../data/quotes'


export default function Home() {
  const navigate = useNavigate()
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        await loadTodoData()

        if (cancelled) return

        const db = getTodoData()
      } catch (err) {
        console.error('Failed to initialize:', err)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch motivational quote - one per day
useEffect(() => {
  // deterministic quote of the day
  const today = new Date().toISOString().split('T')[0]

  const hash = today
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const index = hash % QUOTES.length

  setQuote(QUOTES[index])
}, [])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Daily Motivational Quote */}
      {quote && (
        <Card
          sx={{
            mb: 5,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '2px solid rgba(102, 126, 234, 0.3)',
            borderRadius: 2
          }}
        >
          <CardContent sx={{ py: 2, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <FormatQuoteIcon sx={{ fontSize: 32, color: '#667eea', opacity: 0.6, mt: 0.5, flexShrink: 0 }} />
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontStyle: 'italic',
                    fontWeight: 500,
                    mb: 1.5,
                    color: 'text.primary',
                    lineHeight: 1.6
                  }}
                >
                  "{quote.text}"
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: '#667eea'
                  }}
                >
                  — {quote.author}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick Start Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Let's Go
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<FitnessCenterIcon />}
              size="large"
              onClick={() => navigate('/today')}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)'
                },
                transition: 'all 0.3s'
              }}
            >
              Start Today's Workout
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ChecklistIcon />}
              size="large"
              onClick={() => navigate('/todo')}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderWidth: 2,
                  background: 'rgba(102, 126, 234, 0.08)'
                },
                transition: 'all 0.3s'
              }}
            >
              Manage Tasks
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main Features Grid */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2.5, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Features
        </Typography>
        <Grid container spacing={2}>
          {/* Workout Variants */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)',
                  borderColor: 'rgba(102, 126, 234, 0.4)'
                }
              }}
              onClick={() => navigate('/variant')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <FitnessCenterIcon sx={{ fontSize: 40, mb: 1.5, color: '#667eea' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Workout Variants
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Create & customize exercises
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Playlists */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s',
                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                border: '1px solid rgba(255, 107, 107, 0.2)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(255, 107, 107, 0.15)',
                  borderColor: 'rgba(255, 107, 107, 0.4)'
                }
              }}
              onClick={() => navigate('/workout-playlist')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <TodayIcon sx={{ fontSize: 40, mb: 1.5, color: '#ff6b6b' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Playlists
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Organize workout routines
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress Dashboard */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s',
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(76, 175, 80, 0.15)',
                  borderColor: 'rgba(76, 175, 80, 0.4)'
                }
              }}
              onClick={() => navigate('/progress')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <ShowChartIcon sx={{ fontSize: 40, mb: 1.5, color: '#4caf50' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Progress
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Track your improvement
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Exercise Database */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s',
                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(3, 169, 244, 0.1) 100%)',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(33, 150, 243, 0.15)',
                  borderColor: 'rgba(33, 150, 243, 0.4)'
                }
              }}
              onClick={() => navigate('/exercise-database')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <ChecklistIcon sx={{ fontSize: 40, mb: 1.5, color: '#2196f3' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Exercise DB
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Browse all exercises
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}
