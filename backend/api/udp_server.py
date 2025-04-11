import socket
import json
import threading
import asyncio
import django
import os
import time
from datetime import datetime
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Настраиваем Django для работы в отдельном потоке
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emergency_notification.settings')
django.setup()

from django.conf import settings
from api.models import DroneData
from api.serializers import DroneDataSerializer

class UDPServer:
    def __init__(self, host=None, port=None):
        self.host = host or settings.UDP_SERVER_HOST
        self.port = port or settings.UDP_SERVER_PORT
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.bind((self.host, self.port))
        self.running = False
        self.channel_layer = get_channel_layer()
        
    def start(self):
        self.running = True
        print(f"UDP сервер запущен на {self.host}:{self.port}")
        
        while self.running:
            try:
                data, addr = self.socket.recvfrom(1024)
                self.process_data(data, addr)
            except Exception as e:
                print(f"Ошибка UDP сервера: {e}")
    
    def process_data(self, data, addr):
        try:
            drone_data = json.loads(data.decode('utf-8'))
            
            # Сохраняем данные в БД
            serializer = DroneDataSerializer(data={
                "drone_id": drone_data.get("id"),
                "latitude": drone_data.get("lat"),
                "longitude": drone_data.get("lon"),
                "altitude": drone_data.get("alt"),
                "speed": drone_data.get("speed"),
                "battery_level": drone_data.get("battery"),
                "status": drone_data.get("status"),
                "related_event": drone_data.get("event_id")
            })
            
            if serializer.is_valid():
                serializer.save()
                
                # Отправляем данные через WebSocket если связаны с событием
                if drone_data.get("event_id"):
                    async_to_sync(self.channel_layer.group_send)(
                        "emergency_broadcasts",
                        {
                            "type": "drone_data",
                            "data": serializer.data
                        }
                    )
                    
                print(f"Получены данные от дрона {drone_data.get('id')}")
            else:
                print(f"Ошибка валидации данных дрона: {serializer.errors}")
                
        except json.JSONDecodeError:
            print("Ошибка декодирования JSON")
        except Exception as e:
            print(f"Ошибка обработки данных: {e}")
    
    def stop(self):
        self.running = False
        self.socket.close()
        print("UDP сервер остановлен")

def start_udp_server():
    server = UDPServer()
    server_thread = threading.Thread(target=server.start)
    server_thread.daemon = True
    server_thread.start()
    return server 