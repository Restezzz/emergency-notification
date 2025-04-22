import React, { useEffect, useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress, 
  Grid,
  Chip
} from '@mui/material';
import { getBatteryColor } from '../utils/simulationUtils';

/**
 * Компонент для отображения карточки дрона с его данными
 */
const DroneCard = ({ id, data }) => {
  if (!data) return null;

  // Ссылка на предыдущий ID события для сравнения
  const prevEventIdRef = useRef(null);
  const [eventInfo, setEventInfo] = useState(null);
  
  // Безопасное получение числовых значений
  const batteryLevel = typeof data.battery_level === 'number' ? data.battery_level : 0;
  const speed = typeof data.speed === 'number' ? data.speed : 0;
  const altitude = typeof data.altitude === 'number' ? data.altitude : 0;
  const latitude = typeof data.latitude === 'number' ? data.latitude : 0;
  const longitude = typeof data.longitude === 'number' ? data.longitude : 0;
  const isActive = data.status !== 'отключены' && batteryLevel > 0;

  // Получаем цвет для батареи в зависимости от уровня заряда
  const batteryColor = getBatteryColor(batteryLevel);
  
  // Определяем цвет статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'активен':
        return 'success';
      case 'ожидает':
        return 'info';
      case 'возвращаются на базу':
        return 'warning';
      case 'миссия':
        return 'primary';
      case 'отключены':
        return 'default';
      default:
        return 'default';
    }
  };

  // Обновляем информацию о событии только при изменении ID события
  useEffect(() => {
    // Проверяем, изменился ли ID события
    if (prevEventIdRef.current === data.related_event) {
      return; // Если не изменился, не делаем ничего
    }
    
    prevEventIdRef.current = data.related_event; // Сохраняем текущий ID
    
    // Функция для получения данных о событии
    const fetchEventInfo = () => {
      if (!data.related_event) {
        setEventInfo(null);
        return;
      }
      
      // Если есть прямая информация о событии в данных дрона, используем её
      if (data.related_event_info) {
        setEventInfo({
          title: data.related_event_info.type || 'Неизвестное событие',
          location: data.related_event_info.location || 'Неизвестная локация'
        });
        return;
      }
      
      try {
        const eventsJson = localStorage.getItem('emergency_events');
        if (!eventsJson) {
          setEventInfo({ title: `Событие #${data.related_event}` });
          return;
        }
        
        const events = JSON.parse(eventsJson);
        const relatedEvent = Array.isArray(events) 
          ? events.find(event => (event.id || '').toString() === (data.related_event || '').toString())
          : null;
        
        if (relatedEvent) {
          setEventInfo(relatedEvent);
        } else {
          setEventInfo({ title: `Событие #${data.related_event}` });
        }
      } catch (e) {
        console.error('Ошибка при получении данных о событии:', e);
        setEventInfo({ title: `Событие #${data.related_event}` });
      }
    };
    
    fetchEventInfo();
  }, [data.related_event, data.related_event_info]);

  return (
    <Card 
      sx={{ 
        mb: 2, 
        position: 'relative', 
        boxShadow: 2,
        opacity: isActive ? 1 : 0.7,
        bgcolor: isActive ? 'background.paper' : '#f5f5f5'
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="div" sx={{ mr: 1 }}>
                {data.name || `Дрон #${id}`}
              </Typography>
              
              <Chip 
                label={data.status || 'Неизвестно'} 
                color={getStatusColor(data.status)} 
                size="small" 
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ID: {id}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Скорость: {Math.round(speed)} км/ч
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Высота: {Math.round(altitude)} м
            </Typography>
            
            {(eventInfo || data.related_event_info) && isActive && (
              <Box sx={{ mt: 2, border: '1px dashed #ccc', p: 1, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Привязан к событию:
                </Typography>
                {data.related_event_info ? (
                  <>
                    <Typography variant="body2" color="text.primary">
                      {data.related_event_info.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                      {data.related_event_info.location}
                    </Typography>
                  </>
                ) : eventInfo && (
                  <>
                    <Typography variant="body2" color="text.primary">
                      {eventInfo.title || eventInfo.event_type}
                    </Typography>
                    {eventInfo.location && (
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                        {eventInfo.location}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            )}
            
            {!isActive && (
              <Box sx={{ mt: 2, color: 'text.secondary' }}>
                <Typography variant="body2" fontWeight="bold" color="error">
                  Дрон неактивен
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Координаты: 
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Широта: {latitude.toFixed(6)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Долгота: {longitude.toFixed(6)}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Батарея: {Math.round(batteryLevel)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={batteryLevel} 
                sx={{ 
                  height: 8, 
                  borderRadius: 5,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: batteryColor
                  }
                }} 
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DroneCard; 