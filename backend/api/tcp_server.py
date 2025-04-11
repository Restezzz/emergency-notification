import socket
import json
import threading
import django
import os
import uuid
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Настраиваем Django для работы в отдельном потоке
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'emergency_notification.settings')
django.setup()

from django.conf import settings
from api.models import EmergencyEvent, EventType

class ClientHandler:
    def __init__(self, client_socket, address, server):
        self.client_socket = client_socket
        self.address = address
        self.server = server
        self.session_id = str(uuid.uuid4())
        self.running = False
        
    def handle(self):
        self.running = True
        print(f"Клиент подключен: {self.address}, ID сессии: {self.session_id}")
        
        try:
            # Отправляем ID сессии клиенту
            self.client_socket.send(json.dumps({
                "status": "connected",
                "session_id": self.session_id
            }).encode('utf-8'))
            
            while self.running:
                data = self.client_socket.recv(4096)
                if not data:
                    break
                    
                self.process_data(data)
                
        except Exception as e:
            print(f"Ошибка обработки клиента {self.session_id}: {e}")
        finally:
            self.client_socket.close()
            if self.session_id in self.server.clients:
                del self.server.clients[self.session_id]
            print(f"Клиент отключен: {self.address}, ID сессии: {self.session_id}")
            
    def process_data(self, data):
        try:
            message = json.loads(data.decode('utf-8'))
            message_type = message.get("type")
            
            if message_type == "emergency_alert":
                # Обработка экстренного оповещения от МЧС
                event_data = message.get("data", {})
                
                # Получаем или создаем тип события
                event_type, _ = EventType.objects.get_or_create(
                    name=event_data.get("event_type", "Неизвестный тип")
                )
                
                # Создаем событие
                event = EmergencyEvent.objects.create(
                    title=event_data.get("title", "Без названия"),
                    description=event_data.get("description", ""),
                    event_type=event_type,
                    location=event_data.get("location", ""),
                    severity=event_data.get("severity", 2),
                    is_active=True
                )
                
                # Отправляем событие всем клиентам через WebSocket
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "emergency_broadcasts",
                    {
                        "type": "emergency_broadcast",
                        "event": {
                            "id": event.id,
                            "title": event.title,
                            "description": event.description,
                            "event_type": event_type.name,
                            "location": event.location,
                            "severity": event.get_severity_display(),
                            "created_at": event.created_at.isoformat()
                        }
                    }
                )
                
                # Отправляем подтверждение клиенту МЧС
                self.client_socket.send(json.dumps({
                    "status": "success",
                    "message": "Оповещение успешно создано",
                    "event_id": event.id
                }).encode('utf-8'))
                
                print(f"Создано новое оповещение: {event.title}")
                
            elif message_type == "heartbeat":
                # Простое сообщение для поддержания соединения
                self.client_socket.send(json.dumps({
                    "status": "ok",
                    "message": "Соединение активно"
                }).encode('utf-8'))
                
        except json.JSONDecodeError:
            print(f"Получены некорректные данные от клиента {self.session_id}")
        except Exception as e:
            print(f"Ошибка обработки сообщения от клиента {self.session_id}: {e}")
            
    def stop(self):
        self.running = False

class TCPServer:
    def __init__(self, host=None, port=None):
        self.host = host or settings.TCP_SERVER_HOST
        self.port = port or settings.TCP_SERVER_PORT
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((self.host, self.port))
        self.running = False
        self.clients = {}  # session_id -> ClientHandler
        
    def start(self):
        self.running = True
        self.socket.listen(5)
        print(f"TCP сервер запущен на {self.host}:{self.port}")
        
        while self.running:
            try:
                client_socket, address = self.socket.accept()
                client_handler = ClientHandler(client_socket, address, self)
                client_thread = threading.Thread(target=client_handler.handle)
                client_thread.daemon = True
                client_thread.start()
                
                self.clients[client_handler.session_id] = client_handler
            except Exception as e:
                if self.running:
                    print(f"Ошибка TCP сервера: {e}")
    
    def stop(self):
        self.running = False
        
        # Останавливаем всех клиентов
        for client_handler in self.clients.values():
            client_handler.stop()
            
        self.socket.close()
        print("TCP сервер остановлен")

def start_tcp_server():
    server = TCPServer()
    server_thread = threading.Thread(target=server.start)
    server_thread.daemon = True
    server_thread.start()
    return server 