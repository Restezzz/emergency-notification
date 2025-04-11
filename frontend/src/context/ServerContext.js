import React, { createContext, useState, useEffect } from 'react';

const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  
  // Загрузка серверов из localStorage при инициализации
  useEffect(() => {
    const savedServers = localStorage.getItem('servers');
    if (savedServers) {
      setServers(JSON.parse(savedServers));
    } else {
      // Если серверов нет, создаем локальный сервер автоматически
      const localServer = {
        id: 'local-auto',
        name: 'Локальный сервер',
        ip: 'localhost',
        port: '8000'
      };
      setServers([localServer]);
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
  
  // Добавление нового сервера
  const addServer = (serverData) => {
    const newServer = {
      id: Date.now().toString(),
      ...serverData
    };
    setServers([...servers, newServer]);
    return newServer;
  };
  
  // Удаление сервера
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
        
        // Через 2 секунды отправляем тестовые данные
        setTimeout(() => {
          // Сохраняем тестовые данные в localStorage
          const testEvents = [
            {
              id: '1',
              title: 'Тестовое ЧП: Пожар',
              description: 'Тестовые данные для локального режима: пожар в здании',
              severity: 'Высокая',
              location: 'ул. Тестовая, 1',
              created_at: new Date().toISOString(),
              status: 'Активно'
            },
            {
              id: '2',
              title: 'Тестовое ЧП: Наводнение',
              description: 'Тестовые данные для локального режима: затопление территории',
              severity: 'Средняя',
              location: 'ул. Тестовая, 5',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              status: 'Активно'
            }
          ];
          
          localStorage.setItem('emergency_events', JSON.stringify(testEvents));
          
          // Сохраняем тестовую статистику
          const testStats = {
            total: 5,
            active: 2,
            by_severity: {
              'Низкая': 1,
              'Средняя': 1,
              'Высокая': 2,
              'Критическая': 1
            }
          };
          
          localStorage.setItem('emergency_stats', JSON.stringify(testStats));
          
          // Сохраняем тестовые данные дронов
          const testDrones = {
            "1": {
              drone_id: "1",
              latitude: 55.7558,
              longitude: 37.6176,
              altitude: 120,
              speed: 35,
              battery_level: 78,
              status: "Активен",
              timestamp: new Date().toISOString(),
              related_event: "1"
            },
            "2": {
              drone_id: "2",
              latitude: 55.7517,
              longitude: 37.6132,
              altitude: 90,
              speed: 25,
              battery_level: 42,
              status: "Активен",
              timestamp: new Date().toISOString(),
              related_event: "2"
            }
          };
          
          localStorage.setItem('drone_data', JSON.stringify(testDrones));
          
          // Имитируем WebSocket события через 3 секунды
          setTimeout(() => {
            if (isConnected) {
              mockSocket._simulateMessage({
                type: 'drone_data',
                data: testDrones["1"]
              });
            }
          }, 3000);
          
        }, 2000);
        
        setSocket(mockSocket);
        return true;
      }
      
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
      const isLocalMode = server.ip === 'localhost' || server.ip === '127.0.0.1';
      
      if (isLocalMode) {
        console.log('Включен локальный режим без реального TCP подключения');
        setSessionId('local-session-123');
        return true;
      }
      
      // Устанавливаем таймаут для fetch запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
      
      console.log(`Попытка TCP подключения: http://${server.ip}:${server.port}/api/connect`);
      
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
    } catch (error) {
      console.error('Ошибка TCP подключения:', error);
      if (error.name === 'AbortError') {
        console.error('Таймаут TCP подключения');
      }
      return false;
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