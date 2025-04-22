import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Chip
} from '@mui/material';
import ServerContext from '../context/ServerContext';

/**
 * Компонент навигационной панели
 * 
 * Отображает название системы, статус подключения к серверу
 * и навигационные ссылки на основные разделы приложения.
 */
const Header = () => {
  // Получаем информацию о подключении из контекста
  const { isConnected, currentServer } = useContext(ServerContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Система оповещений о ЧС
        </Typography>

        {isConnected && currentServer && (
          <Chip 
            label={`Подключено: ${currentServer.name} (${currentServer.ip}:${currentServer.port})`}
            color="success"
            size="small"
            sx={{ mr: 2 }}
          />
        )}

        <Box>
          <Button component={RouterLink} to="/" color="inherit">
            Главная
          </Button>
          <Button component={RouterLink} to="/servers" color="inherit">
            Серверы
          </Button>
          <Button component={RouterLink} to="/events" color="inherit">
            События
          </Button>
          <Button component={RouterLink} to="/drones" color="inherit">
            Дроны
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 