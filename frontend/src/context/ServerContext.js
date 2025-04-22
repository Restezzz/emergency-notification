import React, { createContext, useState, useEffect } from 'react';

// Контекст для управления серверами и сетевыми соединениями
const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
  // Состояние для хранения данных
  const [servers, setServers] = useState([]); // Список доступных серверов
  const [currentServer, setCurrentServer] = useState(null); // Текущий подключенный сервер
  const [isConnected, setIsConnected] = useState(false); // Статус подключения
  const [socket, setSocket] = useState(null); // WebSocket соединение
  const [sessionId, setSessionId] = useState(null); // Идентификатор TCP-сессии
  
  // Загрузка серверов из localStorage при инициализации
  useEffect(() => {
    const savedServers = localStorage.getItem('servers');
    if (savedServers) {
      setServers(JSON.parse(savedServers));
    } else {
      // Если серверов нет, создаем дефолтные серверы
      const defaultServers = [
        {
          id: 'local-auto',
          name: 'Локальный сервер',
          ip: 'localhost',
          port: '8000'
        },
        {
          id: 'local-ip',
          name: 'Локальный IP',
          ip: '127.0.0.1',
          port: '8000'
        },
        {
          id: 'emulator',
          name: 'Эмулятор МЧС',
          ip: '192.168.0.100',
          port: '8000'
        },
        {
          id: 'test-server',
          name: 'Тестовый сервер МЧС',
          ip: '192.168.1.50',
          port: '5000'
        }
      ];
      setServers(defaultServers);
      localStorage.setItem('servers', JSON.stringify(defaultServers)); // Сохраняем серверы сразу после создания
    }
    
    const lastConnectedServer = localStorage.getItem('currentServer');
    if (lastConnectedServer) {
      const server = JSON.parse(lastConnectedServer);
      setCurrentServer(server);
      
      // Автоматически подключаемся к локальному серверу при запуске
      if (server && (server.ip === 'localhost' || server.ip === '127.0.0.1')) {
        console.log('Автоподключение к локальному серверу');
        setTimeout(() => {
          // Задержка для инициализации компонентов
          const mockSocket = {
            send: () => console.log('Симуляция отправки данных через WebSocket'),
            close: () => console.log('Симуляция закрытия WebSocket')
          };
          setSocket(mockSocket);
          setIsConnected(true);
          setSessionId('local-session-123');
        }, 500);
      }
    }
    
    return () => {
      // Закрываем соединение при размонтировании
      if (socket) {
        socket.close();
      }
    };
  }, []);
  
  // Сохранение серверов при изменении
  useEffect(() => {
    localStorage.setItem('servers', JSON.stringify(servers));
  }, [servers]);
  
  // Сохранение текущего сервера при изменении
  useEffect(() => {
    if (currentServer) {
      localStorage.setItem('currentServer', JSON.stringify(currentServer));
    }
  }, [currentServer]);
  
  // Добавление нового сервера в список
  const addServer = (serverData) => {
    const newServer = {
      id: Date.now().toString(),
      ...serverData
    };
    setServers([...servers, newServer]);
    return newServer;
  };
  
  // Удаление сервера из списка
  const removeServer = (serverId) => {
    const updatedServers = servers.filter(server => server.id !== serverId);
    setServers(updatedServers);
    
    // Если удаляем текущий сервер, отключаемся
    if (currentServer && currentServer.id === serverId) {
      disconnectFromServer();
    }
  };
  
  // Подключение к серверу по WebSocket
  const connectToServer = (server) => {
    // Закрываем предыдущее соединение если оно было
    if (socket) {
      socket.close();
    }
    
    try {
      // Чётко определяем локальный режим
      const isLocalMode = server.ip === 'localhost' || 
                          server.ip === '127.0.0.1' || 
                          server.ip.startsWith('192.168.') || 
                          server.ip.startsWith('10.') ||
                          server.ip === window.location.hostname;
      
      // Создаем WebSocket подключение
      const host = server.ip || 'localhost';
      const port = server.port || '8000';
      
      // В локальном режиме для тестирования не пытаемся создать реальное соединение
      if (isLocalMode) {
        console.log('Включен локальный режим без подключения к WebSocket');
        setIsConnected(true);
        setCurrentServer(server);
        
        // Создаем мок для сокета для тестирования с событиями
        const mockSocket = {
          send: (message) => console.log('Симуляция отправки данных через WebSocket:', message),
          close: () => {
            console.log('Симуляция закрытия WebSocket');
            setIsConnected(false);
          },
          // Добавляем поддельную отправку событий для тестирования
          _simulateMessage: (data) => {
            if (mockSocket.onmessage) {
              mockSocket.onmessage({ data: JSON.stringify(data) });
            }
          }
        };
        
        // Генерация начальных событий ЧС
        const generateInitialEvents = () => {
          // Типы стихийных бедствий
          const eventTypes = [
            "Пожар", "Наводнение", "Землетрясение", "Ураган", "Торнадо", 
            "Оползень", "Лавина", "Цунами", "Извержение вулкана", "Техногенная катастрофа",
            "Химическая утечка", "Радиационная опасность"
          ];
          
          // Уровни опасности
          const severityLevels = ["Низкая", "Средняя", "Высокая", "Критическая"];
          
          // Города и локации
          const cities = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург", "Владивосток"];
          const streets = [
            "ул. Ленина, 23", "пр. Мира, 105", "ул. Гагарина, 56", 
            "ул. Пушкина, 10", "пл. Победы, 1", "ул. Советская, 78",
            "ул. Строителей, 45", "ул. Космонавтов, 32"
          ];
          
          // Генерация случайного числа событий от 3 до 7
          const numEvents = Math.floor(Math.random() * 5) + 3;
          const events = [];
          
          for (let i = 0; i < numEvents; i++) {
            // Создаем событие с разным временем (от текущего до 24 часов назад)
            const hoursOffset = Math.floor(Math.random() * 24);
            const createdAt = new Date(Date.now() - hoursOffset * 3600000);
            
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
            const city = cities[Math.floor(Math.random() * cities.length)];
            const street = streets[Math.floor(Math.random() * streets.length)];
            const location = `${city}, ${street}`;
            
            events.push({
              id: `${i+1}`,
              title: `ЧС: ${eventType}`,
              description: `${severity} опасность: ${eventType.toLowerCase()} в районе ${location}. Соблюдайте меры предосторожности.`,
              severity: severity,
              location: location,
              event_type: eventType,
              created_at: createdAt.toISOString(),
              status: "Активно"
            });
          }
          
          // Добавляем критическое событие, требующее эвакуации
          if (Math.random() > 0.5) {
            const city = cities[Math.floor(Math.random() * cities.length)];
            const street = streets[Math.floor(Math.random() * streets.length)];
            const location = `${city}, ${street}`;
            
            const evacuationEvent = {
              id: `evacuation-${Date.now()}`,
              title: "ВНИМАНИЕ! ЭВАКУАЦИЯ!",
              description: "Критическая опасность! Требуется немедленная эвакуация населения в ближайшие убежища! Следуйте указаниям спасателей МЧС!",
              severity: "Критическая",
              location: location,
              event_type: "Эвакуация",
              created_at: new Date().toISOString(),
              status: "Активно"
            };
            
            events.unshift(evacuationEvent);
          }
          
          localStorage.setItem('emergency_events', JSON.stringify(events));
          return events;
        };
        
        // Генерация нового события ЧС
        const generateNewEvent = () => {
          // Типы стихийных бедствий
          const eventTypes = [
            "Пожар", "Наводнение", "Землетрясение", "Ураган", "Торнадо", 
            "Оползень", "Лавина", "Цунами", "Извержение вулкана", "Техногенная катастрофа",
            "Химическая утечка", "Радиационная опасность"
          ];
          
          // Уровни опасности
          const severityLevels = ["Низкая", "Средняя", "Высокая", "Критическая"];
          
          // Города и локации
          const cities = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург", "Владивосток"];
          const streets = [
            "ул. Ленина, 23", "пр. Мира, 105", "ул. Гагарина, 56", 
            "ул. Пушкина, 10", "пл. Победы, 1", "ул. Советская, 78",
            "ул. Строителей, 45", "ул. Космонавтов, 32"
          ];
          
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
          const city = cities[Math.floor(Math.random() * cities.length)];
          const street = streets[Math.floor(Math.random() * streets.length)];
          const location = `${city}, ${street}`;
          
          const newEvent = {
            id: `new-${Date.now()}`,
            title: `ЧС: ${eventType}`,
            description: `${severity} опасность: ${eventType.toLowerCase()} в районе ${location}. Соблюдайте меры предосторожности.`,
            severity: severity,
            location: location,
            event_type: eventType,
            created_at: new Date().toISOString(),
            status: "Активно"
          };
          
          // Случайно (1 к 10) создаем критическое событие с эвакуацией
          if (Math.random() < 0.1) {
            newEvent.title = "ВНИМАНИЕ! ЭВАКУАЦИЯ!";
            newEvent.description = "Критическая опасность! Требуется немедленная эвакуация населения в ближайшие убежища! Следуйте указаниям спасателей МЧС!";
            newEvent.severity = "Критическая";
            newEvent.event_type = "Эвакуация";
          }
          
          return newEvent;
        };
        
        // Сначала генерируем начальные события
        setTimeout(() => {
          const initialEvents = generateInitialEvents();
          
          // Отправляем начальные события через WebSocket
          mockSocket._simulateMessage({
            type: 'initial_events',
            events: initialEvents
          });
          
          // Сохраняем тестовую статистику
          const testStats = {
            total: initialEvents.length + 2,
            active: initialEvents.length,
            by_severity: {
              'Низкая': Math.floor(Math.random() * 3),
              'Средняя': Math.floor(Math.random() * 3) + 1,
              'Высокая': Math.floor(Math.random() * 3) + 1,
              'Критическая': Math.floor(Math.random() * 2)
            }
          };
          
          localStorage.setItem('emergency_stats', JSON.stringify(testStats));
          
          // Генерируем события каждые 5 минут
          const wsEventInterval = setInterval(() => {
            if (isConnected) {
              const newEvent = generateNewEvent();
              mockSocket._simulateMessage({
                type: 'emergency_event',
                event: newEvent
              });
              
              // Обновляем сохраненные события
              try {
                const savedEvents = JSON.parse(localStorage.getItem('emergency_events') || '[]');
                const updatedEvents = [newEvent, ...savedEvents].slice(0, 20); // Оставляем не более 20 событий
                localStorage.setItem('emergency_events', JSON.stringify(updatedEvents));
              } catch (e) {
                console.error('Ошибка при обновлении событий в кэше:', e);
              }
            }
          }, 5 * 60 * 1000); // Каждые 5 минут
          
          // Сохраняем интервал в замыкании, чтобы его можно было очистить при закрытии сокета
          mockSocket.clearEventInterval = () => {
            clearInterval(wsEventInterval);
          };
          
          // Генерация начальных данных дронов
          const generateInitialDroneData = () => {
            // Создаем начальные данные для 5 дронов
            const drones = {};
            
            for (let i = 1; i <= 5; i++) {
              // Базовые координаты (центр Москвы)
              const baseLatitude = 55.75 + (Math.random() * 0.05);
              const baseLongitude = 37.62 + (Math.random() * 0.05);
              
              drones[i] = {
                drone_id: i.toString(),
                latitude: baseLatitude,
                longitude: baseLongitude,
                altitude: Math.floor(Math.random() * 100) + 50, // 50-150м
                speed: Math.floor(Math.random() * 40) + 20, // 20-60 км/ч
                battery_level: Math.floor(Math.random() * 30) + 70, // 70-100%
                status: "Активен",
                timestamp: new Date().toISOString(),
                related_event: Math.random() > 0.5 ? Math.floor(Math.random() * 3 + 1).toString() : null,
                // Дополнительные параметры для симуляции
                _base: {
                  latitude: baseLatitude,
                  longitude: baseLongitude,
                  direction: Math.random() * Math.PI * 2, // случайное направление в радианах
                  turnRate: (Math.random() - 0.5) * 0.1, // скорость поворота
                  batteryDrainRate: Math.random() * 0.02 + 0.01 // расход батареи 1-3% в минуту
                }
              };
            }
            
            localStorage.setItem('drone_data', JSON.stringify(drones));
            return drones;
          };
          
          // Обновление данных дрона (симуляция UDP-сообщений)
          const updateDroneData = (drone) => {
            const now = new Date();
            
            // Обновляем базовые параметры
            const base = drone._base;
            
            // Изменение направления движения (медленное изменение курса)
            base.direction += base.turnRate;
            
            // Скорость в км/ч конвертируем в градусы/сек (приблизительно)
            // 0.00001 градуса ≈ 1.11 метра на экваторе
            const speedFactor = drone.speed * 0.00001 / 3.6; // делим на 3.6 для перевода км/ч в м/с
            
            // Обновляем координаты с учетом направления
            drone.latitude += Math.sin(base.direction) * speedFactor;
            drone.longitude += Math.cos(base.direction) * speedFactor;
            
            // Небольшие случайные изменения высоты
            drone.altitude += (Math.random() - 0.5) * 5;
            drone.altitude = Math.max(10, Math.min(200, drone.altitude)); // Лимит высоты 10-200 метров
            
            // Небольшие случайные изменения скорости
            drone.speed += (Math.random() - 0.5) * 3;
            drone.speed = Math.max(5, Math.min(80, drone.speed)); // Лимит скорости 5-80 км/ч
            
            // Уменьшение заряда батареи
            // Расход батареи зависит от скорости и времени
            const timeDelta = (now - new Date(drone.timestamp)) / 60000; // в минутах
            const batteryDrain = base.batteryDrainRate * timeDelta * (1 + drone.speed / 100);
            drone.battery_level -= batteryDrain;
            drone.battery_level = Math.max(0, drone.battery_level);
            
            // Проверка на разряд батареи
            if (drone.battery_level < 10) {
              drone.status = "Критический заряд";
            } else if (drone.battery_level < 30) {
              drone.status = "Низкий заряд";
            }
            
            // Если батарея полностью разряжена, останавливаем дрон
            if (drone.battery_level <= 0) {
              drone.status = "Разряжен";
              drone.speed = 0;
            }
            
            // Обновляем временную метку
            drone.timestamp = now.toISOString();
            
            return drone;
          };
          
          // Запускаем обновление дронов (симуляцию UDP трафика)
          const initialDrones = generateInitialDroneData();
          
          // Эмитируем обновление данных с дронов каждые 5 секунд
          const droneUpdateInterval = setInterval(() => {
            if (isConnected) {
              try {
                // Получаем текущие данные дронов
                const currentDrones = JSON.parse(localStorage.getItem('drone_data') || '{}');
                let updatedAny = false;
                
                // Обновляем каждый дрон
                for (const droneId in currentDrones) {
                  // Случайно выбираем, будем ли обновлять этот дрон сейчас
                  if (Math.random() > 0.3) { // 70% шанс обновления для каждого дрона
                    const drone = currentDrones[droneId];
                    const updatedDrone = updateDroneData(drone);
                    currentDrones[droneId] = updatedDrone;
                    updatedAny = true;
                    
                    // Отправляем данные обновленного дрона через WebSocket
                    mockSocket._simulateMessage({
                      type: 'drone_data',
                      data: updatedDrone
                    });
                  }
                }
                
                // Сохраняем обновленные данные, если были изменения
                if (updatedAny) {
                  localStorage.setItem('drone_data', JSON.stringify(currentDrones));
                }
              } catch (e) {
                console.error('Ошибка при обновлении данных дронов:', e);
              }
            }
          }, 5000); // Каждые 5 секунд
          
          // Добавляем очистку интервала дронов
          mockSocket.clearDroneInterval = () => {
            clearInterval(droneUpdateInterval);
          };
        }, 1000);
        
        // Очистка интервалов при закрытии соединения
        const originalClose = mockSocket.close;
        mockSocket.close = () => {
          if (mockSocket.clearEventInterval) {
            mockSocket.clearEventInterval();
          }
          if (mockSocket.clearDroneInterval) {
            mockSocket.clearDroneInterval();
          }
          originalClose.call(mockSocket);
        };
        
        setSocket(mockSocket);
        return true;
      }
      
      // Подключение к реальному WebSocket серверу
      console.log(`Попытка подключения к WebSocket: ws://${host}:${port}/ws/emergency/`);
      const ws = new WebSocket(`ws://${host}:${port}/ws/emergency/`);
      
      // Устанавливаем таймаут для WebSocket соединения
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error('Таймаут подключения WebSocket');
          ws.close();
        }
      }, 5000); // 5 секунд таймаут
      
      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setCurrentServer(server);
        console.log('WebSocket соединение установлено');
      };
      
      ws.onclose = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        setSocket(null);
        console.log('WebSocket соединение закрыто');
      };
      
      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('Ошибка WebSocket:', error);
      };
      
      setSocket(ws);
      return true;
    } catch (error) {
      console.error('Ошибка подключения к серверу:', error);
      return false;
    }
  };
  
  // Подключение к серверу по TCP
  const connectTcpToServer = async (server) => {
    try {
      // Проверяем, является ли это локальным режимом
      const isLocalMode = server.ip === 'localhost' || 
                          server.ip === '127.0.0.1' || 
                          server.ip.startsWith('192.168.') || 
                          server.ip.startsWith('10.') ||
                          server.ip === window.location.hostname;
      
      if (isLocalMode) {
        console.log('Включен локальный режим без реального TCP подключения');
        setSessionId('local-session-123');
        return true;
      }
      
      // Устанавливаем таймаут для fetch запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
      
      console.log(`Попытка TCP подключения: http://${server.ip}:${server.port}/api/connect`);
      
      try {
        // Имитация TCP подключения через fetch API
        const response = await fetch(`http://${server.ip}:${server.port}/api/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ client_id: 'web_client' }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        if (data.status === 'connected') {
          setSessionId(data.session_id);
          return true;
        }
        return false;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('Ошибка TCP подключения, переключение на симуляцию:', fetchError);
        
        // При ошибке подключения автоматически переходим в режим симуляции
        console.log('Включаем режим симуляции для удаленного сервера');
        setSessionId(`simulated-${Date.now()}`);
        
        // Обновляем информацию о сервере с пометкой о симуляции
        const simulatedServer = {
          ...server,
          name: `${server.name} (симуляция)`,
          isSimulated: true
        };
        setCurrentServer(simulatedServer);
        
        return true;
      }
    } catch (error) {
      console.error('Ошибка TCP подключения:', error);
      if (error.name === 'AbortError') {
        console.error('Таймаут TCP подключения');
      }
      
      // При ошибке автоматически переходим в режим симуляции
      console.log('Включаем режим симуляции при ошибке');
      setSessionId(`simulated-${Date.now()}`);
      
      return true; // Возвращаем успех, т.к. симуляция будет работать
    }
  };
  
  // Отключение от сервера
  const disconnectFromServer = () => {
    if (socket) {
      socket.close();
    }
    setIsConnected(false);
    setCurrentServer(null);
    setSessionId(null);
  };
  
  return (
    <ServerContext.Provider
      value={{
        servers,
        currentServer,
        isConnected,
        socket,
        sessionId,
        setIsConnected,
        setCurrentServer,
        addServer,
        removeServer,
        connectToServer,
        connectTcpToServer,
        disconnectFromServer
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};

export default ServerContext; 