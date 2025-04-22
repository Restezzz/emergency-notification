import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          mt: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center' 
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Страница не найдена
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Запрашиваемая страница не существует или была перемещена.
        </Typography>
        <Button 
          component={RouterLink} 
          to="/" 
          variant="contained" 
          color="primary"
        >
          На главную
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 