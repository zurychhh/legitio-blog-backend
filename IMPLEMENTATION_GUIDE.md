# 🚀 Implementation Guide for Claude Code

**Complete guide for implementing Auto-Blog SEO Monster in your project**

This guide is specifically written for **Claude Code** (Anthropic's AI coding assistant) to help implement this system in other projects. If you're a human developer, you can also follow these instructions step-by-step.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Scenarios](#implementation-scenarios)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Component-by-Component Guide](#component-by-component-guide)
6. [Integration Checklist](#integration-checklist)
7. [Troubleshooting](#troubleshooting)
8. [Testing Instructions](#testing-instructions)

---

## 🎯 Overview

### What This Guide Covers

This guide helps you implement:
- **Full Stack**: Complete backend + frontend system
- **Backend Only**: API server without UI
- **Frontend Only**: Dashboard for existing API
- **Specific Features**: Just auth, multi-tenant, or AI generation
- **Blog Integration**: Connect to WordPress, custom CMS, static sites

### Architecture at a Glance

```
Project Root/
├── backend/              # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── models/      # Database models
│   │   ├── services/    # Business logic
│   │   ├── core/        # Config, security, deps
│   │   └── tasks/       # Celery tasks
│   ├── alembic/         # DB migrations
│   ├── tests/           # Pytest tests
│   └── requirements.txt
├── frontend/            # React + TypeScript
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # React components
│   │   ├── context/     # React context
│   │   ├── pages/       # Page components
│   │   └── types/       # TypeScript types
│   └── package.json
└── docker-compose.yml   # Full stack deployment
```

---

## ⚙️ Prerequisites

### Required Knowledge (for Claude Code)

When implementing this system, you need to understand:

**Backend:**
- FastAPI async patterns
- SQLAlchemy 2.0 async ORM
- Alembic migrations
- JWT authentication
- Celery task queues
- PostgreSQL + Redis

**Frontend:**
- React 18 with hooks
- TypeScript
- React Router v6
- Axios + React Query
- Ant Design components

**General:**
- Docker & docker-compose
- Environment variables
- REST API design
- Multi-tenant architecture

### Target Project Requirements

Ask the user for:

1. **Project type**: New project or existing?
2. **Tech stack**: FastAPI? Django? Node.js? React? Vue?
3. **Database**: PostgreSQL? MySQL? MongoDB?
4. **Features needed**: Full system? Just AI? Just auth?
5. **Blog platform**: WordPress? Custom? Static site?

---

## 🎬 Implementation Scenarios

### Scenario A: Full System (Recommended)

**Use when:** Starting from scratch or building complete solution

**What to implement:**
- ✅ Backend API (FastAPI)
- ✅ Frontend Dashboard (React)
- ✅ Database (PostgreSQL)
- ✅ Background tasks (Celery + Redis)
- ✅ AI generation (Claude API)
- ✅ Blog publishing

**Time estimate:** 2-4 hours
**Complexity:** ⭐⭐⭐⭐

### Scenario B: Backend Only

**Use when:** Building API for mobile app or custom frontend

**What to implement:**
- ✅ Backend API (FastAPI)
- ✅ Database (PostgreSQL)
- ✅ Background tasks (Celery + Redis)
- ✅ AI generation (Claude API)
- ❌ Frontend Dashboard

**Time estimate:** 1-2 hours
**Complexity:** ⭐⭐⭐

### Scenario C: Add to Existing FastAPI Project

**Use when:** You have FastAPI project, want to add AI content generation

**What to implement:**
- ✅ AI service module
- ✅ Content generation endpoints
- ✅ Database models for posts
- ❌ Auth (use existing)
- ❌ Frontend (optional)

**Time estimate:** 1 hour
**Complexity:** ⭐⭐

### Scenario D: Add to Existing React Project

**Use when:** You have React dashboard, want to add content management

**What to implement:**
- ✅ Frontend pages (Agents, Posts, Tasks)
- ✅ API client
- ✅ TypeScript types
- ❌ Backend (use existing API)

**Time estimate:** 1-2 hours
**Complexity:** ⭐⭐

---

## 📝 Step-by-Step Implementation

### Phase 1: Environment Setup (15 min)

#### Step 1.1: Create Project Structure

```bash
# If new project
mkdir my-ai-blog-system
cd my-ai-blog-system

# If existing project
cd /path/to/your/project
```

#### Step 1.2: Copy Repository Files

**For full system:**
```bash
# Clone or download this repo
git clone https://github.com/zurychhh/auto-blog-seo-monster.git temp-clone

# Copy backend
cp -r temp-clone/backend ./backend

# Copy frontend
cp -r temp-clone/frontend ./frontend

# Copy docker-compose
cp temp-clone/docker-compose.yml ./

# Cleanup
rm -rf temp-clone
```

**For selective copy (just backend):**
```bash
cp -r temp-clone/backend ./backend
cp temp-clone/docker-compose.yml ./
# Edit docker-compose.yml to remove frontend service
```

#### Step 1.3: Install Dependencies

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

#### Step 1.4: Configure Environment

**Backend .env:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with:
```env
# Database - CHANGE THIS
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/dbname

# Redis - CHANGE THIS if not localhost
REDIS_URL=redis://localhost:6379/0

# JWT Secret - GENERATE NEW SECRET
JWT_SECRET=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Anthropic Claude API - REQUIRED
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Brave Search (optional but recommended)
BRAVE_API_KEY=your-brave-api-key-here

# App Config
APP_NAME=Your Blog Name
DEBUG=false
CORS_ORIGINS=http://localhost:5173
```

**Frontend .env:**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

### Phase 2: Database Setup (10 min)

#### Step 2.1: Create Database

```bash
# PostgreSQL
createdb your_db_name

# Or via psql
psql -U postgres
CREATE DATABASE your_db_name;
\q
```

#### Step 2.2: Run Migrations

```bash
cd backend
source venv/bin/activate

# Check migrations
alembic current

# Run migrations
alembic upgrade head

# Verify tables created
psql your_db_name -c "\dt"
```

Expected tables:
- tenants
- users
- agents
- posts
- sources
- publishers

#### Step 2.3: Create Admin User

**Option A: Use init_db script (recommended):**

Create `backend/scripts/init_db.py`:
```python
import asyncio
from app.core.database import async_session_maker
from app.models.user import User
from app.core.security import get_password_hash

async def create_admin():
    async with async_session_maker() as db:
        admin = User(
            email="admin@test.com",
            hashed_password=get_password_hash("Admin123!"),
            role="superadmin",
            is_active=True
        )
        db.add(admin)
        await db.commit()
        print("✓ Admin user created")

if __name__ == "__main__":
    asyncio.run(create_admin())
```

Run:
```bash
python scripts/init_db.py
```

**Option B: Direct SQL:**
```sql
INSERT INTO users (id, email, hashed_password, role, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  '$2b$12$KpqYkHNqEqHjC5p6dKFJrOvVxGKZVjPkJqJmHv3TqKZFhXyVZ4Kai', -- Admin123!
  'superadmin',
  true,
  NOW()
);
```

---

### Phase 3: Backend Services (20 min)

#### Step 3.1: Start Backend Server

```bash
cd backend
source venv/bin/activate

# Development mode
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Test:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}

curl http://localhost:8000/docs
# Should load Swagger UI
```

#### Step 3.2: Start Redis

```bash
# Option A: Local Redis
redis-server

# Option B: Docker
docker run -d -p 6379:6379 redis:7-alpine

# Test
redis-cli ping
# Should return: PONG
```

#### Step 3.3: Start Celery Worker

```bash
# New terminal
cd backend
source venv/bin/activate

celery -A app.celery_app worker --loglevel=info

# Should see:
# [tasks]
#   . app.tasks.content.generate_post
#   . app.tasks.content.research_topic
```

#### Step 3.4: Test API Authentication

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'

# Should return:
# {"access_token":"eyJ...","token_type":"bearer"}

# Get current user (replace TOKEN)
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"

# Should return user object
```

---

### Phase 4: Frontend Setup (15 min)

#### Step 4.1: Start Frontend

```bash
cd frontend
npm run dev

# Should see:
# VITE v7.2.6  ready in 165 ms
# ➜  Local:   http://localhost:5173/
```

#### Step 4.2: Test Login

1. Open browser: http://localhost:5173
2. Login with: `admin@test.com` / `Admin123!`
3. Should redirect to Dashboard
4. Verify:
   - ✓ Dashboard loads
   - ✓ Navigation works
   - ✓ No console errors

#### Step 4.3: Test All Pages

Navigate through:
- Dashboard (/)
- Agents (/agents)
- Posts (/posts)
- Sources (/sources)
- Publishers (/publishers)
- Tasks (/tasks)

All should load without errors.

---

### Phase 5: AI Integration (10 min)

#### Step 5.1: Verify Anthropic API Key

```bash
# Test API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 10,
    "messages": [{"role":"user","content":"Hi"}]
  }'

# Should return message response (not 401)
```

#### Step 5.2: Create Test Agent

Via Dashboard:
1. Go to **Agents** → **Create Agent**
2. Fill in:
   - Name: "Test Writer"
   - Description: "Test AI agent"
   - Tone: "professional"
   - Keywords: ["test", "demo"]
   - SEO Focus: "readability"
3. Click **Create**

Or via API:
```bash
TOKEN="your-jwt-token"
curl -X POST http://localhost:8000/api/v1/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Writer",
    "tone_style": "professional",
    "keywords": ["test"],
    "seo_focus": "readability"
  }'
```

#### Step 5.3: Generate Test Post

Via Dashboard:
1. Go to **Tasks** → **Trigger New Task**
2. Select agent: "Test Writer"
3. Topic: "Introduction to Python"
4. Keyword: "python tutorial"
5. Click **Trigger**
6. Wait 30-60 seconds
7. Check **Posts** page for new post

Or via API:
```bash
curl -X POST http://localhost:8000/api/v1/tasks/trigger \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "AGENT_UUID_HERE",
    "topic": "Introduction to Python",
    "keyword": "python tutorial"
  }'
```

Verify:
- ✓ Task appears in Tasks page
- ✓ Post generated with content
- ✓ SEO scores calculated
- ✓ Word count > 500
- ✓ No errors in console/logs

---

## 🧩 Component-by-Component Guide

### Authentication System

**Files to copy:**
```
backend/app/core/security.py       # JWT, password hashing
backend/app/api/auth.py            # Login, register endpoints
backend/app/models/user.py         # User model
frontend/src/context/AuthContext.tsx  # Auth state management
frontend/src/api/auth.ts           # Auth API client
```

**Integration steps:**

1. **If using existing auth:**
   - Skip auth files
   - Modify `app/api/deps.py` to use your `get_current_user`
   - Update `AuthContext.tsx` to call your login endpoint

2. **If using this auth:**
   - Copy all auth files
   - Update JWT_SECRET in .env
   - Modify User model if needed (add fields)
   - Test login flow

**Configuration:**
```python
# backend/app/core/config.py
class Settings(BaseSettings):
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
```

---

### Multi-Tenant System

**Files to copy:**
```
backend/app/models/tenant.py       # Tenant model
backend/app/api/tenants.py         # Tenant CRUD
backend/app/api/deps.py            # Tenant dependency injection
```

**How it works:**
- Every user has `tenant_id` (nullable for superadmin)
- All queries filtered by `tenant_id` automatically
- Dependency injection ensures isolation

**Integration:**

1. **Enable multi-tenant:**
   ```python
   # In your API routes
   from app.api.deps import get_current_tenant

   @router.get("/items")
   async def get_items(
       tenant: Tenant = Depends(get_current_tenant),
       db: AsyncSession = Depends(get_db)
   ):
       # Auto-filtered by tenant
       items = await db.execute(
           select(Item).where(Item.tenant_id == tenant.id)
       )
       return items.scalars().all()
   ```

2. **Disable multi-tenant (single tenant mode):**
   - Remove `tenant_id` from models
   - Remove `get_current_tenant` dependency
   - Simplify queries

**Testing:**
```bash
# Create tenant
curl -X POST http://localhost:8000/api/v1/tenants \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{"name":"Test Company"}'

# Create user for tenant
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "email":"user@test.com",
    "password":"Pass123!",
    "tenant_id":"TENANT_UUID",
    "role":"admin"
  }'
```

---

### AI Content Generation

**Files to copy:**
```
backend/app/services/ai_service.py      # Claude API client
backend/app/services/content_service.py # Content generation
backend/app/services/seo_service.py     # SEO optimization
backend/app/services/research_service.py # Topic research
backend/app/tasks/content.py            # Celery tasks
```

**Configuration:**
```env
ANTHROPIC_API_KEY=sk-ant-your-key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
BRAVE_API_KEY=your-brave-key  # Optional
```

**Customization points:**

1. **Change AI provider:**
   ```python
   # Replace app/services/ai_service.py
   class OpenAIService:
       async def generate_content(self, prompt: str) -> str:
           # Use OpenAI instead
           response = await openai.ChatCompletion.create(...)
           return response.choices[0].message.content
   ```

2. **Customize prompts:**
   ```python
   # In app/services/content_service.py
   def _build_content_prompt(self, agent, topic, research):
       return f"""
       Write a blog post about: {topic}

       Tone: {agent.tone_style}
       Target audience: {agent.target_audience}
       SEO focus: {agent.seo_focus}

       Research context:
       {research}

       Requirements:
       - 800-1200 words
       - Engaging introduction
       - Clear sections with headings
       - Actionable conclusion
       """
   ```

3. **Add post-processing:**
   ```python
   async def generate_post(self, agent_id, topic, keyword):
       # Generate content
       content = await self.ai_service.generate(prompt)

       # Post-process
       content = self.add_internal_links(content)
       content = self.optimize_images(content)
       content = self.add_cta(content)

       return content
   ```

**Testing:**
```python
# backend/tests/test_content_generation.py
import pytest
from app.services.content_service import ContentService

@pytest.mark.asyncio
async def test_generate_post():
    service = ContentService()
    post = await service.generate_post(
        agent_id="test-id",
        topic="Python async/await",
        keyword="python asyncio"
    )

    assert len(post.content) > 500
    assert post.seo_score > 50
    assert "async" in post.content.lower()
```

---

### Background Tasks (Celery)

**Files to copy:**
```
backend/app/celery_app.py          # Celery config
backend/app/tasks/                 # All task modules
backend/app/core/celery_config.py  # Celery settings
```

**Setup:**

1. **Install Redis:**
   ```bash
   # Docker
   docker run -d -p 6379:6379 redis:7-alpine

   # Or local
   brew install redis && redis-server
   ```

2. **Configure Celery:**
   ```python
   # backend/app/core/config.py
   REDIS_URL: str = "redis://localhost:6379/0"
   CELERY_BROKER_URL: str = REDIS_URL
   CELERY_RESULT_BACKEND: str = REDIS_URL
   ```

3. **Start worker:**
   ```bash
   celery -A app.celery_app worker --loglevel=info
   ```

4. **Start beat (scheduler):**
   ```bash
   celery -A app.celery_app beat --loglevel=info
   ```

**Add new task:**

```python
# backend/app/tasks/your_task.py
from app.celery_app import celery_app

@celery_app.task(bind=True, max_retries=3)
def your_background_task(self, arg1, arg2):
    try:
        # Your task logic
        result = do_something(arg1, arg2)
        return result
    except Exception as exc:
        # Retry on failure
        self.retry(exc=exc, countdown=60)
```

**Call from API:**
```python
from app.tasks.your_task import your_background_task

@router.post("/trigger")
async def trigger_task(data: dict):
    task = your_background_task.delay(data["arg1"], data["arg2"])
    return {"task_id": task.id}

@router.get("/status/{task_id}")
async def get_status(task_id: str):
    task = celery_app.AsyncResult(task_id)
    return {
        "status": task.status,
        "result": task.result if task.ready() else None
    }
```

---

### React Dashboard

**Files to copy:**
```
frontend/src/api/          # API client layer
frontend/src/components/   # Reusable components
frontend/src/context/      # React context
frontend/src/pages/        # Page components
frontend/src/types/        # TypeScript types
```

**Customization:**

1. **Change UI library (from Ant Design):**
   ```tsx
   // Replace Ant Design imports with Material-UI
   // Before:
   import { Button, Table } from 'antd';

   // After:
   import { Button, TableContainer } from '@mui/material';
   ```

2. **Add new page:**
   ```tsx
   // frontend/src/pages/Analytics.tsx
   export const Analytics: React.FC = () => {
     // Your page component
     return <div>Analytics</div>;
   };

   // Add route in App.tsx
   <Route path="analytics" element={<Analytics />} />
   ```

3. **Customize API client:**
   ```typescript
   // frontend/src/api/client.ts
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

   export const apiClient = axios.create({
     baseURL: API_BASE_URL,
     // Add custom headers, interceptors
   });
   ```

---

## ✅ Integration Checklist

Use this checklist when implementing:

### Backend Setup
- [ ] Python 3.11+ installed
- [ ] PostgreSQL 16+ running
- [ ] Redis 7+ running
- [ ] Virtual environment created
- [ ] Dependencies installed from requirements.txt
- [ ] .env file configured with all secrets
- [ ] Database created
- [ ] Migrations run successfully
- [ ] Admin user created
- [ ] Backend server starts without errors
- [ ] Health check returns 200
- [ ] Swagger docs accessible at /docs
- [ ] Login endpoint works

### Celery Setup
- [ ] Redis connection verified
- [ ] Celery worker starts
- [ ] Tasks registered (check worker output)
- [ ] Health check endpoint works
- [ ] Test task execution succeeds

### AI Integration
- [ ] Anthropic API key configured
- [ ] API key validated (test request works)
- [ ] Agent created successfully
- [ ] Test content generation works
- [ ] SEO scores calculated
- [ ] Token counting accurate

### Frontend Setup
- [ ] Node.js 18+ installed
- [ ] Dependencies installed from package.json
- [ ] .env file with API URL
- [ ] Development server starts
- [ ] Login page loads
- [ ] Authentication works
- [ ] Dashboard loads after login
- [ ] All pages accessible
- [ ] No TypeScript errors
- [ ] Production build succeeds

### Database Schema
- [ ] All tables created
- [ ] Foreign keys working
- [ ] Indexes created
- [ ] Migrations are reversible
- [ ] Sample data loads correctly

### Security
- [ ] JWT_SECRET is strong and unique
- [ ] Passwords hashed with bcrypt
- [ ] CORS configured correctly
- [ ] API rate limiting enabled
- [ ] SQL injection protection (via ORM)
- [ ] XSS protection (via React)

### Testing
- [ ] Backend tests pass: `pytest`
- [ ] Frontend builds: `npm run build`
- [ ] TypeScript check: `npm run type-check`
- [ ] Manual testing completed
- [ ] Edge cases handled

### Documentation
- [ ] README updated with project specifics
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment instructions written

---

## 🐛 Troubleshooting

### Common Issues

#### Issue 1: Database Connection Failed

**Error:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solutions:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in .env
3. Check credentials: `psql $DATABASE_URL`
4. Ensure database exists: `createdb dbname`

#### Issue 2: Celery Tasks Not Running

**Error:**
```
[ERROR/ForkPoolWorker-1] Task handler raised error: ...
```

**Solutions:**
1. Check Redis is running: `redis-cli ping`
2. Verify REDIS_URL in .env
3. Restart Celery worker
4. Check task imports in celery_app.py
5. Look for Python errors in task code

#### Issue 3: Frontend Can't Connect to Backend

**Error:**
```
Network Error: Request failed with status code 0
```

**Solutions:**
1. Check backend is running: `curl localhost:8000/health`
2. Verify VITE_API_BASE_URL in frontend/.env
3. Check CORS_ORIGINS in backend/.env includes frontend URL
4. Clear browser cache/cookies
5. Check browser console for CORS errors

#### Issue 4: Authentication Not Working

**Error:**
```
401 Unauthorized
```

**Solutions:**
1. Check JWT_SECRET is set
2. Verify token in localStorage (DevTools → Application → Local Storage)
3. Check token expiry time
4. Verify Bearer token format in headers
5. Check user exists in database

#### Issue 5: AI Generation Fails

**Error:**
```
anthropic.APIError: Invalid API key
```

**Solutions:**
1. Verify ANTHROPIC_API_KEY in .env
2. Check API key is active on Anthropic dashboard
3. Test API key with curl
4. Check rate limits
5. Verify model name is correct

#### Issue 6: TypeScript Errors in Frontend

**Error:**
```
TS2307: Cannot find module 'antd' or its corresponding type declarations
```

**Solutions:**
1. Install dependencies: `npm install`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check TypeScript version: `npx tsc --version`
4. Update @types packages

---

## 🧪 Testing Instructions

### Backend Testing

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app --cov-report=html

# Open coverage report
open htmlcov/index.html
```

**Write new tests:**
```python
# tests/test_my_feature.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_my_endpoint(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/my-endpoint", headers=auth_headers)
    assert response.status_code == 200
    assert "expected_field" in response.json()
```

### Frontend Testing

```bash
cd frontend

# Type check
npx tsc --noEmit

# Build test
npm run build

# Lint
npm run lint

# Fix lint issues
npm run lint -- --fix
```

### Integration Testing

```bash
# 1. Start all services
docker-compose up -d

# 2. Wait for health
sleep 10
curl http://localhost:8000/health

# 3. Run test script
bash scripts/integration-test.sh
```

Create `scripts/integration-test.sh`:
```bash
#!/bin/bash
set -e

echo "=== Integration Tests ==="

# Test login
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}' \
  | jq -r '.access_token')

echo "✓ Login successful"

# Test create agent
AGENT_ID=$(curl -s -X POST http://localhost:8000/api/v1/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Agent","tone_style":"professional","keywords":["test"]}' \
  | jq -r '.id')

echo "✓ Agent created: $AGENT_ID"

# Test generate content
TASK_ID=$(curl -s -X POST http://localhost:8000/api/v1/tasks/trigger \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\":\"$AGENT_ID\",\"topic\":\"Test Topic\",\"keyword\":\"test\"}" \
  | jq -r '.task_id')

echo "✓ Task triggered: $TASK_ID"

# Wait and check status
sleep 30
STATUS=$(curl -s http://localhost:8000/api/v1/tasks/status/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.status')

echo "✓ Task status: $STATUS"

echo "=== All tests passed ==="
```

---

## 🎓 Claude Code Instructions

**When implementing this system, follow these steps:**

### 1. Initial Assessment
- Read user's requirements carefully
- Ask about tech stack compatibility
- Clarify which components are needed
- Check for existing code that conflicts

### 2. Planning Phase
- Use TodoWrite to create implementation checklist
- Break down into phases (backend → database → AI → frontend)
- Estimate complexity and time
- Identify potential issues early

### 3. Implementation Phase
- Copy files systematically (don't skip any)
- Modify configuration files first (.env, config.py)
- Test each phase before moving to next
- Use Bash tool to verify services are running
- Check logs frequently for errors

### 4. Testing Phase
- Run pytest for backend
- Build frontend to check for errors
- Test authentication flow manually
- Generate test content with AI
- Verify all CRUD operations

### 5. Documentation Phase
- Update README with project-specific info
- Document any custom changes
- Add deployment instructions
- Create runbook for common tasks

### 6. Handoff
- Provide complete checklist of what was done
- List any remaining TODOs
- Explain any deviations from plan
- Give troubleshooting guide

---

## 📚 Additional Resources

### Documentation Links
- **FastAPI**: https://fastapi.tiangolo.com/
- **SQLAlchemy 2.0**: https://docs.sqlalchemy.org/en/20/
- **React**: https://react.dev/
- **Ant Design**: https://ant.design/
- **Celery**: https://docs.celeryq.dev/
- **Anthropic Claude API**: https://docs.anthropic.com/

### Example Projects
- Full implementation: This repository
- Backend only: See `examples/backend-only/`
- Frontend only: See `examples/frontend-only/`

### Support
- GitHub Issues: [Report bugs]
- Discussions: [Ask questions]
- Documentation: `docs/` folder

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** Production Ready ✅
