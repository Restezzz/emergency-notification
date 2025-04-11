from django.contrib import admin
from .models import Server, EventType, EmergencyEvent, DroneData

@admin.register(Server)
class ServerAdmin(admin.ModelAdmin):
    list_display = ('name', 'ip_address', 'port', 'is_active', 'created_at')
    search_fields = ('name', 'ip_address')
    list_filter = ('is_active',)

@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(EmergencyEvent)
class EmergencyEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'location', 'severity', 'is_active', 'created_at')
    list_filter = ('event_type', 'severity', 'is_active')
    search_fields = ('title', 'description', 'location')
    date_hierarchy = 'created_at'

@admin.register(DroneData)
class DroneDataAdmin(admin.ModelAdmin):
    list_display = ('drone_id', 'latitude', 'longitude', 'altitude', 'speed', 'battery_level', 'status', 'timestamp')
    list_filter = ('drone_id', 'status')
    search_fields = ('drone_id',)
    date_hierarchy = 'timestamp'
