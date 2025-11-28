import React from 'react'
import { Container, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import TodayIcon from '@mui/icons-material/Today'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <Container sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          fitTrack
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 520, mx: 'auto' }}>
          Your fitness companion. Track workouts, measure progress, and stay consistent.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Button
          variant="contained"
          size="large"
          sx={{ px: 4, py: 1.4, borderRadius: 2 }}
          onClick={() => navigate('/today')}
        >
          Start Today’s Workout
        </Button>
      </Box>

      {/* Feature Grid */}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              cursor: 'pointer',
              transition: '0.2s',
              '&:hover': { boxShadow: 4 }
            }}
            onClick={() => navigate('/variant')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <FitnessCenterIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Workout Variants</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Browse and switch between your stored workout routines.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              cursor: 'pointer',
              transition: '0.2s',
              '&:hover': { boxShadow: 4 }
            }}
            onClick={() => navigate('/today')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <TodayIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Today's Workout</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Start your selected workout and track your steps.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              cursor: 'pointer',
              transition: '0.2s',
              '&:hover': { boxShadow: 4 }
            }}
            onClick={() => navigate('/progress')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <ShowChartIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Progress Dashboard</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Monitor your weight, BMI, measurements and trends.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
