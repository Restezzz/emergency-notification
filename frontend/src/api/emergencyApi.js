import axios from 'axios';

// Создаем API клиент с базовыми настройками
const createApiClient = (serverIp, serverPort) => {
  const baseURL = `http://${serverIp}:${serverPort}/api`;
  
  const client = axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  return {
    // Получение всех серверов
    getServers: async () => {
      const response = await client.get('/servers/');
      return response.data;
    },
    
    // Получение всех событий
    getEvents: async () => {
      const response = await client.get('/emergency-events/');
      return response.data;
    },
    
    // Получение только активных событий
    getActiveEvents: async () => {
      const response = await client.get('/emergency-events/active/');
      return response.data;
    },
    
    // Получение последних данных с дронов
    getLatestDroneData: async () => {
      const response = await client.get('/drone-data/latest/');
      return response.data;
    },
    
    // Получение статистики
    getStatistics: async () => {
      const response = await client.get('/statistics/');
      return response.data;
    },
    
    // Удаленная отправка оповещения (имитация отправки от МЧС)
    sendEmergencyAlert: async (eventData) => {
      const response = await client.post('/emergency-events/', eventData);
      return response.data;
    },
    
    // Удаленная отправка данных дрона (имитация UDP)
    sendDroneData: async (droneData) => {
      const response = await client.post('/drone-data/', droneData);
      return response.data;
    }
  };
};

export default createApiClient; 