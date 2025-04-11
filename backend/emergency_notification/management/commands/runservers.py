from django.core.management.base import BaseCommand
from api.udp_server import start_udp_server
from api.tcp_server import start_tcp_server
import time

class Command(BaseCommand):
    help = 'Запуск TCP и UDP серверов'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Запуск серверов...'))
        
        # Запуск TCP сервера
        tcp_server = start_tcp_server()
        self.stdout.write(self.style.SUCCESS('TCP сервер запущен'))
        
        # Запуск UDP сервера
        udp_server = start_udp_server()
        self.stdout.write(self.style.SUCCESS('UDP сервер запущен'))
        
        try:
            self.stdout.write(self.style.WARNING('Нажмите Ctrl+C для остановки серверов'))
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('Остановка серверов...'))
            tcp_server.stop()
            udp_server.stop()
            self.stdout.write(self.style.SUCCESS('Серверы остановлены')) 