/**
 * Утилиты для симуляции данных дронов (используется только в dev-режиме)
 */

// Возможные статусы дронов
const DRONE_STATUSES = ['активен', 'ожидает', 'возвращаются на базу', 'миссия', 'отключены'];

// Интервалы обновления (в миллисекундах)
const UPDATE_INTERVALS = {
  POSITION: 2000,    // обновление координат, скорости и высоты каждые 2 секунды
  BATTERY: 120000,   // снижение заряда батареи каждые 2 минуты
  STATUS: 120000     // возможное изменение статуса каждые 2 минуты
};

// Минимальный уровень заряда для возвращения дрона
const MIN_BATTERY_LEVEL = 5;

// Ограничения по высоте и скорости
const DRONE_LIMITS = {
  MIN_ALTITUDE: 5,     // минимальная высота (м)
  MAX_ALTITUDE: 120,   // максимальная высота (м)
  MAX_ALT_CHANGE: 5,   // максимальное изменение высоты за одно обновление (м)
  MIN_SPEED: 0,        // минимальная скорость (км/ч)
  MAX_SPEED: 90,       // максимальная скорость (км/ч)
  MAX_SPEED_CHANGE: 3  // максимальное изменение скорости за одно обновление (км/ч)
};

// Хранение времени последнего обновления
let lastUpdates = {
  position: Date.now(),
  battery: Date.now(),
  status: Date.now()
};

/**
 * Получение случайного числа в заданном диапазоне
 * @param {number} min - Минимальное значение
 * @param {number} max - Максимальное значение
 * @param {boolean} isInteger - Флаг для получения целого числа
 * @returns {number} Случайное число
 */
const getRandomNumber = (min, max, isInteger = false) => {
  const random = Math.random() * (max - min) + min;
  return isInteger ? Math.floor(random) : random;
};

/**
 * Генерация случайных координат в окрестностях базовой точки
 * @param {number} baseLat - Базовая широта
 * @param {number} baseLon - Базовая долгота
 * @param {number} maxDistance - Максимальное отклонение (в градусах)
 * @returns {Object} Объект с координатами {latitude, longitude}
 */
const generateCoordinates = (baseLat, baseLon, maxDistance = 0.01) => {
  const lat = baseLat + getRandomNumber(-maxDistance, maxDistance);
  const lon = baseLon + getRandomNumber(-maxDistance, maxDistance);
  
  return {
    latitude: lat,
    longitude: lon
  };
};

/**
 * Создает объект с симулированными данными о дронах
 * @param {number} count - Количество дронов для симуляции
 * @param {Object} options - Опции для симуляции
 * @returns {Object} Объект с данными о дронах, где ключ - ID дрона
 */
const simulateDroneData = (count = 5, options = {}) => {
  const {
    baseLat = 55.751244,     // Примерные координаты центра Москвы
    baseLon = 37.618423,
    maxDistance = 0.05,
    minAltitude = DRONE_LIMITS.MIN_ALTITUDE,
    maxAltitude = DRONE_LIMITS.MAX_ALTITUDE,
    minSpeed = DRONE_LIMITS.MIN_SPEED,
    maxSpeed = DRONE_LIMITS.MAX_SPEED,
    minBattery = 50,
    maxBattery = 100
  } = options;
  
  const drones = {};
  
  for (let i = 1; i <= count; i++) {
    const coords = generateCoordinates(baseLat, baseLon, maxDistance);
    
    drones[`drone-${i}`] = {
      name: `Дрон ${i}`,
      status: DRONE_STATUSES[Math.floor(Math.random() * (DRONE_STATUSES.length - 1))], // Исключаем статус "отключены" при создании
      ...coords,
      altitude: getRandomNumber(minAltitude, maxAltitude, true),
      speed: getRandomNumber(minSpeed, maxSpeed, true),
      battery_level: getRandomNumber(minBattery, maxBattery, true),
      related_event: null, // По умолчанию нет привязки к событию
      related_event_info: null, // Информация о привязанном событии
      // Добавляем служебные поля для более реалистичной симуляции
      _simulation: {
        direction: { // Текущее направление движения
          lat: getRandomNumber(-0.0001, 0.0001),
          lon: getRandomNumber(-0.0001, 0.0001)
        },
        home: { // Домашние координаты для возвращения
          latitude: baseLat,
          longitude: baseLon
        }
      }
    };
  }
  
  // Сбрасываем время обновления при создании новых данных
  lastUpdates = {
    position: Date.now(),
    battery: Date.now(),
    status: Date.now()
  };
  
  return drones;
};

/**
 * Обновляет данные симулированных дронов
 * @param {Object} existingData - Существующий объект с данными о дронах
 * @returns {Object} Обновленный объект с данными о дронах
 */
const updateSimulatedDrones = (existingData) => {
  if (!existingData) return {};
  
  const now = Date.now();
  const timeElapsed = {
    position: now - lastUpdates.position,
    battery: now - lastUpdates.battery,
    status: now - lastUpdates.status
  };
  
  const updatedData = { ...existingData };
  
  // Флаги обновления различных параметров
  const shouldUpdatePosition = timeElapsed.position >= UPDATE_INTERVALS.POSITION;
  const shouldUpdateBattery = timeElapsed.battery >= UPDATE_INTERVALS.BATTERY;
  const shouldUpdateStatus = timeElapsed.status >= UPDATE_INTERVALS.STATUS;
  
  // Обновляем соответствующие времена последнего обновления
  if (shouldUpdatePosition) lastUpdates.position = now;
  if (shouldUpdateBattery) lastUpdates.battery = now;
  if (shouldUpdateStatus) lastUpdates.status = now;
  
  Object.keys(updatedData).forEach(droneId => {
    const drone = updatedData[droneId];
    
    // Пропускаем уже неактивные дроны
    if (drone.status === 'отключены') return;
    
    // Обновляем заряд батареи
    if (shouldUpdateBattery) {
      drone.battery_level = Math.max(0, drone.battery_level - 1);
      
      // Если заряд опустился до 5% или ниже, отправляем дрон на базу
      if (drone.battery_level <= MIN_BATTERY_LEVEL && drone.status !== 'отключены') {
        drone.status = 'возвращаются на базу';
      }
      
      // Если батарея полностью разряжена, отключаем дрон
      if (drone.battery_level === 0) {
        drone.status = 'отключены';
        drone.speed = 0;
        return; // Выходим из функции для этого дрона
      }
    }
    
    // Обновляем позицию дрона в зависимости от его статуса
    if (shouldUpdatePosition) {
      if (drone.status === 'возвращаются на базу') {
        // Дрон возвращается на базу
        const home = drone._simulation.home;
        const distToHomeX = home.latitude - drone.latitude;
        const distToHomeY = home.longitude - drone.longitude;
        const direction = Math.atan2(distToHomeY, distToHomeX);
        
        // Расстояние до базы
        const distance = Math.sqrt(distToHomeX * distToHomeX + distToHomeY * distToHomeY);
        
        if (distance < 0.0005) {
          // Если дрон очень близко к базе
          drone.latitude = home.latitude;
          drone.longitude = home.longitude;
          drone.speed = 0;
          
          // Если заряд критический, отключаем дрон
          if (drone.battery_level <= MIN_BATTERY_LEVEL) {
            drone.status = 'отключены';
          } else {
            drone.status = 'ожидает';
          }
        } else {
          // Движение к базе
          const step = 0.001; // Увеличенный шаг движения
          drone.latitude += Math.cos(direction) * step;
          drone.longitude += Math.sin(direction) * step;
          
          // Изменяем скорость в пределах ограничений
          const speedChange = getRandomNumber(0, DRONE_LIMITS.MAX_SPEED_CHANGE, true);
          const targetSpeed = getRandomNumber(40, 60, true);
          drone.speed = Math.max(
            DRONE_LIMITS.MIN_SPEED,
            Math.min(
              DRONE_LIMITS.MAX_SPEED,
              drone.speed > targetSpeed ? drone.speed - speedChange : drone.speed + speedChange
            )
          );
        }
      } else if (drone.status !== 'ожидает' && drone.status !== 'отключены') {
        // Случайное движение активного дрона
        const { direction } = drone._simulation;
        
        // Генерируем более существенное изменение направления
        direction.lat = getRandomNumber(-0.001, 0.001);
        direction.lon = getRandomNumber(-0.001, 0.001);
        
        // Перемещаем дрон с заметным изменением координат
        drone.latitude += direction.lat;
        drone.longitude += direction.lon;
        
        // Обновляем скорость в пределах ограничений
        const speedChange = getRandomNumber(0, DRONE_LIMITS.MAX_SPEED_CHANGE, true);
        if (Math.random() > 0.5) {
          drone.speed = Math.min(DRONE_LIMITS.MAX_SPEED, drone.speed + speedChange);
        } else {
          drone.speed = Math.max(DRONE_LIMITS.MIN_SPEED, drone.speed - speedChange);
        }
        
        // Обновляем высоту в пределах ограничений
        const altChange = getRandomNumber(0, DRONE_LIMITS.MAX_ALT_CHANGE, true);
        if (Math.random() > 0.5) {
          drone.altitude = Math.min(DRONE_LIMITS.MAX_ALTITUDE, drone.altitude + altChange);
        } else {
          drone.altitude = Math.max(DRONE_LIMITS.MIN_ALTITUDE, drone.altitude - altChange);
        }
      } else if (drone.status === 'ожидает') {
        // Дрон в режиме ожидания
        drone.speed = 0;
      }
    }
    
    // Случайное изменение статуса (только для активных дронов не на возвращении)
    if (shouldUpdateStatus && 
        drone.status !== 'возвращаются на базу' && 
        drone.status !== 'отключены' && 
        drone.battery_level > MIN_BATTERY_LEVEL) {
      
      // 20% шанс изменить статус
      if (Math.random() < 0.2) {
        const availableStatuses = DRONE_STATUSES.filter(s => 
          s !== drone.status && s !== 'отключены' && s !== 'возвращаются на базу'
        );
        drone.status = availableStatuses[Math.floor(Math.random() * availableStatuses.length)];
      }
    }
  });
  
  return updatedData;
};

/**
 * Определяет цвет батареи в зависимости от уровня заряда
 * @param {number} level - Уровень заряда (0-100)
 * @returns {string} Строка с цветом в HEX-формате
 */
const getBatteryColor = (level) => {
  if (level <= 10) return '#f44336'; // Красный
  if (level <= 30) return '#ff9800'; // Оранжевый
  if (level <= 60) return '#ffc107'; // Желтый
  return '#4caf50'; // Зеленый
};

export {
  DRONE_STATUSES,
  DRONE_LIMITS,
  getRandomNumber,
  generateCoordinates,
  simulateDroneData,
  updateSimulatedDrones,
  getBatteryColor
};
 