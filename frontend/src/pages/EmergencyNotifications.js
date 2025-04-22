import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const EmergencyNotifications = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Экстренные уведомления
        </Typography>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="body1">
            Здесь будет список экстренных уведомлений и настройка системы оповещения.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmergencyNotifications; 