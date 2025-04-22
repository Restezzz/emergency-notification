import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const MapPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Карта
        </Typography>
        
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            height: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5'
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Здесь будет отображаться интерактивная карта
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default MapPage; 