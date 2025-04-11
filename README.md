# Система оповещений о ЧС

Система глобальных оповещений о чрезвычайных ситуациях с использованием протоколов TCP, UDP и WebSocket.

## Структура проекта

Проект состоит из двух основных частей:

- **Backend**: Django + Django REST Framework + Django Channels
- **Frontend**: React + Material UI

## Возможности системы

- Получение оповещений от МЧС (через TCP)
- Отслеживание данных с дронов (через UDP)
- Оповещения о стихийных бедствиях в реальном времени (через WebSocket)
- Управление серверами (добавление/удаление серверов)
- Кэширование событий и данных на клиенте
- Статистика по активным ЧС

## Установка и запуск

### Требования

- Python 3.8+
- Node.js 14+
- Redis (для Django Channels)
- PostgreSQL (опционально)

### Backend

1. Создайте виртуальное окружение и активируйте его:

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Установите зависимости:

```bash
pip install django djangorestframework django-cors-headers channels daphne psycopg2-binary redis
```

3. Выполните миграции:

```bash
python backend/manage.py migrate
```

4. Запустите Django сервер:

```bash
python backend/manage.py runserver
```

5. В отдельном терминале запустите TCP и UDP серверы:

```bash
python backend/manage.py runservers
```

### Frontend

1. Установите зависимости:

```bash
cd frontend
npm install
```

2. Запустите React приложение:

```bash
# Убедитесь, что вы находитесь в директории frontend
cd frontend  # если вы еще не перешли в эту директорию
npm start
```

Приложение будет доступно по адресу http://localhost:3000

## Протоколы взаимодействия

### TCP (Оповещения от МЧС)

Сервер принимает сообщения от систем МЧС по протоколу TCP и сохраняет данные о ЧС в базе данных.

### UDP (Данные с дронов)

Данные о положении дронов и собранной ими информации передаются на сервер по протоколу UDP.

### WebSocket (Стихийные бедствия)

Информация о стихийных бедствиях и обновления статуса ЧС отправляются клиентам через WebSocket соединение.

## Авторы

- [Ваше имя]

## Лицензия

MIT