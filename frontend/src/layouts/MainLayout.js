import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Container,
  IconButton
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Map as MapIcon,
  Flight as FlightIcon,
  Menu as MenuIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';

// Ширина боковой панели
const drawerWidth = 240;

// Элементы меню
const menuItems = [
  { text: 'Панель управления', icon: <DashboardIcon />, path: '/' },
  { text: 'Карта', icon: <MapIcon />, path: '/map' },
  { text: 'Уведомления', icon: <NotificationsIcon />, path: '/notifications' },
  { text: 'Управление дронами', icon: <FlightIcon />, path: '/drones' },
  { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' }
];

/**
 * Основной макет приложения с боковым меню
 */
const MainLayout = () => {
  const navigate = useNavigate();
  
  // Обработчик выхода из системы
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Верхняя панель */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#1976d2'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Система экстренного оповещения
          </Typography>
          
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Боковое меню */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            bgcolor: '#f5f5f5'
          }
        }}
      >
        <Toolbar />
        
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                component={RouterLink} 
                to={item.path}
                sx={{ 
                  '&.active': { bgcolor: 'rgba(0, 0, 0, 0.08)' },
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
        </Box>
      </Drawer>
      
      {/* Основной контент */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f9f9f9',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout; 