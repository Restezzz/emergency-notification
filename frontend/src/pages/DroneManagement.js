import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DroneData from '../components/DroneData';

/**
 * Страница управления дронами
 */
const DroneManagement = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/" color="inherit">
            Главная
          </Link>
          <Typography color="text.primary">Управление дронами</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 4 }}>
          Управление дронами
        </Typography>
        
        <Paper elevation={0} sx={{ mb: 3, p: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            На этой странице отображается информация о доступных дронах, их статусе и текущем положении.
            В режиме симуляции вы можете протестировать работу системы с тестовыми данными.
          </Typography>
        </Paper>
        
        <DroneData />
      </Box>
    </Container>
  );
};

export default DroneManagement;

 