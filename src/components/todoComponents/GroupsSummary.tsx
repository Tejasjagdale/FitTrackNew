import React from 'react'
import { Card, CardContent, Typography, Stack, Box, LinearProgress } from '@mui/material'
import CategoryIcon from '@mui/icons-material/Category'
import { Group, Task } from '../../types/todoModels'

interface Props {
  groups: Group[]
  tasks: Task[]
}

// Professional color palette
const groupColors = [
  { primary: '#4285f4', light: 'rgba(66, 133, 244, 0.1)' },
  { primary: '#34a8e0', light: 'rgba(52, 168, 224, 0.1)' },
  { primary: '#1e88e5', light: 'rgba(30, 136, 229, 0.1)' },
  { primary: '#5c6bc0', light: 'rgba(92, 107, 192, 0.1)' },
  { primary: '#00897b', light: 'rgba(0, 137, 123, 0.1)' },
  { primary: '#455a64', light: 'rgba(69, 90, 100, 0.1)' },
]

export default function GroupsSummary({ groups, tasks }: Props) {
  const groupStats = groups.map((g, idx) => {
    const total = tasks.filter(t => Array.isArray(t.groupIds) && t.groupIds.includes(g.id)).length
    const pending = tasks.filter(t => Array.isArray(t.groupIds) && t.groupIds.includes(g.id) && t.status === 'pending').length
    const completed = total - pending
    
    return {
      group: g,
      total,
      pending,
      completed,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
      color: groupColors[idx % groupColors.length]
    }
  })

  const allCompleted = tasks.filter(t => t.status === 'completed').length
  const allTotal = tasks.length
  const totalProgress = allTotal === 0 ? 0 : Math.round((allCompleted / allTotal) * 100)

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(92, 107, 192, 0.04) 0%, rgba(69, 90, 100, 0.04) 100%)',
        border: '1px solid rgba(92, 107, 192, 0.12)',
        borderRadius: 2,
        height: '100%'
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <CategoryIcon sx={{ color: '#5c6bc0', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Groups Performance
          </Typography>
        </Box>

        {groups.length === 0 ? (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', py: 2 }}>
            No groups yet
          </Typography>
        ) : (
          <Stack spacing={2}>
            {/* Overall Stats */}
            <Box sx={{ pb: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                  All Tasks
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#4285f4', fontSize: '0.85rem' }}>
                  {allCompleted}/{allTotal}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalProgress}
                sx={{
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(66, 133, 244, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4285f4',
                    borderRadius: 2
                  }
                }}
              />
            </Box>

            {/* Individual Groups */}
            <Stack spacing={1.5}>
              {groupStats.map(({ group, total, completed, progress, color }) => (
                <Box 
                  key={group.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: `1px solid ${color.primary}15`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: color.light,
                      borderColor: `${color.primary}40`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem' }}>
                      {group.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: color.primary, fontSize: '0.8rem' }}>
                      {completed}/{total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: `${color.primary}15`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: color.primary,
                        borderRadius: 1.5
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
