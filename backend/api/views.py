from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from .models import Server, EventType, EmergencyEvent, DroneData
from .serializers import ServerSerializer, EventTypeSerializer, EmergencyEventSerializer, DroneDataSerializer
import json

# Create your views here.

class ServerViewSet(viewsets.ModelViewSet):
    queryset = Server.objects.all()
    serializer_class = ServerSerializer

class EventTypeViewSet(viewsets.ModelViewSet):
    queryset = EventType.objects.all()
    serializer_class = EventTypeSerializer

class EmergencyEventViewSet(viewsets.ModelViewSet):
    queryset = EmergencyEvent.objects.all()
    serializer_class = EmergencyEventSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        active_events = EmergencyEvent.objects.filter(is_active=True)
        serializer = self.get_serializer(active_events, many=True)
        return Response(serializer.data)

class DroneDataViewSet(viewsets.ModelViewSet):
    queryset = DroneData.objects.all()
    serializer_class = DroneDataSerializer
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Получить последние данные со всех дронов"""
        latest_data = {}
        for drone in DroneData.objects.values('drone_id').distinct():
            drone_id = drone['drone_id']
            latest = DroneData.objects.filter(drone_id=drone_id).order_by('-timestamp').first()
            if latest:
                latest_data[drone_id] = DroneDataSerializer(latest).data
        return Response(latest_data)

@api_view(['GET'])
def get_event_statistics(request):
    """Получить статистику по активным ЧС"""
    total_events = EmergencyEvent.objects.count()
    active_events = EmergencyEvent.objects.filter(is_active=True).count()
    severity_stats = {
        "Низкая": EmergencyEvent.objects.filter(severity=1).count(),
        "Средняя": EmergencyEvent.objects.filter(severity=2).count(),
        "Высокая": EmergencyEvent.objects.filter(severity=3).count(),
        "Критическая": EmergencyEvent.objects.filter(severity=4).count(),
    }
    
    return Response({
        "total": total_events,
        "active": active_events,
        "by_severity": severity_stats
    })
