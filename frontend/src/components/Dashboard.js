import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import ServerContext from '../context/ServerContext';
import { Warning, Info, Error, CheckCircle } from '@mui/icons-material';

const Dashboard = () => {
  const { isConnected, currentServer } = useContext(ServerContext);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    by_severity: {
      'Низкая': 0,
      'Средняя': 0,
      'Высокая': 0,
      'Критическая': 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    // Загрузка данных из локального хранилища при инициализации
    const savedStats = localStorage.getItem('emergency_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Ошибка при загрузке статистики из кэша:', e);
      }
    }

    const savedEvents = localStorage.getItem('emergency_events');
    if (savedEvents) {
      try {
        const events = JSON.parse(savedEvents);
        setRecentEvents(events.slice(0, 5)); // Последние 5 событий
      } catch (e) {
        console.error('Ошибка при загрузке событий из кэша:', e);
      }
    }
    
    setLoading(false);

    // Регулярно запрашиваем данные с сервера, если подключены
    if (isConnected && currentServer) {
      const fetchData = async () => {
        try {
          // Запрос статистики
          const response = await fetch(`http://${currentServer.ip}:${currentServer.port}/api/statistics/`);
          const data = await response.json();
          setStats(data);
          localStorage.setItem('emergency_stats', JSON.stringify(data));

          // Запрос последних событий
          const eventsResponse = await fetch(`http://${currentServer.ip}:${currentServer.port}/api/emergency-events/active/`);
          const eventsData = await eventsResponse.json();
          setRecentEvents(eventsData.slice(0, 5));
        } catch (error) {
          console.error('Ошибка при получении данных дашборда:', error);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 30000); // Каждые 30 секунд

      return () => clearInterval(interval);
    }
  }, [isConnected, currentServer]);

  const getSeverityIcon = (severity) => {
    // Проверяем, что severity - строка
    if (typeof severity !== 'string') {
      return <Info color="success" />;
    }
    
    switch (severity.toLowerCase()) {
      case 'критическая':
        return <Error color="error" />;
      case 'высокая':
        return <Warning color="error" />;
      case 'средняя':
        return <Warning color="warning" />;
      default:
        return <Info color="success" />;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель мониторинга ЧС
      </Typography>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Вы не подключены к серверу. Данные могут быть устаревшими.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Статистика */}
        <Grid size={6} smsize={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Статистика ЧС
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Всего зарегистрировано ЧС: <strong>{stats.total}</strong>
              </Typography>
              <Typography variant="body1">
                Активные ЧС: <strong>{stats.active}</strong>
              </Typography>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              По уровню опасности:
            </Typography>
            
            <Grid container spacing={1}>
              <Grid size={6}>
                <Typography variant="body2">Критическая:</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" fontWeight="bold" color="error">
                  {stats.by_severity['Критическая']}
                </Typography>
              </Grid>
              
              <Grid size={6}>
                <Typography variant="body2">Высокая:</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" fontWeight="bold" color="error">
                  {stats.by_severity['Высокая']}
                </Typography>
              </Grid>
              
              <Grid size={6}>
                <Typography variant="body2">Средняя:</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" fontWeight="bold" color="warning.main">
                  {stats.by_severity['Средняя']}
                </Typography>
              </Grid>
              
              <Grid size={6}>
                <Typography variant="body2">Низкая:</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {stats.by_severity['Низкая']}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Статус подключения */}
        <Grid size={6} smsize={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Статус системы
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {isConnected ? (
                <>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Система онлайн и полностью функциональна
                  </Typography>
                </>
              ) : (
                <>
                  <Error color="error" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Система офлайн. Подключитесь к серверу для получения актуальных данных.
                  </Typography>
                </>
              )}
            </Box>
            
            {isConnected && currentServer && (
              <Box>
                <Typography variant="body2">
                  Подключен к серверу: <strong>{currentServer.name}</strong>
                </Typography>
                <Typography variant="body2">
                  Адрес: {currentServer.ip}:{currentServer.port}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Последние события */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Последние события
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentEvents.length === 0 ? (
              <Alert severity="info">
                Нет активных событий ЧС.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {recentEvents.map((event, index) => (
                  <Grid size={12} key={event.id || index}>
                    <Card variant="outlined" className={`emergency-${typeof event.severity === 'string' ? event.severity.toLowerCase() : 'low'}`}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getSeverityIcon(event.severity)}
                          <Typography variant="subtitle1" sx={{ ml: 1 }}>
                            {event.title}
                          </Typography>
                          <Typography variant="caption" sx={{ ml: 'auto' }}>
                            {new Date(event.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {event.description.length > 100 ? 
                            `${event.description.substring(0, 100)}...` : 
                            event.description}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                          Местоположение: {event.location}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 