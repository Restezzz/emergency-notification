from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'servers', views.ServerViewSet)
router.register(r'event-types', views.EventTypeViewSet)
router.register(r'emergency-events', views.EmergencyEventViewSet)
router.register(r'drone-data', views.DroneDataViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('statistics/', views.get_event_statistics, name='statistics'),
] 