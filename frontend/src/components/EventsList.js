import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import ServerContext from '../context/ServerContext';
import { generateRandomEvents, generateRandomEvent, saveEvents, loadEvents } from '../utils/eventUtils';

/**
 * Компонент для отображения списка чрезвычайных ситуаций
 * 
 * Генерирует случайные данные о ЧС для демонстрации.
 * Отображает события с различными уровнями опасности и их детали.
 * Обновляется автоматически при получении новых событий.
 */
const EventsList = () => {
  const { socket, isConnected } = useContext(ServerContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка или генерация начальных данных
  useEffect(() => {
    // Пытаемся загрузить события из localStorage
    let savedEvents = loadEvents();
    
    // Если нет сохраненных событий или их меньше 3, генерируем новые
    if (!savedEvents || savedEvents.length < 3) {
      savedEvents = generateRandomEvents();
      saveEvents(savedEvents);
    }
    
    setEvents(savedEvents);
    setLoading(false);
    
    // Имитация получения новых событий каждые 2 минуты
    const newEventInterval = setInterval(() => {
      // Генерируем новое событие с 30% вероятностью
      if (Math.random() < 0.3) {
        const newEvent = generateRandomEvent();
        setEvents(prevEvents => {
          const updatedEvents = [newEvent, ...prevEvents].slice(0, 20); // Ограничиваем 20 событиями
          saveEvents(updatedEvents);
          return updatedEvents;
        });
      }
    }, 120000); // 2 минуты
    
    return () => clearInterval(newEventInterval);
  }, []);

  // Обработка WebSocket сообщений, если они есть
  useEffect(() => {
    if (socket && isConnected) {
      const originalOnMessage = socket.onmessage;
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'initial_events') {
            setEvents(data.events);
            saveEvents(data.events);
          } else if (data.type === 'emergency_event') {
            const newEvent = data.event;
            setEvents(prevEvents => {
              const updatedEvents = [newEvent, ...prevEvents].slice(0, 20);
              saveEvents(updatedEvents);
              return updatedEvents;
            });
          }
        } catch (error) {
          console.error('Ошибка при обработке WebSocket сообщения:', error);
        }
      };
      
      return () => {
        if (socket) {
          socket.onmessage = originalOnMessage;
        }
      };
    }
  }, [socket, isConnected]);

  /**
   * Определяет CSS-класс на основе уровня серьезности ЧС
   */
  const getSeverityClass = (severity) => {
    if (!severity) {
      return 'emergency-low';
    }
    
    // Преобразуем severity в строку для безопасного использования toLowerCase
    const severityStr = String(severity);
    const severityLower = severityStr.toLowerCase();
    
    switch (severityLower) {
      case 'критическая':
        return 'emergency-critical';
      case 'высокая':
        return 'emergency-high';
      case 'средняя':
        return 'emergency-medium';
      case 'низкая':
      default:
        return 'emergency-low';
    }
  };

  // Цвета для чипов с уровнями опасности
  const SEVERITY_COLORS = {
    'Низкая': 'success',
    'Средняя': 'warning',
    'Высокая': 'error',
    'Критическая': 'error',
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        События ЧС
      </Typography>
      <style>{`
        .event-description {
          margin-top: 8px;
          margin-bottom: 8px;
          color: rgba(0, 0, 0, 0.87);
          font-size: 0.875rem;
          font-family: "Roboto", "Helvetica", "Arial", sans-serif;
          font-weight: 400;
          line-height: 1.43;
          letter-spacing: 0.01071em;
        }
      `}</style>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Вы не подключены к серверу. Данные могут быть устаревшими.
        </Alert>
      )}

      {events.length === 0 ? (
        <Alert severity="info">
          Нет активных событий ЧС.
        </Alert>
      ) : (
        <Paper>
          <List>
            {events.map((event, index) => (
              <React.Fragment key={event.id || index}>
                <ListItem className={getSeverityClass(event.severity)}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography component="span" sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                          {event.title}
                        </Typography>
                        <Chip 
                          label={event.severity} 
                          color={SEVERITY_COLORS[event.severity] || 'default'} 
                          size="small" 
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography component="div" className="event-description">
                          {event.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Местоположение: {event.location}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Тип: {event.event_type}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {new Date(event.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default EventsList; 