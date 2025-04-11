from rest_framework import serializers
from .models import Server, EventType, EmergencyEvent, DroneData

class ServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Server
        fields = '__all__'

class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = '__all__'

class EmergencyEventSerializer(serializers.ModelSerializer):
    event_type_name = serializers.ReadOnlyField(source='event_type.name')
    
    class Meta:
        model = EmergencyEvent
        fields = '__all__'

class DroneDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = DroneData
        fields = '__all__' 