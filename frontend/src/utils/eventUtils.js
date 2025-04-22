/**
 * Утилиты для генерации случайных событий ЧС
 */

// Типы стихийных бедствий
const EVENT_TYPES = [
  "Пожар", "Наводнение", "Землетрясение", "Ураган", "Торнадо", 
  "Оползень", "Лавина", "Цунами", "Извержение вулкана", "Техногенная катастрофа",
  "Химическая утечка", "Радиационная опасность"
];

// Уровни опасности
const SEVERITY_LEVELS = ["Низкая", "Средняя", "Высокая", "Критическая"];

// Города и локации
const CITIES = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург", "Владивосток"];
const STREETS = [
  "ул. Ленина, 23", "пр. Мира, 105", "ул. Гагарина, 56", 
  "ул. Пушкина, 10", "пл. Победы, 1", "ул. Советская, 78",
  "ул. Строителей, 45", "ул. Космонавтов, 32"
];

// Генерация случайного элемента из массива
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Генерирует набор случайных событий ЧС
 * @param {number} count - Количество событий для генерации (3-7, если не указано)
 * @returns {Array} Массив событий ЧС
 */
export const generateRandomEvents = (count = 0) => {
  // Если количество не указано, генерируем от 3 до 7 событий
  const numEvents = count > 0 ? count : Math.floor(Math.random() * 5) + 3;
  const events = [];
  
  for (let i = 0; i < numEvents; i++) {
    // Создаем событие с разным временем (от текущего до 24 часов назад)
    const hoursOffset = Math.floor(Math.random() * 24);
    const createdAt = new Date(Date.now() - hoursOffset * 3600000);
    
    const eventType = getRandomItem(EVENT_TYPES);
    const severity = getRandomItem(SEVERITY_LEVELS);
    const city = getRandomItem(CITIES);
    const street = getRandomItem(STREETS);
    const location = `${city}, ${street}`;
    
    events.push({
      id: `evt-${Date.now()}-${i}`,
      title: `ЧС: ${eventType}`,
      description: `${severity} опасность: ${eventType.toLowerCase()} в районе ${location}. Соблюдайте меры предосторожности.`,
      severity: severity,
      location: location,
      event_type: eventType,
      created_at: createdAt.toISOString(),
      status: "Активно"
    });
  }
  
  // Добавляем критическое событие, требующее эвакуации, с вероятностью 30%
  if (Math.random() < 0.3) {
    const city = getRandomItem(CITIES);
    const street = getRandomItem(STREETS);
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
  
  return events;
};

/**
 * Генерирует одно случайное событие ЧС
 * @returns {Object} Объект с данными события
 */
export const generateRandomEvent = () => {
  const eventType = getRandomItem(EVENT_TYPES);
  const severity = getRandomItem(SEVERITY_LEVELS);
  const city = getRandomItem(CITIES);
  const street = getRandomItem(STREETS);
  const location = `${city}, ${street}`;
  
  const newEvent = {
    id: `evt-${Date.now()}`,
    title: `ЧС: ${eventType}`,
    description: `${severity} опасность: ${eventType.toLowerCase()} в районе ${location}. Соблюдайте меры предосторожности.`,
    severity: severity,
    location: location,
    event_type: eventType,
    created_at: new Date().toISOString(),
    status: "Активно"
  };
  
  // Случайно (10% шанс) создаем критическое событие с эвакуацией
  if (Math.random() < 0.1) {
    newEvent.id = `evacuation-${Date.now()}`;
    newEvent.title = "ВНИМАНИЕ! ЭВАКУАЦИЯ!";
    newEvent.description = "Критическая опасность! Требуется немедленная эвакуация населения в ближайшие убежища! Следуйте указаниям спасателей МЧС!";
    newEvent.severity = "Критическая";
    newEvent.event_type = "Эвакуация";
  }
  
  return newEvent;
};

/**
 * Сохраняет события в localStorage и возвращает их
 * @param {Array} events - Массив событий для сохранения
 * @returns {Array} Тот же массив событий
 */
export const saveEvents = (events) => {
  localStorage.setItem('emergency_events', JSON.stringify(events));
  return events;
};

/**
 * Загружает события из localStorage
 * @returns {Array} Массив событий или пустой массив, если ничего не сохранено
 */
export const loadEvents = () => {
  try {
    const saved = localStorage.getItem('emergency_events');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Ошибка при загрузке событий из localStorage:', e);
    return [];
  }
};

/**
 * Генерирует статистику на основе событий
 * @param {Array} events - Массив событий
 * @returns {Object} Объект со статистикой
 */
export const generateStats = (events = []) => {
  // Подсчет количества событий по степени тяжести
  const bySeverity = {
    'Низкая': 0,
    'Средняя': 0,
    'Высокая': 0,
    'Критическая': 0
  };
  
  events.forEach(event => {
    if (event.severity && bySeverity.hasOwnProperty(event.severity)) {
      bySeverity[event.severity]++;
    }
  });
  
  return {
    total: events.length + Math.floor(Math.random() * 5), // Добавляем несколько для "истории"
    active: events.length,
    by_severity: bySeverity
  };
}; 