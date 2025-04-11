from django.db import models
from django.utils import timezone

class Server(models.Model):
    ip_address = models.CharField(max_length=50)
    port = models.IntegerField()
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.ip_address}:{self.port})"

class EventType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class EmergencyEvent(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.ForeignKey(EventType, on_delete=models.CASCADE)
    location = models.CharField(max_length=200)
    severity = models.IntegerField(choices=[
        (1, "Низкая"),
        (2, "Средняя"),
        (3, "Высокая"),
        (4, "Критическая"),
    ])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class DroneData(models.Model):
    drone_id = models.CharField(max_length=50)
    latitude = models.FloatField()
    longitude = models.FloatField()
    altitude = models.FloatField()
    speed = models.FloatField()
    battery_level = models.FloatField()
    status = models.CharField(max_length=50)
    timestamp = models.DateTimeField(default=timezone.now)
    related_event = models.ForeignKey(EmergencyEvent, on_delete=models.CASCADE, blank=True, null=True)
    
    def __str__(self):
        return f"Дрон {self.drone_id} в {self.timestamp}"
