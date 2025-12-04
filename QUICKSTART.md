# 🚀 Quick Start Guide

## Szybkie uruchomienie projektu

### 1. Setup środowiska

```bash
cd backend

# Utwórz i aktywuj venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Zainstaluj zależności
pip install -r requirements.txt
```

### 2. Konfiguracja

```bash
# Skopiuj .env.example
cp .env.example .env

# Edytuj .env i ustaw:
# - DATABASE_URL (PostgreSQL)
# - JWT_SECRET (losowy string)
# - ANTHROPIC_API_KEY (twój klucz API)
```

### 3. Baza danych

```bash
# Opcja A: Użyj Docker Compose (rekomendowane)
docker-compose up -d postgres redis

# Opcja B: Zainstaluj PostgreSQL lokalnie
createdb autoblog_dev

# Uruchom migracje
alembic upgrade head
```

### 4. Uruchom serwer

```bash
# Development mode z auto-reload
uvicorn app.main:app --reload

# Lub bezpośrednio
python -m app.main
```

Serwer będzie dostępny pod: **http://localhost:8000**

### 5. Przetestuj API

Otwórz: **http://localhost:8000/docs**

#### Utwórz pierwszego superadmina (przez shell)

```python
# Uruchom Python shell z venv aktywnym
python

# W shellu:
import asyncio
from app.database import AsyncSessionLocal
from app.models.user import User
from app.services.auth_service import AuthService

async def create_superadmin():
    async with AsyncSessionLocal() as db:
        user = User(
            email="admin@example.com",
            password_hash=AuthService.hash_password("Admin123!"),
            role="superadmin",
            is_active=True
        )
        db.add(user)
        await db.commit()
        print("Superadmin created!")

asyncio.run(create_superadmin())
```

#### Zaloguj się przez API

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

Skopiuj `access_token` z odpowiedzi.

#### Testuj endpointy

```bash
# Ustaw token
TOKEN="twój_access_token"

# Sprawdź current user
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Utwórz tenant
curl -X POST http://localhost:8000/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "slug": "test-company",
    "tokens_limit": 100000,
    "posts_limit": 50
  }'
```

### 6. Uruchom testy

```bash
# Utwórz testową bazę
createdb autoblog_test

# Uruchom testy
pytest

# Z coverage
pytest --cov=app
```

## Docker Quick Start

Jeśli wolisz Docker:

```bash
# Skopiuj .env
cp backend/.env.example backend/.env
# Edytuj backend/.env

# Uruchom wszystko
docker-compose up -d

# Zobacz logi
docker-compose logs -f api

# Zatrzymaj
docker-compose down
```

## Następne kroki

1. Zapoznaj się z **API Documentation**: http://localhost:8000/docs
2. Przeczytaj **PROJECT_PLAN.md** dla pełnego planu
3. Zobacz **README.md** dla szczegółów

---

## Troubleshooting

### Problem: "ModuleNotFoundError"
```bash
# Upewnij się że venv jest aktywny
source venv/bin/activate
pip install -r requirements.txt
```

### Problem: Database connection error
```bash
# Sprawdź czy PostgreSQL działa
pg_isready

# Sprawdź DATABASE_URL w .env
```

### Problem: Port 8000 zajęty
```bash
# Użyj innego portu
uvicorn app.main:app --port 8001 --reload
```

---

**Gotowe!** 🎉

Backend jest uruchomiony i gotowy do Fazy 2 (AI Engine).
