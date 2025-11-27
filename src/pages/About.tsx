import React from 'react'
import { Container, Typography, Box } from '@mui/material'

export default function About() {
  return (
    <Container>
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          About
        </Typography>
        <Typography variant="body1">fitTrack starter app — routing and MUI configured.</Typography>
      </Box>
    </Container>
  )
}
