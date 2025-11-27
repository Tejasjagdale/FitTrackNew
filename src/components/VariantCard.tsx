import React from 'react'
import { Card, CardHeader, CardContent, List, ListItem, Chip, Box, Typography, useTheme } from '@mui/material'

interface SetItem {
  step: number
  action: string
  name: string
  set: number
  reps: string
  restSeconds: number
}

export default function VariantCard({ exerciseName, sets }: { exerciseName: string; sets: SetItem[] }) {
  const theme = useTheme()

  return (
    <Card
      sx={(t) => ({
        width: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        background: t.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))' : 'rgba(255,255,255,0.8)',
        border: t.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: t.palette.mode === 'dark' ? '0 8px 28px rgba(0,0,0,0.6)' : '0 8px 20px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(6px) saturate(120%)',
        '&:hover': {
          transform: 'translateY(-6px)'
        }
      })}
    >
      <CardHeader
        title={<Typography variant="h6" sx={{ color: theme.palette.primary.main }}>{exerciseName}</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <List disablePadding>
          {sets.map((s) => (
            <ListItem
              key={s.step}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                py: 1
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Set {s.set}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Step {s.step}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={`${s.reps} reps`} color="primary" size="small" />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Rest: {s.restSeconds}s
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
