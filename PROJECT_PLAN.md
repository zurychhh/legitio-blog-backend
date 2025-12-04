# 🚀 AUTO-BLOG SEO MONSTER - Plan Implementacji

## Projekt dla Claude Code (Opus 4.5)

---

## 📋 OVERVIEW

**Nazwa:** Auto-Blog SEO Monster  
**Cel:** Reużywalny, multi-tenant komponent do automatycznej publikacji postów SEO na blogach  
**Stack:** Python/FastAPI + React + PostgreSQL + Redis + Celery  
**Hosting:** Railway (serverless)  
**AI:** Claude API (Anthropic)

---

## 🎯 CORE FEATURES

### Multi-tenant System
- Superadmin zarządza tenantami (klientami)
- Każdy tenant ma własne: agenty, źródła, limity, posty
- Izolacja danych na poziomie DB (tenant_id)

### AI Agents
- Konfigurowalny "ekspert" (prawo, marketing, tech, etc.)
- Persona + tone of voice
- Źródła wiedzy przypisane do agenta
- Harmonogram publikacji (cron)

### Source Adapters (źródła wiedzy)
- RSS/Atom feeds
- Web scraping (Playwright)
- Web search (Brave API)
- Sitemap crawling
- Manual knowledge base

### Publisher Adapters (publikacja)
- WordPress REST API
- Ghost API
- FTP/SFTP (static sites)
- Webhook (custom CMS)
- GitHub Pages (markdown)
- Raw HTML export

### SEO Monster Engine
- AI meta title/description
- Schema markup (Article, FAQ, HowTo, Breadcrumb)
- Keyword extraction + density
- Internal linking suggestions
- Readability score (Flesch-Kincaid)
- Auto image alt-text
- Canonical URL generation
- Open Graph + Twitter Cards
- Auto sitemap ping

### Workflow Modes
- Auto-publish (instant)
- Draft → Review → Publish
- Scheduled queue

### Billing/Limits
- Token counting per tenant
- Posts/month limit
- Configurable per tenant in admin

---

## 🏗️ ARCHITEKTURA

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│   │  Dashboard  │  │   Agents    │  │    Posts    │         │
│   └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (FastAPI)                     │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│   │  Auth   │  │  CRUD   │  │ Agents  │  │ Publish │       │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────────────┐
│   PostgreSQL    │  │    Redis    │  │   Celery Workers    │
│   (Data Store)  │  │   (Queue)   │  │  (Scheduled Tasks)  │
└─────────────────┘  └─────────────┘  └─────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
           ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
           │ Source Adapters │      │   AI Engine     │      │Publisher Adapters│
           │  RSS/Scrape/    │      │  Claude API     │      │  WP/Ghost/FTP   │
           │  Search/Sitemap │      │  SEO Monster    │      │  Webhook/GitHub │
           └─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 📁 STRUKTURA PLIKÓW

```
/auto-blog-agent
│
├── /backend
│   ├── /app
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Settings (pydantic)
│   │   ├── database.py             # SQLAlchemy setup
│   │   │
│   │   ├── /models                 # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── tenant.py
│   │   │   ├── user.py
│   │   │   ├── agent.py
│   │   │   ├── source.py
│   │   │   ├── post.py
│   │   │   └── usage.py
│   │   │
│   │   ├── /schemas                # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── tenant.py
│   │   │   ├── agent.py
│   │   │   ├── source.py
│   │   │   └── post.py
│   │   │
│   │   ├── /api                    # API routes
│   │   │   ├── __init__.py
│   │   │   ├── deps.py             # Dependencies (auth, db)
│   │   │   ├── auth.py
│   │   │   ├── tenants.py
│   │   │   ├── agents.py
│   │   │   ├── sources.py
│   │   │   ├── posts.py
│   │   │   └── publisher.py
│   │   │
│   │   ├── /services               # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── agent_service.py
│   │   │   └── seo_service.py
│   │   │
│   │   ├── /sources                # Source adapters
│   │   │   ├── __init__.py
│   │   │   ├── base.py             # Abstract base
│   │   │   ├── rss_adapter.py
│   │   │   ├── scraper_adapter.py
│   │   │   ├── search_adapter.py
│   │   │   └── sitemap_adapter.py
│   │   │
│   │   ├── /publishers             # Publisher adapters
│   │   │   ├── __init__.py
│   │   │   ├── base.py             # Abstract base
│   │   │   ├── wordpress.py
│   │   │   ├── ghost.py
│   │   │   ├── ftp.py
│   │   │   ├── webhook.py
│   │   │   └── github.py
│   │   │
│   │   ├── /ai                     # AI Engine
│   │   │   ├── __init__.py
│   │   │   ├── claude_client.py
│   │   │   ├── post_generator.py
│   │   │   └── seo_optimizer.py
│   │   │
│   │   └── /tasks                  # Celery tasks
│   │       ├── __init__.py
│   │       ├── celery_app.py
│   │       ├── content_tasks.py
│   │       └── publish_tasks.py
│   │
│   ├── /migrations                 # Alembic migrations
│   ├── /tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.toml
│
├── /frontend
│   ├── /src
│   │   ├── /components
│   │   ├── /pages
│   │   ├── /hooks
│   │   ├── /services
│   │   ├── /store
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── /docs
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── ADAPTERS.md
│
├── docker-compose.yml              # Local dev
├── .env.example
└── README.md
```

---

## 🗄️ DATABASE SCHEMA

### Tabele:

```sql
-- Tenants (klienci)
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    tokens_limit INTEGER DEFAULT 100000,
    tokens_used INTEGER DEFAULT 0,
    posts_limit INTEGER DEFAULT 50,
    posts_used INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'superadmin', 'admin', 'editor'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agents (AI eksperci)
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    expertise VARCHAR(100) NOT NULL, -- 'prawo', 'marketing', etc.
    persona TEXT, -- opis persony AI
    tone VARCHAR(50) DEFAULT 'professional',
    post_length VARCHAR(50) DEFAULT 'medium', -- 'short', 'medium', 'long'
    schedule_cron VARCHAR(100), -- '0 9 * * 1' (pon 9:00)
    workflow VARCHAR(50) DEFAULT 'draft', -- 'auto', 'draft', 'scheduled'
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sources (źródła wiedzy)
CREATE TABLE sources (
    id UUID PRIMARY KEY,
    agent_id UUID REFERENCES agents(id),
    type VARCHAR(50) NOT NULL, -- 'rss', 'scrape', 'search', 'sitemap'
    name VARCHAR(255) NOT NULL,
    url TEXT,
    config JSONB DEFAULT '{}', -- adapter-specific config
    is_active BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Publishers (cele publikacji)
CREATE TABLE publishers (
    id UUID PRIMARY KEY,
    agent_id UUID REFERENCES agents(id),
    type VARCHAR(50) NOT NULL, -- 'wordpress', 'ghost', 'ftp', etc.
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL, -- credentials, endpoints
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    agent_id UUID REFERENCES agents(id),
    publisher_id UUID REFERENCES publishers(id),
    
    -- Content
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500),
    content TEXT NOT NULL,
    excerpt TEXT,
    
    -- SEO
    meta_title VARCHAR(70),
    meta_description VARCHAR(160),
    keywords JSONB DEFAULT '[]',
    schema_markup JSONB,
    og_image_url TEXT,
    canonical_url TEXT,
    
    -- Stats
    readability_score FLOAT,
    keyword_density JSONB,
    word_count INTEGER,
    
    -- Workflow
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed'
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    published_url TEXT,
    
    -- AI metadata
    source_urls JSONB DEFAULT '[]',
    tokens_used INTEGER DEFAULT 0,
    generation_prompt TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    agent_id UUID REFERENCES agents(id),
    action VARCHAR(50) NOT NULL, -- 'generate', 'publish', 'fetch'
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 AUTH SYSTEM

### Roles:
- **superadmin** - pełny dostęp, zarządza tenantami
- **admin** - zarządza agentami/postami w swoim tenant
- **editor** - tworzy/edytuje posty, brak dostępu do settings

### JWT Token Structure:
```json
{
  "sub": "user_id",
  "tenant_id": "uuid",
  "role": "admin",
  "exp": 1234567890
}
```

### Endpoints:
```
POST /auth/login          - Login (email + password)
POST /auth/register       - Register (superadmin only creates)
POST /auth/refresh        - Refresh token
GET  /auth/me             - Current user info
```

---

## 🔌 API ENDPOINTS

### Tenants (superadmin only)
```
GET    /tenants           - List all
POST   /tenants           - Create new
GET    /tenants/{id}      - Get one
PUT    /tenants/{id}      - Update
DELETE /tenants/{id}      - Soft delete
GET    /tenants/{id}/usage - Usage stats
```

### Agents
```
GET    /agents            - List (filtered by tenant)
POST   /agents            - Create
GET    /agents/{id}       - Get one
PUT    /agents/{id}       - Update
DELETE /agents/{id}       - Delete
POST   /agents/{id}/run   - Manual trigger
GET    /agents/{id}/logs  - Execution logs
```

### Sources
```
GET    /agents/{id}/sources     - List sources
POST   /agents/{id}/sources     - Add source
PUT    /sources/{id}            - Update
DELETE /sources/{id}            - Delete
POST   /sources/{id}/test       - Test fetch
```

### Publishers
```
GET    /agents/{id}/publishers  - List publishers
POST   /agents/{id}/publishers  - Add publisher
PUT    /publishers/{id}         - Update
DELETE /publishers/{id}         - Delete
POST   /publishers/{id}/test    - Test connection
```

### Posts
```
GET    /posts                   - List (paginated)
GET    /posts/{id}              - Get one
PUT    /posts/{id}              - Update content
DELETE /posts/{id}              - Delete
POST   /posts/{id}/publish      - Publish now
POST   /posts/{id}/schedule     - Schedule
POST   /posts/generate          - Manual generate
```

---

## 🤖 AI ENGINE

### Post Generation Flow:

```
1. FETCH SOURCES
   └─→ Collect content from RSS/scrape/search

2. ANALYZE TRENDS
   └─→ Extract topics, keywords, angles

3. GENERATE OUTLINE
   └─→ Claude creates structure

4. GENERATE CONTENT
   └─→ Claude writes full post

5. SEO OPTIMIZE
   ├─→ Meta title (max 60 chars)
   ├─→ Meta description (max 160 chars)
   ├─→ Keywords extraction
   ├─→ Schema markup
   ├─→ Internal links suggestions
   └─→ Readability check

6. SAVE DRAFT / PUBLISH
   └─→ Based on workflow setting
```

### Claude Prompts Structure:

```python
SYSTEM_PROMPT = """
Jesteś ekspertem w dziedzinie: {expertise}
Twoja persona: {persona}
Ton: {tone}
Piszesz dla: {target_audience}

Zasady SEO:
- Używaj nagłówków H2, H3
- Keyword w pierwszych 100 słowach
- Naturalne użycie synonimów
- Linkuj do źródeł
- Akapity max 3-4 zdania
"""

GENERATION_PROMPT = """
Na podstawie tych źródeł:
{sources_content}

Napisz artykuł blogowy:
- Temat: {topic}
- Długość: {length} słów
- Główne keyword: {keyword}
- Format: Markdown

Struktura:
1. Wstęp (hook + thesis)
2. 3-5 sekcji merytorycznych
3. Podsumowanie z CTA
"""
```

---

## 🔍 SEO OPTIMIZER

### Features:

```python
class SEOOptimizer:
    
    def generate_meta_title(self, content: str, keyword: str) -> str:
        """Max 60 chars, keyword at start"""
        
    def generate_meta_description(self, content: str, keyword: str) -> str:
        """Max 160 chars, CTA included"""
        
    def extract_keywords(self, content: str) -> List[str]:
        """Top 5-10 keywords with density"""
        
    def calculate_readability(self, content: str) -> float:
        """Flesch-Kincaid score"""
        
    def generate_schema(self, post: Post) -> dict:
        """Article schema markup"""
        
    def suggest_internal_links(self, content: str, existing_posts: List) -> List:
        """Find linking opportunities"""
        
    def generate_og_tags(self, post: Post) -> dict:
        """Open Graph meta tags"""
        
    def check_keyword_density(self, content: str, keyword: str) -> float:
        """Optimal: 1-2%"""
        
    def generate_faq_schema(self, content: str) -> dict:
        """Extract Q&A for schema"""
```

---

## 📅 SCHEDULER (Celery)

### Tasks:

```python
# Scheduled content generation
@celery.task
def generate_agent_content(agent_id: str):
    """Runs on agent's cron schedule"""
    
# Publish scheduled posts
@celery.task
def publish_scheduled_posts():
    """Runs every minute, checks queue"""
    
# Fetch sources
@celery.task
def fetch_sources(agent_id: str):
    """Fetch latest from all sources"""
    
# Usage reset (monthly)
@celery.task
def reset_monthly_usage():
    """Reset posts_used counter"""
    
# Sitemap ping
@celery.task
def ping_sitemaps(post_url: str):
    """Notify Google/Bing"""
```

### Celery Beat Schedule:
```python
CELERYBEAT_SCHEDULE = {
    'publish-scheduled': {
        'task': 'tasks.publish_scheduled_posts',
        'schedule': 60.0,  # every minute
    },
    'reset-usage': {
        'task': 'tasks.reset_monthly_usage',
        'schedule': crontab(day_of_month=1, hour=0, minute=0),
    },
}
```

---

## 🎨 FRONTEND (React Admin Panel)

### Pages:

```
/login                    - Login form
/dashboard                - Overview, stats
/tenants                  - Tenant management (superadmin)
/agents                   - Agent list
/agents/:id               - Agent config
/agents/:id/sources       - Source management
/agents/:id/publishers    - Publisher config
/posts                    - Post list
/posts/:id                - Post editor
/posts/:id/preview        - SEO preview
/settings                 - Account settings
/usage                    - Usage/billing stats
```

### Key Components:
```
<AgentCard />             - Agent overview card
<SourceForm />            - Dynamic source config
<PublisherForm />         - Publisher credentials
<PostEditor />            - Rich text + SEO sidebar
<SEOPreview />            - Google SERP preview
<UsageChart />            - Token usage graph
<CronBuilder />           - Visual cron editor
```

---

## 🚀 DEPLOYMENT (Railway)

### Services:
1. **api** - FastAPI (Dockerfile)
2. **worker** - Celery worker
3. **beat** - Celery beat scheduler
4. **redis** - Redis (Railway plugin)
5. **postgres** - PostgreSQL (Railway plugin)
6. **frontend** - React static (Nginx)

### Environment Variables:
```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Auth
JWT_SECRET=xxx
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24

# Claude API
ANTHROPIC_API_KEY=xxx

# External APIs
BRAVE_API_KEY=xxx (optional)

# App
APP_ENV=production
FRONTEND_URL=https://...
CORS_ORIGINS=["https://..."]
```

### railway.toml:
```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/health"
restartPolicyType = "on_failure"
```

---

## 📋 FAZY IMPLEMENTACJI

### FAZA 1: Core Backend (Dni 1-3)
```
□ Inicjalizacja projektu FastAPI
□ Config + environment
□ Database setup (SQLAlchemy + Alembic)
□ Models (wszystkie tabele)
□ Schemas (Pydantic)
□ Auth system (JWT)
□ Basic CRUD endpoints
□ Tests setup
```

### FAZA 2: AI Engine (Dni 4-5)
```
□ Claude client wrapper
□ Post generator service
□ SEO optimizer
□ Prompt templates
□ Token counting
```

### FAZA 3: Adapters (Dni 6-8)
```
□ Source base class
□ RSS adapter
□ Scraper adapter (Playwright)
□ Search adapter (Brave)
□ Publisher base class
□ WordPress adapter
□ Webhook adapter
```

### FAZA 4: Scheduler (Dni 9-10)
```
□ Celery setup
□ Content generation task
□ Publish task
□ Source fetch task
□ Celery Beat config
```

### FAZA 5: Frontend (Dni 11-15)
```
□ React + Vite setup
□ Auth pages
□ Dashboard
□ Agents CRUD
□ Sources/Publishers forms
□ Posts list + editor
□ SEO preview
□ Usage stats
```

### FAZA 6: Deployment (Dni 16-17)
```
□ Dockerfiles
□ Railway setup
□ CI/CD (GitHub Actions)
□ Monitoring
□ Dokumentacja
```

### FAZA 7: Testing na żywej stronie (Dni 18-20)
```
□ Setup tenant dla test site
□ Configure agent + sources
□ Connect publisher
□ Generate test posts
□ Verify SEO output
□ Performance tuning
```

---

## 🧪 TEST SITE INTEGRATION

### Dla Twojej testowej strony:

1. **Create tenant** w admin panelu
2. **Create agent**:
   - Expertise: (dopasuj do tematyki)
   - Tone: professional
   - Schedule: co 24h lub manual
3. **Add sources**:
   - RSS feeds branżowe
   - Konkurencja (sitemap scrape)
4. **Add publisher**:
   - WordPress API lub FTP
5. **Run first generation**
6. **Review draft**
7. **Publish + verify SEO**

---

## ✅ DEFINITION OF DONE

### MVP Complete when:
- [ ] Multi-tenant auth works
- [ ] Agent CRUD via API
- [ ] Minimum 1 source adapter (RSS)
- [ ] Minimum 1 publisher adapter (WordPress)
- [ ] AI generates SEO-optimized posts
- [ ] Scheduler runs on cron
- [ ] Admin panel functional
- [ ] Deployed on Railway
- [ ] Test post published on real site

---

## 📞 COMMANDS FOR CLAUDE CODE

### Start implementation:
```
"Zacznij od Fazy 1: zainicjalizuj projekt FastAPI z pełną strukturą folderów według PROJECT_PLAN.md"
```

### Continue:
```
"Kontynuuj Fazę X według planu"
```

### Debug:
```
"Sprawdź i napraw błędy w [component]"
```

### Test:
```
"Dodaj testy dla [module]"
```

---

## 🎯 SUCCESS METRICS

- **Time to first post**: < 30 min setup
- **Generation quality**: 80%+ posts require minimal edits
- **SEO score**: 90+ (Yoast/RankMath equivalent)
- **Uptime**: 99.9%
- **Generation speed**: < 60s per post

---

*Plan created for Claude Code Opus 4.5*
*Version: 1.0*
*Date: 2025*
