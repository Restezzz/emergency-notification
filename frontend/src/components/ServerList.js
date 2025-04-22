import React, { useState, useContext, useEffect } from 'react';
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
  Snackbar,
  Chip
} from '@mui/material';
import { Delete, Link as LinkIcon, LinkOff, AccountTreeOutlined } from '@mui/icons-material';
import ServerContext from '../context/ServerContext';

/**
 * Компонент управления серверами системы
 * 
 * Позволяет добавлять, удалять и подключаться к серверам.
 * Отображает статус TCP-соединения и идентификатор сессии.
 * Реализует двойное подключение - WebSocket и TCP.
 */
const ServerList = () => {
  // Получаем функции и состояния из контекста
  const {
    servers,
    addServer,
    removeServer,
    connectToServer,
    connectTcpToServer,
    disconnectFromServer,
    currentServer,
    isConnected,
    sessionId
  } = useContext(ServerContext);

  // Состояние для нового сервера
  const [newServer, setNewServer] = useState({
    name: '',
    ip: '',
    port: ''
  });
  
  // Состояния для уведомлений
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Обработчик изменения полей ввода
   * @param {Object} e - Событие изменения поля
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewServer({ ...newServer, [name]: value });
  };

  /**
   * Добавляет новый сервер в список
   */
  const handleAddServer = () => {
    if (!newServer.name || !newServer.ip || !newServer.port) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    addServer(newServer);
    setNewServer({ name: '', ip: '', port: '' });
    setSuccess('Сервер успешно добавлен');
  };

  /**
   * Подключается к выбранному серверу
   * @param {Object} server - Сервер для подключения
   */
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

  /**
   * Отключается от текущего сервера
   */
  const handleDisconnect = () => {
    disconnectFromServer();
    setSuccess('Отключено от сервера');
  };

  /**
   * Закрывает уведомления
   */
  const handleCloseAlert = () => {
    setError('');
    setSuccess('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление серверами
      </Typography>

      {isConnected && sessionId && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountTreeOutlined sx={{ mr: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Активная TCP-сессия: 
              <Chip label={sessionId} size="small" color="primary" sx={{ ml: 1 }} />
            </Box>
          </Box>
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Добавить новый сервер
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
            <Typography variant="body2">
              Доступные тестовые серверы: localhost:8000, localhost:8001, 127.0.0.1:8000
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5, color: 'text.secondary' }}>
              Для работы с локальным сервером необходимо запустить: <code>python backend/manage.py runserver</code>
            </Typography>
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