import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  List, 
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const Settings = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Настройки
        </Typography>
        
        <Paper elevation={1} sx={{ p: 0 }}>
          <List>
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Общие настройки" 
                secondary="Конфигурация основных параметров системы" 
              />
            </ListItem>
            
            <Divider />
            
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Настройки уведомлений" 
                secondary="Управление каналами и шаблонами уведомлений" 
              />
            </ListItem>
            
            <Divider />
            
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Настройки дронов" 
                secondary="Конфигурация параметров мониторинга дронов" 
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings; 