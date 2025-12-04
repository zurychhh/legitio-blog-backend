# ✅ Faza 1 - Testy do wykonania

## 🔧 Poprawki wykonane podczas weryfikacji:

1. ✅ **app/__init__.py** - dodano import wszystkich modeli dla Alembic
2. ✅ **.gitignore** - dodano plik ignorowania
3. ✅ **Duplikacja kodu** - usunięto duplikację `get_agent_with_access` (przeniesiono do deps.py)

---

## 🧪 Co powinieneś przetestować:

### 1. Setup środowiska (5 min)

```bash
cd backend

# Utwórz venv
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Zainstaluj zależności
pip install -r requirements.txt
```

**Oczekiwany rezultat:** Wszystkie pakiety zainstalowane bez błędów.

---

### 2. Konfiguracja (2 min)

```bash
# Skopiuj .env
cp .env.example .env

# Edytuj .env i ustaw:
# - DATABASE_URL (np. postgresql+asyncpg://postgres:password@localhost:5432/autoblog_dev)
# - JWT_SECRET (dowolny losowy string, np: my-super-secret-jwt-key-12345)
# - ANTHROPIC_API_KEY (twój klucz - możesz użyć fake dla testów bez AI)
```

**Oczekiwany rezultat:** Plik `.env` utworzony z poprawnymi wartościami.

---

### 3. Uruchom bazę danych (opcja A lub B)

#### Opcja A: Docker (REKOMENDOWANE - łatwiejsze)

```bash
# Z głównego folderu projektu
docker-compose up -d postgres redis

# Sprawdź czy działa
docker-compose ps
```

**Oczekiwany rezultat:**
```
NAME                    STATUS
autoblog_postgres       Up (healthy)
autoblog_redis          Up (healthy)
```

#### Opcja B: Lokalna PostgreSQL

```bash
# Jeśli masz PostgreSQL zainstalowany lokalnie
createdb autoblog_dev

# Sprawdź połączenie
psql autoblog_dev -c "SELECT version();"
```

---

### 4. Uruchom migracje Alembic (2 min)

```bash
cd backend

# Utwórz pierwszą migrację (auto-generacja z modeli)
alembic revision --autogenerate -m "Initial schema"

# Zastosuj migrację
alembic upgrade head
```

**Oczekiwany rezultat:**
- Powinna utworzyć się migracja w `migrations/versions/`
- Po `upgrade head` - brak błędów
- Tabele utworzone w bazie: `tenants`, `users`, `agents`, `sources`, `publishers`, `posts`, `usage_logs`

**Weryfikacja:**
```bash
# Połącz się z bazą i sprawdź tabele
psql autoblog_dev -c "\dt"
```

---

### 5. Uruchom serwer FastAPI (1 min)

```bash
cd backend
uvicorn app.main:app --reload
```

**Oczekiwany rezultat:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

---

### 6. Test API - Swagger UI (2 min)

Otwórz w przeglądarce: **http://localhost:8000/docs**

**Oczekiwany rezultat:**
- Swagger UI ładuje się poprawnie
- Widoczne endpointy:
  - `/api/v1/auth/*` (4 endpointy)
  - `/api/v1/tenants/*` (5 endpointów)
  - `/api/v1/agents/*` (5 endpointów)
  - `/api/v1/agents/{id}/sources/*` (5 endpointów)
  - `/api/v1/agents/{id}/publishers/*` (5 endpointów)
  - `/api/v1/posts/*` (6 endpointów)

---

### 7. Test Health Check (30 sec)

W nowej karcie terminala:

```bash
curl http://localhost:8000/health
```

**Oczekiwany rezultat:**
```json
{
  "status": "healthy",
  "app": "Auto-Blog SEO Monster",
  "env": "development"
}
```

---

### 8. Utwórz pierwszego superadmina (2 min)

Otwórz Python shell:

```bash
cd backend
python3
```

W shellu wykonaj:

```python
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
        print("✅ Superadmin created: admin@example.com / Admin123!")

asyncio.run(create_superadmin())
exit()
```

**Oczekiwany rezultat:** "✅ Superadmin created..."

---

### 9. Test Login API (1 min)

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Oczekiwany rezultat:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

Skopiuj `access_token` do użycia w następnych testach.

---

### 10. Test autoryzacji (2 min)

```bash
# Ustaw token (wklej swój z poprzedniego kroku)
export TOKEN="twój_access_token_tutaj"

# Test 1: Get current user
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Test 2: Create tenant
curl -X POST http://localhost:8000/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "slug": "test-company",
    "tokens_limit": 100000,
    "posts_limit": 50
  }'

# Test 3: List tenants
curl http://localhost:8000/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN"
```

**Oczekiwany rezultat:**
- Test 1: Zwraca dane użytkownika (email, role)
- Test 2: Status 201, zwraca utworzony tenant
- Test 3: Lista tenantów (powinien być 1)

---

### 11. Test przez Swagger UI (2 min)

1. Otwórz http://localhost:8000/docs
2. Kliknij przycisk **"Authorize"** (góra strony, zielona ikona kłódki)
3. Wpisz: `Bearer twój_access_token`
4. Kliknij **Authorize**
5. Spróbuj wykonać kilka requestów:
   - `GET /api/v1/auth/me`
   - `GET /api/v1/tenants`
   - `POST /api/v1/agents` (utwórz agenta dla test-company)

**Oczekiwany rezultat:** Wszystkie requesty działają poprawnie.

---

### 12. Uruchom testy (opcjonalne - 2 min)

```bash
cd backend

# Utwórz testową bazę
createdb autoblog_test

# Uruchom testy
pytest -v

# Z coverage
pytest --cov=app --cov-report=html
```

**Oczekiwany rezultat:**
- Wszystkie testy przechodzą (może być kilka xfail jeśli DB nie jest skonfigurowana)
- Coverage report w `htmlcov/index.html`

---

## ❌ Co może pójść nie tak:

### Problem: "ModuleNotFoundError"
**Rozwiązanie:**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Problem: "Database connection error"
**Rozwiązanie:**
```bash
# Sprawdź czy PostgreSQL działa
docker-compose ps  # lub: pg_isready

# Sprawdź DATABASE_URL w .env
cat .env | grep DATABASE_URL
```

### Problem: "Alembic can't find models"
**Rozwiązanie:** To zostało naprawione w `app/__init__.py`, ale jeśli problem występuje:
```bash
# Usuń cache
rm -rf backend/app/__pycache__
rm -rf backend/migrations/__pycache__

# Spróbuj ponownie
alembic upgrade head
```

### Problem: Port 8000 zajęty
**Rozwiązanie:**
```bash
uvicorn app.main:app --port 8001 --reload
```

---

## ✅ Checklist testów:

- [ ] Środowisko zainstalowane (venv + pip)
- [ ] .env skonfigurowany
- [ ] PostgreSQL działa (Docker lub lokalnie)
- [ ] Migracje Alembic wykonane
- [ ] Serwer FastAPI działa
- [ ] Swagger UI ładuje się
- [ ] Health check zwraca "healthy"
- [ ] Superadmin utworzony
- [ ] Login API działa (zwraca token)
- [ ] Autoryzacja działa (Bearer token)
- [ ] Można utworzyć tenant przez API
- [ ] Swagger UI authorize działa

---

## 📝 Co zgłosić jeśli coś nie działa:

1. **Dokładny komunikat błędu**
2. **Który krok nie działa**
3. **Output z terminala** (screenshot lub tekst)
4. **Wersja Python:** `python3 --version`
5. **System operacyjny**

---

## 🎉 Jeśli wszystko działa:

**Gratulacje! Faza 1 jest COMPLETE.**

Możemy przejść do **Fazy 2: AI Engine** gdzie zaimplementujemy:
- Claude API client
- Post generator z AI
- SEO optimizer
- Token counting

---

**Status:** Faza 1 gotowa do testów ✅
**Szacowany czas testów:** 15-20 minut
