import React, { useState, useEffect, useContext, useRef } from 'react';
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
  LinearProgress,
  Snackbar,
  Button,
  Chip
} from '@mui/material';
import ServerContext from '../context/ServerContext';
import { Warning, Info, Error, CheckCircle, Notifications } from '@mui/icons-material';

/**
 * Главный компонент панели мониторинга ЧС
 * 
 * Отображает общую статистику по ЧС, информацию о подключении к серверу
 * и последние события. Реализует систему критических уведомлений
 * с звуковыми оповещениями для случаев эвакуации.
 */
const Dashboard = () => {
  // Получаем данные из контекста
  const { isConnected, currentServer, socket, sessionId } = useContext(ServerContext);
  
  // Состояния для хранения данных
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
  const [criticalAlert, setCriticalAlert] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Добавляем ref для хранения AudioContext
  const audioContextRef = useRef(null);
  
  // Инициализация AudioContext при взаимодействии с пользователем
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.error('Не удалось создать AudioContext:', e);
      }
    }
    return audioContextRef.current;
  };
  
  // Воспроизведение звукового уведомления
  const playAlertSound = () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    
    try {
      // Создаем осциллятор для генерации базового сигнала
      const oscillator1 = audioContext.createOscillator();
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(440, audioContext.currentTime);
      
      const oscillator2 = audioContext.createOscillator();
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(523, audioContext.currentTime);
      
      // Создаем усилитель для контроля громкости
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
      
      // Подключаем осцилляторы к усилителю
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      
      // Подключаем усилитель к выходу
      gainNode.connect(audioContext.destination);
      
      // Запускаем и останавливаем осцилляторы
      oscillator1.start();
      oscillator2.start();
      
      // Длительность сигнала - 1 секунда
      oscillator1.stop(audioContext.currentTime + 1);
      oscillator2.stop(audioContext.currentTime + 1);
    } catch (e) {
      console.error('Не удалось воспроизвести звук уведомления:', e);
    }
  };
  
  // Обработчик закрытия уведомления
  const handleCloseAlert = () => {
    setShowAlert(false);
    // Создаем AudioContext при взаимодействии пользователя
    initAudioContext();
  };

  // Проверка на критические события, требующие эвакуации
  useEffect(() => {
    if (recentEvents.length > 0) {
      // Ищем критическое событие, связанное с эвакуацией
      const criticalEvent = recentEvents.find(event => 
        event.severity === 'Критическая' && 
        (event.title.includes('ЭВАКУАЦИЯ') || event.description.includes('эвакуация') || 
         event.event_type === 'Эвакуация')
      );
      
      if (criticalEvent) {
        setCriticalAlert(criticalEvent);
        setShowAlert(true);
      }
    }
  }, [recentEvents]);

  // Обработка событий WebSocket, включая эвакуацию
  useEffect(() => {
    if (socket && isConnected) {
      const originalOnMessage = socket.onmessage;
      
      socket.onmessage = (event) => {
        if (originalOnMessage) {
          originalOnMessage(event);
        }
        
        try {
          const data = JSON.parse(event.data);
          
          // Если получили новое событие, проверяем на критический приоритет
          if (data.type === 'emergency_event') {
            const newEvent = data.event;
            
            if (newEvent.severity === 'Критическая' && 
                (newEvent.title.includes('ЭВАКУАЦИЯ') || newEvent.description.includes('эвакуация') ||
                 newEvent.event_type === 'Эвакуация')) {
              
              setCriticalAlert(newEvent);
              setShowAlert(true);
              
              // Воспроизводим звук только если AudioContext уже инициализирован
              if (audioContextRef.current) {
                playAlertSound();
              }
            }
            
            // Обновляем список последних событий
            setRecentEvents(prev => {
              const updated = [newEvent, ...prev].slice(0, 5);
              return updated;
            });
          }
        } catch (e) {
          console.error('Ошибка обработки WebSocket сообщения:', e);
        }
      };
      
      return () => {
        if (socket) {
          socket.onmessage = originalOnMessage;
        }
      };
    }
  }, [socket, isConnected]);

  // Проверяем при загрузке есть ли критические события
  useEffect(() => {
    // Если есть критическое событие в загруженных данных и AudioContext инициализирован
    if (criticalAlert && audioContextRef.current) {
      playAlertSound();
    }
  }, [criticalAlert]);

  // Загрузка данных из локального хранилища и получение с сервера
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

    // Регулярно запрашиваем данные с сервера, если подключены к локальному серверу
    if (isConnected && currentServer) {
      const fetchData = async () => {
        try {
          // Проверяем, является ли сервер локальным
          const isLocalServer = currentServer.ip === 'localhost' || currentServer.ip === '127.0.0.1';
          const port = currentServer.port || '8000';
          
          if (isLocalServer && port === '8000') {
            // Создаем контроллер для таймаута
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
            
            try {
              // Запрос статистики с таймаутом
              const response = await fetch(`http://${currentServer.ip}:${port}/api/statistics/`, {
                signal: controller.signal
              });
              
              clearTimeout(timeoutId); // Очищаем таймаут если запрос успешен
              
              const data = await response.json();
              setStats(data);
              localStorage.setItem('emergency_stats', JSON.stringify(data));
              
              // Новый контроллер для второго запроса
              const controller2 = new AbortController();
              const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
              
              // Запрос последних событий
              const eventsResponse = await fetch(`http://${currentServer.ip}:${port}/api/emergency-events/active/`, {
                signal: controller2.signal
              });
              
              clearTimeout(timeoutId2);
              
              const eventsData = await eventsResponse.json();
              setRecentEvents(eventsData.slice(0, 5));
            } catch (fetchError) {
              // Улучшенная обработка ошибок
              if (fetchError.name === 'AbortError') {
                console.log('Локальный сервер не отвечает, используются кэшированные данные');
              } else {
                console.error('Невозможно получить данные от локального сервера:', fetchError);
              }
              
              // Генерируем случайные данные для демонстрации
              if (!savedStats) {
                const simulatedStats = {
                  active_events: Math.floor(Math.random() * 10) + 1,
                  total_events: Math.floor(Math.random() * 100) + 20,
                  critical_level: Math.floor(Math.random() * 3) + 1,
                  servers_online: Math.floor(Math.random() * 5) + 1,
                  drones_active: Math.floor(Math.random() * 8) + 3
                };
                setStats(simulatedStats);
                localStorage.setItem('emergency_stats', JSON.stringify(simulatedStats));
              }
            }
          } else {
            // Для нелокальных серверов не делаем HTTP запросы - данные будут приходить через WebSocket
            console.log('Используется симуляция данных для нелокального сервера');
          }
        } catch (error) {
          console.error('Ошибка при получении данных дашборда:', error);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 30000); // Каждые 30 секунд

      return () => clearInterval(interval);
    }
  }, [isConnected, currentServer]);

  /**
   * Возвращает иконку для уровня опасности
   * @param {string} severity - Уровень опасности
   * @returns {JSX.Element} - Иконка соответствующего цвета
   */
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
    <Box onClick={initAudioContext}>
      {/* Уведомление о критической ситуации */}
      <Snackbar
        open={showAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={30000} // 30 секунд до автоматического закрытия
        onClose={handleCloseAlert}
      >
        <Alert 
          severity="error" 
          variant="filled"
          icon={<Notifications fontSize="inherit" />}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleCloseAlert}>
              Понятно
            </Button>
          }
          sx={{ 
            width: '100%', 
            fontSize: '1.1rem', 
            fontWeight: 'bold', 
            '& .MuiAlert-message': { width: '100%' },
            mb: 2
          }}
        >
          {criticalAlert && (
            <>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                {criticalAlert.title}
              </Typography>
              <Typography variant="body1">
                {criticalAlert.description}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Локация: {criticalAlert.location}
              </Typography>
            </>
          )}
        </Alert>
      </Snackbar>

      <Typography variant="h4" gutterBottom>
        Панель мониторинга ЧС
      </Typography>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Вы не подключены к серверу. Данные могут быть устаревшими.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Статистика ЧС */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Статистика ЧС
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Всего зарегистрировано ЧС: <strong>{stats.total}</strong>
              </Typography>
              <Typography variant="body1">
                Активные ЧС: <strong>{stats.active}</strong>
              </Typography>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              По уровню опасности:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">Критическая:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold" color="error">
                  {stats.by_severity['Критическая']}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Высокая:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold" color="error">
                  {stats.by_severity['Высокая']}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Средняя:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold" color="warning.main">
                  {stats.by_severity['Средняя']}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Низкая:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {stats.by_severity['Низкая']}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Статус системы и подключения */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Статус системы
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                <Typography variant="body2" gutterBottom>
                  Подключен к серверу: <strong>{currentServer.name}</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Адрес: {currentServer.ip}:{currentServer.port}
                </Typography>
                {sessionId && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" component="span">
                      Идентификатор TCP-сессии:
                    </Typography>
                    <Chip 
                      size="small" 
                      label={sessionId} 
                      color="primary" 
                      sx={{ ml: 1 }} 
                    />
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Последние события */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Последние события
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {recentEvents.length === 0 ? (
              <Alert severity="info">
                Нет активных событий ЧС.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {recentEvents.map((event, index) => (
                  <Grid item xs={12} key={event.id || index}>
                    <Card variant="outlined" className={`emergency-${typeof event.severity === 'string' ? event.severity.toLowerCase() : 'low'}`}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getSeverityIcon(event.severity)}
                          <Typography variant="subtitle1" sx={{ ml: 1, flex: 1 }}>
                            {event.title}
                          </Typography>
                          <Typography variant="caption">
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