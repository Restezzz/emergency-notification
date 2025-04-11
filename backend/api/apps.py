from django.apps import AppConfig
import os
import sys


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Запускаем серверы только один раз при запуске через runserver
        if os.environ.get('RUN_MAIN', None) != 'true':
            return
            
        # Если мы запускаем проект через runservers, 
        # то не нужно запускать серверы автоматически
        if 'runservers' in sys.argv:
            return
            
        try:
            # Запускаем TCP и UDP серверы
            from api.tcp_server import start_tcp_server
            from api.udp_server import start_udp_server
            
            print("Автоматический запуск TCP и UDP серверов...")
            tcp_server = start_tcp_server()
            udp_server = start_udp_server()
            print("Серверы запущены!")
        except Exception as e:
            print(f"Ошибка при запуске серверов: {e}")
