import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Dashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель управления
        </Typography>
        <Typography variant="body1">
          Здесь будет основная информация панели управления.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard; 