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

// Стили для описания события
const styles = {
  '.event-description': {
    marginTop: '8px',
    marginBottom: '8px',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: '0.875rem',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: '0.01071em'
  }
};

const SEVERITY_COLORS = {
  'Низкая': 'success',
  'Средняя': 'warning',
  'Высокая': 'error',
  'Критическая': 'error',
};

const EventsList = () => {
  const { socket, isConnected } = useContext(ServerContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загрузка данных из локального хранилища при инициализации
    const savedEvents = localStorage.getItem('emergency_events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error('Ошибка при загрузке событий из кэша:', e);
      }
    }
    setLoading(false);

    // Подписка на события WebSocket если есть подключение
    if (socket && isConnected) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'initial_events') {
          // Получаем начальный список активных событий
          setEvents(data.events);
          localStorage.setItem('emergency_events', JSON.stringify(data.events));
        } else if (data.type === 'emergency_event') {
          // Добавляем новое событие
          const newEvent = data.event;
          setEvents(prevEvents => {
            const updatedEvents = [newEvent, ...prevEvents];
            localStorage.setItem('emergency_events', JSON.stringify(updatedEvents));
            return updatedEvents;
          });
        }
      };
    }

    return () => {
      if (socket) {
        // Чистим обработчик при размонтировании
        socket.onmessage = null;
      }
    };
  }, [socket, isConnected]);

  const getSeverityClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'критическая':
        return 'emergency-critical';
      case 'высокая':
        return 'emergency-high';
      case 'средняя':
        return 'emergency-medium';
      default:
        return 'emergency-low';
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        События ЧС
      </Typography>
      <style jsx>{`
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
                        <Typography variant="h6">{event.title}</Typography>
                        <Chip 
                          label={event.severity} 
                          color={SEVERITY_COLORS[event.severity] || 'default'} 
                          size="small" 
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <div className="event-description">
                          {event.description}
                        </div>
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography component="span" variant="caption">
                            Местоположение: {event.location}
                          </Typography>
                          <Typography component="span" variant="caption">
                            Тип: {event.event_type}
                          </Typography>
                          <Typography component="span" variant="caption">
                            {new Date(event.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      </>
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