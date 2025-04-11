"""
Скрипт для симуляции TCP и UDP клиентов для тестирования системы оповещения о ЧС.

Использование:
    python simulate_client.py tcp  # Для симуляции отправки уведомления МЧС по TCP
    python simulate_client.py udp  # Для симуляции отправки данных с дрона по UDP
"""

import socket
import json
import sys
import time
import random
from datetime import datetime

# Настройки по умолчанию
DEFAULT_TCP_HOST = '127.0.0.1'
DEFAULT_TCP_PORT = 5006
DEFAULT_UDP_HOST = '127.0.0.1'
DEFAULT_UDP_PORT = 5005

def simulate_tcp_client():
    """Симуляция клиента МЧС, отправляющего оповещение по TCP"""
    
    print("Симуляция клиента МЧС (TCP)")
    
    # Создание TCP сокета
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # Подключение к серверу
        print(f"Подключение к {DEFAULT_TCP_HOST}:{DEFAULT_TCP_PORT}...")
        client.connect((DEFAULT_TCP_HOST, DEFAULT_TCP_PORT))
        
        # Получение ответа от сервера (ID сессии)
        data = client.recv(4096)
        response = json.loads(data.decode('utf-8'))
        
        if response.get('status') == 'connected':
            session_id = response.get('session_id')
            print(f"Подключено успешно. ID сессии: {session_id}")
            
            # Создание тестового события ЧС
            event_types = ["Пожар", "Наводнение", "Землетрясение", "Химическая авария", "Ураган"]
            locations = ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань"]
            
            emergency_alert = {
                "type": "emergency_alert",
                "data": {
                    "title": f"Тестовое ЧС {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                    "description": "Это тестовое оповещение, созданное симулятором клиента МЧС",
                    "event_type": random.choice(event_types),
                    "location": random.choice(locations),
                    "severity": random.randint(1, 4)
                }
            }
            
            # Отправка события
            print("Отправка оповещения о ЧС:")
            print(json.dumps(emergency_alert, indent=2, ensure_ascii=False))
            
            client.send(json.dumps(emergency_alert).encode('utf-8'))
            
            # Получение ответа
            data = client.recv(4096)
            response = json.loads(data.decode('utf-8'))
            
            print(f"Ответ от сервера: {response}")
            
            # Отправка heartbeat для поддержания соединения
            heartbeat = {"type": "heartbeat"}
            client.send(json.dumps(heartbeat).encode('utf-8'))
            
            # Получение ответа на heartbeat
            data = client.recv(4096)
            response = json.loads(data.decode('utf-8'))
            
            print(f"Проверка соединения: {response}")
            
        else:
            print("Ошибка при подключении к серверу")
    
    except Exception as e:
        print(f"Ошибка: {e}")
    
    finally:
        # Закрытие соединения
        client.close()
        print("Соединение закрыто")

def simulate_udp_client():
    """Симуляция дрона, отправляющего данные по UDP"""
    
    print("Симуляция дрона (UDP)")
    
    # Создание UDP сокета
    client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    try:
        # Генерация случайных данных дрона
        drone_id = f"drone-{random.randint(1, 10)}"
        
        # Базовые координаты (центр Москвы)
        base_lat, base_lon = 55.7558, 37.6173
        
        # Отправка 10 пакетов с небольшими изменениями
        for i in range(10):
            # Добавляем небольшие случайные отклонения к координатам
            lat = base_lat + random.uniform(-0.01, 0.01)
            lon = base_lon + random.uniform(-0.01, 0.01)
            
            drone_data = {
                "id": drone_id,
                "lat": lat,
                "lon": lon,
                "alt": random.uniform(100, 200),  # высота в метрах
                "speed": random.uniform(20, 60),  # скорость в км/ч
                "battery": random.uniform(20, 100),  # заряд батареи в процентах
                "status": random.choice(["Патрулирование", "Возвращение", "Мониторинг"]),
                "event_id": None if random.random() > 0.3 else random.randint(1, 5)  # иногда связываем с событием
            }
            
            # Печать данных
            print(f"Отправка данных дрона {i+1}/10:")
            print(json.dumps(drone_data, indent=2, ensure_ascii=False))
            
            # Отправка данных
            client.sendto(json.dumps(drone_data).encode('utf-8'), (DEFAULT_UDP_HOST, DEFAULT_UDP_PORT))
            
            # Пауза перед следующей отправкой
            time.sleep(1)
    
    except Exception as e:
        print(f"Ошибка: {e}")
    
    finally:
        # Закрытие сокета
        client.close()
        print("Симуляция завершена")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование:")
        print("    python simulate_client.py tcp  # Для симуляции отправки уведомления МЧС по TCP")
        print("    python simulate_client.py udp  # Для симуляции отправки данных с дрона по UDP")
        sys.exit(1)
        
    mode = sys.argv[1].lower()
    
    if mode == "tcp":
        simulate_tcp_client()
    elif mode == "udp":
        simulate_udp_client()
    else:
        print(f"Неизвестный режим: {mode}")
        print("Используйте 'tcp' или 'udp'.")
        sys.exit(1) 