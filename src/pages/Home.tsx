import React from 'react'
import { Container, Typography, Box } from '@mui/material'

export default function Home() {
  return (
    <Container>
      <Box sx={{ py: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to fitTrack
        </Typography>
        <Typography variant="body1">A simple starter with React, TypeScript, React Router, and MUI.</Typography>
      </Box>
    </Container>
  )
}
