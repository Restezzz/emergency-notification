import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import DroneCard from './DroneCard';
import { simulateDroneData, updateSimulatedDrones } from '../utils/simulationUtils';
import { loadEvents } from '../utils/eventUtils';

/**
 * Компонент для отображения данных дронов
 * Получает данные через UDP протокол или создает симуляцию
 */
const DroneData = () => {
  // Состояние для хранения данных дронов
  const [drones, setDrones] = useState({});
  // Статус загрузки
  const [loading, setLoading] = useState(false);
  // Ошибки получения данных
  const [error, setError] = useState(null);
  // Режим симуляции (для разработки) - включен по умолчанию
  const [simulateMode, setSimulateMode] = useState(true);
  // События для привязки дронов
  const [events, setEvents] = useState([]);

  // Загрузка событий ЧС
  useEffect(() => {
    // Загружаем события из localStorage
    const loadedEvents = loadEvents() || [];
    setEvents(loadedEvents);
  }, []);

  /**
   * Загрузка данных о дронах с сервера
   */
  const fetchDroneData = useCallback(async () => {
    if (simulateMode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Запрос данных с сервера
      const response = await fetch('/api/drones');
      
      if (!response.ok) {
        throw new Error(`Ошибка получения данных: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Преобразуем массив в объект для удобной работы
      const dronesObject = {};
      data.forEach(drone => {
        dronesObject[drone.drone_id] = drone;
      });
      
      setDrones(dronesObject);
    } catch (err) {
      console.error('Ошибка получения данных о дронах:', err);
      setError(err.message);
      
      // При ошибке автоматически включаем режим симуляции
      if (!simulateMode) {
        console.log('Переключение на режим симуляции из-за ошибки API');
        setSimulateMode(true);
      }
    } finally {
      setLoading(false);
    }
  }, [simulateMode]);

  /**
   * Привязка дронов к событиям ЧС
   * @param {Object} dronesData - Данные дронов
   * @param {Array} eventsData - Данные событий
   * @returns {Object} Обновленные данные дронов с привязкой к событиям
   */
  const assignDronesToEvents = useCallback((dronesData, eventsData) => {
    const updatedDrones = { ...dronesData };
    const droneIds = Object.keys(updatedDrones);
    const availableEventIds = [];
    
    // Собираем ID доступных событий
    if (eventsData && eventsData.length > 0) {
      eventsData.forEach(event => {
        availableEventIds.push(event.id || Math.random().toString(36).substring(2, 11));
      });
    }
    
    // Если нет событий или дронов, возвращаем исходные данные
    if (availableEventIds.length === 0 || droneIds.length === 0) {
      return updatedDrones;
    }
    
    // Определяем необходимое количество дронов
    const dronesNeeded = Math.min(droneIds.length, availableEventIds.length);
    
    // Сначала сбрасываем все привязки
    droneIds.forEach(droneId => {
      updatedDrones[droneId].related_event = null;
      updatedDrones[droneId].related_event_info = null;
    });
    
    // Привязываем дроны к событиям (1 дрон на 1 событие)
    for (let i = 0; i < dronesNeeded; i++) {
      const droneId = droneIds[i];
      const eventId = availableEventIds[i];
      const event = eventsData.find(e => (e.id || '').toString() === eventId.toString());
      
      if (event && updatedDrones[droneId]) {
        updatedDrones[droneId].related_event = eventId;
        updatedDrones[droneId].related_event_info = {
          location: event.location || 'Неизвестная локация',
          type: event.event_type || event.title || 'Неизвестное событие'
        };
      }
    }
    
    return updatedDrones;
  }, []);

  /**
   * Генерация тестовых данных для режима симуляции
   */
  const generateSimulatedData = useCallback(() => {
    // Генерируем количество дронов равное количеству событий, но не менее 3 и не более 10
    const eventCount = events.length;
    const droneCount = Math.max(3, Math.min(eventCount || 5, 10));
    
    // Генерируем дронов
    const simulatedData = simulateDroneData(droneCount, {
      baseLat: 55.751244,
      baseLon: 37.618423,
      minAltitude: 5,
      maxAltitude: 120,
      minSpeed: 0, 
      maxSpeed: 90,
      minBattery: 20,
      maxBattery: 100
    });
    
    // Привязываем дронов к событиям
    const dronesWithEvents = assignDronesToEvents(simulatedData, events);
    
    setDrones(dronesWithEvents);
    setLoading(false);
    setError(null);
  }, [events, assignDronesToEvents]);

  /**
   * Обновление данных о дронах
   */
  const updateDroneData = useCallback(() => {
    if (simulateMode && Object.keys(drones).length > 0) {
      // В режиме симуляции немного изменяем данные, только если уже есть данные
      const updatedDrones = updateSimulatedDrones(drones);
      setDrones(updatedDrones);
    } else if (!simulateMode) {
      // Реальный режим - запрашиваем с сервера
      fetchDroneData();
    }
  }, [simulateMode, drones, fetchDroneData]);

  /**
   * Ручное обновление по кнопке
   */
  const handleRefresh = () => {
    if (simulateMode) {
      generateSimulatedData();
    } else {
      fetchDroneData();
    }
  };

  /**
   * Переключение режима симуляции
   */
  const handleSimulateModeToggle = (event) => {
    const isSimulating = event.target.checked;
    setSimulateMode(isSimulating);
  };

  // Эффект для начальной загрузки данных
  useEffect(() => {
    // Только если еще нет данных или изменился режим симуляции
    if (Object.keys(drones).length === 0) {
      if (simulateMode) {
        generateSimulatedData();
      } else {
        fetchDroneData();
      }
    }
  }, [simulateMode, fetchDroneData, generateSimulatedData, drones, events]);

  // Эффект для периодического обновления - каждые 2 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      updateDroneData();
    }, 2000); // Обновляем данные раз в 2 секунды
    
    return () => clearInterval(interval);
  }, [updateDroneData]);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mr: 2 }}>
          Данные дронов
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={simulateMode}
                onChange={handleSimulateModeToggle}
                color="primary"
              />
            }
            label="Режим симуляции"
            sx={{ mr: 2 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : Object.keys(drones).length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Нет доступных данных о дронах.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {Object.entries(drones).map(([id, data]) => (
            <Grid item xs={12} md={6} key={id}>
              <DroneCard id={id} data={data} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DroneData; 