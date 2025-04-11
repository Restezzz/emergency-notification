import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import EmergencyEvent

class EmergencyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            "emergency_broadcasts",
            self.channel_name
        )
        await self.accept()
        
        # Отправить текущие активные ЧС при подключении
        events = await self.get_active_events()
        await self.send(text_data=json.dumps({
            'type': 'initial_events',
            'events': events
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "emergency_broadcasts",
            self.channel_name
        )

    async def receive(self, text_data):
        # Клиент может отправить сообщение, но мы его игнорируем
        pass

    async def emergency_broadcast(self, event):
        # Отправка сообщения о ЧС клиенту
        await self.send(text_data=json.dumps({
            'type': 'emergency_event',
            'event': event['event']
        }))
    
    @database_sync_to_async
    def get_active_events(self):
        events = EmergencyEvent.objects.filter(is_active=True)
        event_data = []
        for event in events:
            event_data.append({
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'event_type': event.event_type.name,
                'location': event.location,
                'severity': event.get_severity_display(),
                'created_at': event.created_at.isoformat(),
            })
        return event_data 