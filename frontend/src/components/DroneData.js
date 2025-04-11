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
  CircularProgress,
  LinearProgress
} from '@mui/material';
import ServerContext from '../context/ServerContext';

const DroneData = () => {
  const { isConnected, socket, currentServer } = useContext(ServerContext);
  const [drones, setDrones] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загрузка данных из локального хранилища при инициализации
    const savedDrones = localStorage.getItem('drone_data');
    if (savedDrones) {
      try {
        setDrones(JSON.parse(savedDrones));
      } catch (e) {
        console.error('Ошибка при загрузке данных дронов из кэша:', e);
      }
    }
    setLoading(false);

    // Подписка на сообщения WebSocket, если есть подключение
    if (socket && isConnected) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'drone_data') {
          // Обновляем данные дрона
          const droneData = data.data;
          setDrones(prevDrones => {
            const updatedDrones = {
              ...prevDrones,
              [droneData.drone_id]: droneData
            };
            localStorage.setItem('drone_data', JSON.stringify(updatedDrones));
            return updatedDrones;
          });
        }
      };

      // Регулярно запрашиваем данные с сервера, если подключены
      const fetchInterval = setInterval(async () => {
        try {
          if (currentServer) {
            const response = await fetch(`http://${currentServer.ip}:${currentServer.port}/api/drone-data/latest/`);
            const data = await response.json();
            
            if (Object.keys(data).length > 0) {
              setDrones(data);
              localStorage.setItem('drone_data', JSON.stringify(data));
            }
          }
        } catch (error) {
          console.error('Ошибка при получении данных дронов:', error);
        }
      }, 10000); // Каждые 10 секунд

      return () => {
        clearInterval(fetchInterval);
        if (socket) {
          socket.onmessage = null;
        }
      };
    }
  }, [socket, isConnected, currentServer]);

  const getBatteryColor = (level) => {
    if (level < 20) return 'error';
    if (level < 50) return 'warning';
    return 'success';
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Данные с дронов
      </Typography>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Вы не подключены к серверу. Данные дронов могут быть устаревшими.
        </Alert>
      )}

      {Object.keys(drones).length === 0 ? (
        <Alert severity="info">
          Нет данных с дронов.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {Object.keys(drones).map(droneId => {
            const drone = drones[droneId];
            return (
              <Grid size={4} mdsize={6} smsize={12} key={droneId}>
                <Card>
                  <CardHeader 
                    title={`Дрон ${drone.drone_id}`} 
                    subheader={`Статус: ${drone.status}`}
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" gutterBottom>
                      Координаты: {drone.latitude.toFixed(6)}, {drone.longitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Высота: {drone.altitude} м
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Скорость: {drone.speed} км/ч
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        Батарея: {drone.battery_level}%
                      </Typography>
                      <Box sx={{ width: '100%', ml: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={drone.battery_level} 
                          color={getBatteryColor(drone.battery_level)}
                        />
                      </Box>
                    </Box>
                    
                    {drone.related_event && (
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                        Связан с событием ID: {drone.related_event}
                      </Typography>
                    )}
                    
                    <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'right' }}>
                      Обновлено: {new Date(drone.timestamp).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default DroneData; 