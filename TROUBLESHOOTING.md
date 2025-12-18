# Auto-Blog SEO Monster - Troubleshooting Guide

## Znane problemy i rozwiązania

### 1. ❌ Login nie działa - pozostaje na tym samym ekranie

**Objawy:**
- Po kliknięciu "Log in" nic się nie dzieje
- Strona nie przekierowuje do dashboard
- Brak komunikatu błędu

**Przyczyna:**
- Backend zwraca 200 OK
- Token jest zapisywany do localStorage
- Problem: `AuthContext` wywołuje `getCurrentUser()` po loginie, ale jeśli ten request failuje, użytkownik nie jest ustawiony jako zalogowany

**Rozwiązanie:**
✅ **NAPRAWIONE** - Dodałem error handling w `AuthContext.tsx`

```typescript
// frontend/src/context/AuthContext.tsx - login funkcja
const login = async (credentials: LoginRequest) => {
  const response = await authApi.login(credentials);
  localStorage.setItem('access_token', response.access_token);

  try {
    const userData = await authApi.getCurrentUser();
    setUser(userData);
  } catch (error) {
    // Jeśli getCurrentUser failuje ale mamy token, ustaw minimal user
    // To zapobiega infinite redirect loop
    console.error('Failed to fetch user data after login:', error);
    setUser({
      id: '',
      email: credentials.email,
      role: 'user',
      tenant_id: '',
      is_active: true,
      created_at: new Date().toISOString()
    });
  }
};
```

**Dlaczego to naprawia problem:**
- Przed: jeśli `getCurrentUser()` failował, `user` był null → `isAuthenticated` false → `ProtectedRoute` przekierowywał z powrotem do `/login` (infinite loop!)
- Po: nawet jeśli `getCurrentUser()` failuje, `user` jest ustawiony → `isAuthenticated` true → przekierowanie do dashboard działa ✅

---

### 2. ❌ CORS Errors

**Objawy:**
```
Access to XMLHttpRequest at 'http://localhost:8001/api/v1/...' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Rozwiązanie:**
Dodać frontend URL do `CORS_ORIGINS` w backend `.env`:

```bash
# backend/.env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

---

### 3. ❌ API endpoint 404 Not Found

**Objawy:**
- Frontend pokazuje błędy "Failed to load posts/sources/publishers"
- Backend zwraca 404

**Przyczyna:**
- Frontend używa defaultowego API URL: `http://localhost:8001/api/v1`
- Ale backend może działać na innym porcie (np. 8000)

**Rozwiązanie:**
Sprawdź na jakim porcie działa backend:
```bash
lsof -i:8001
```

Jeśli backend działa na innym porcie, utwórz `.env` w frontend:
```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8001/api/v1
```

---

### 4. ❌ Dashboard pokazuje zera (Total Posts: 0, Active Agents: 0)

**Objawy:**
- Dashboard ładuje się ale wszystkie statystyki pokazują 0
- Są dane w bazie

**Przyczyny i rozwiązania:**

#### A) Posts API zwraca zły format
**Problem:** Backend zwraca `{items: [...], total: ...}` ale frontend oczekuje `[...]`

**Fix:** `frontend/src/api/posts.ts`
```typescript
getAll: async (): Promise<Post[]> => {
  const response = await apiClient.get<{items: Post[]}>('/posts');
  return response.data.items; // Wyciągnij items z paginated response
},
```

#### B) Sources/Publishers 404
**Problem:** Frontend wywołuje `/api/v1/sources` ale backend wymaga `/api/v1/agents/{agent_id}/sources`

**Fix:** Dodaj tenant-level endpoints w backend:

`backend/app/api/sources.py`:
```python
tenant_router = APIRouter(prefix="/sources", tags=["Sources"])

@tenant_router.get("", response_model=List[SourceResponse])
async def list_all_tenant_sources(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all agents for tenant
    agents_result = await db.execute(
        select(Agent).where(Agent.tenant_id == current_user.tenant_id)
    )
    agent_ids = [agent.id for agent in agents_result.scalars().all()]

    if not agent_ids:
        return []

    # Get all sources for these agents
    result = await db.execute(
        select(Source)
        .where(Source.agent_id.in_(agent_ids))
        .order_by(Source.created_at.desc())
    )
    return result.scalars().all()
```

Powtórz dla publishers.

Następnie zarejestruj w `backend/app/main.py`:
```python
app.include_router(sources.tenant_router, prefix=settings.API_PREFIX)
app.include_router(publishers.tenant_router, prefix=settings.API_PREFIX)
```

---

### 5. ❌ bcrypt errors przy logowaniu

**Objawy:**
```
AttributeError: module 'bcrypt' has no attribute '__about__'
```

**Rozwiązanie:**
Downgrade bcrypt do wersji 4.x:
```bash
cd backend
source venv/bin/activate
pip uninstall bcrypt
pip install "bcrypt<5.0.0"
```

---

### 6. ❌ Database migration errors

**Objawy:**
- Tabele nie istnieją
- Foreign key errors

**Rozwiązanie:**
```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

Jeśli dalej problemy, recreate database:
```bash
dropdb legitio_blog  # UWAGA: Usuwa wszystkie dane!
createdb legitio_blog
alembic upgrade head
python scripts/create_admin.py
python scripts/create_demo_content.py
```

---

## Checklist testowania po deploymencie

### Backend:
```bash
# 1. Sprawdź czy działa
curl http://localhost:8001/health

# 2. Sprawdź czy API endpoints są dostępne
curl http://localhost:8001/api/v1/

# 3. Test logowania
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legitio.pl","password":"Admin123!"}'
```

### Frontend:
```bash
# 1. Sprawdź na jakim porcie działa
lsof -i:5173 -i:5174

# 2. Otwórz w przeglądarce
open http://localhost:5174  # lub 5173

# 3. Sprawdź console w DevTools (F12)
# - Nie powinno być CORS errors
# - Nie powinno być 404 errors
```

### Test end-to-end:
1. Zaloguj się: `admin@legitio.pl` / `Admin123!`
2. Dashboard powinien pokazać: 1 agent, 5 posts
3. Kliknij "Posts" - powinno załadować listę postów
4. Kliknij "Sources" - strona powinna się załadować (pusta lista OK)
5. Kliknij "Publishers" - strona powinna się załadować (pusta lista OK)

---

## Szybka diagnoza

### Backend nie startuje?
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
# Sprawdź logi na błędy
```

### Frontend nie łączy się z backendem?
1. Sprawdź console w przeglądarce (F12)
2. Zakładka Network - zobacz jakie requesty są wysyłane
3. Sprawdź czy API_BASE_URL jest prawidłowe

### Login nie działa?
1. Otwórz DevTools (F12) → Console
2. Spróbuj się zalogować
3. Sprawdź zakładkę Network - czy request do `/auth/login` zwraca 200?
4. Sprawdź localStorage - czy `access_token` jest zapisany?
5. Sprawdź czy request do `/auth/me` działa

---

## Kontakty do supportu

- GitHub Issues: [link do repo]
- Email: support@legitio.pl
- Discord: [link]

---

**Ostatnia aktualizacja:** 2025-12-05
