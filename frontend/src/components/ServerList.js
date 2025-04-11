import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  TextField,
  Grid,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { Delete, Link as LinkIcon, LinkOff } from '@mui/icons-material';
import ServerContext from '../context/ServerContext';

const ServerList = () => {
  const {
    servers,
    addServer,
    removeServer,
    connectToServer,
    connectTcpToServer,
    disconnectFromServer,
    currentServer,
    isConnected
  } = useContext(ServerContext);

  const [newServer, setNewServer] = useState({
    name: '',
    ip: '',
    port: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewServer({ ...newServer, [name]: value });
  };

  const handleAddServer = () => {
    if (!newServer.name || !newServer.ip || !newServer.port) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    addServer(newServer);
    setNewServer({ name: '', ip: '', port: '' });
    setSuccess('Сервер успешно добавлен');
  };

  const handleConnect = async (server) => {
    try {
      // Более чёткая проверка локального режима
      const isLocalMode = server.ip === 'localhost' || 
                          server.ip === '127.0.0.1' || 
                          server.ip.startsWith('192.168.');
      
      if (isLocalMode) {
        console.log('Локальный режим активирован');
        
        // Устанавливаем соединение с локальным сервером
        connectToServer(server);
        await connectTcpToServer(server);
        setSuccess(`Подключено к локальному серверу ${server.name} (тестовый режим)`);
        return;
      }
      
      // Подключаемся сначала к WebSocket
      const wsConnected = connectToServer(server);
      
      if (!wsConnected) {
        setError('Не удалось установить WebSocket подключение');
        return;
      }
      
      // Затем к TCP
      try {
        const tcpConnected = await connectTcpToServer(server);
        
        if (!tcpConnected) {
          setError('Не удалось установить TCP подключение');
          disconnectFromServer(); // Отключаемся, если TCP не подключился
          return;
        }
        
        setSuccess(`Подключено к серверу ${server.name}`);
      } catch (tcpError) {
        console.error('Ошибка TCP подключения:', tcpError);
        setError('Ошибка при подключении к серверу: проверьте доступность сервера');
        disconnectFromServer(); // Отключаемся при ошибке
      }
    } catch (error) {
      console.error('Ошибка при подключении:', error);
      setError('Не удалось подключиться к серверу: неизвестная ошибка');
      disconnectFromServer();
    }
  };

  const handleDisconnect = () => {
    disconnectFromServer();
    setSuccess('Отключено от сервера');
  };

  const handleCloseAlert = () => {
    setError('');
    setSuccess('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление серверами
      </Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Добавить новый сервер
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            Для тестирования без сервера используйте: IP=localhost, порт=8000. 
            Если данные не отображаются, проверьте, что бэкенд-сервер запущен на порту 8000 (команда python backend/manage.py runserver).
          </Alert>
        </Box>
        <Grid container spacing={2}>
          <Grid size={4}>
            <TextField
              fullWidth
              label="Название"
              name="name"
              value={newServer.name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              fullWidth
              label="IP-адрес"
              name="ip"
              value={newServer.ip}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid size={2}>
            <TextField
              fullWidth
              label="Порт"
              name="port"
              value={newServer.port}
              onChange={handleInputChange}
              type="number"
            />
          </Grid>
          <Grid size={2} sx={{ display: "flex", alignItems: "center" }}>
            <Button variant="contained" onClick={handleAddServer} fullWidth>
              Добавить
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Список серверов
      </Typography>

      {servers.length === 0 ? (
        <Alert severity="info">Нет доступных серверов. Добавьте сервер выше.</Alert>
      ) : (
        <Paper>
          <List>
            {servers.map((server) => (
              <React.Fragment key={server.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      {currentServer && currentServer.id === server.id && isConnected ? (
                        <IconButton edge="end" onClick={handleDisconnect} title="Отключиться">
                          <LinkOff />
                        </IconButton>
                      ) : (
                        <IconButton edge="end" onClick={() => handleConnect(server)} title="Подключиться">
                          <LinkIcon />
                        </IconButton>
                      )}
                      <IconButton 
                        edge="end" 
                        onClick={() => removeServer(server.id)}
                        disabled={currentServer && currentServer.id === server.id && isConnected}
                        title="Удалить"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={server.name}
                    secondary={`${server.ip}:${server.port}`}
                    primaryTypographyProps={{ 
                      fontWeight: currentServer && currentServer.id === server.id ? 'bold' : 'normal'
                    }}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServerList; 