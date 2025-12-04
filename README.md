# 🚀 Auto-Blog SEO Monster

**Production-ready multi-tenant AI-powered blog content generation system with advanced SEO optimization.**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Overview

**Auto-Blog SEO Monster** is a comprehensive, production-ready system for automated blog content generation and publishing. Built with modern async Python (FastAPI) backend and React TypeScript frontend, it leverages Claude AI to generate high-quality, SEO-optimized content at scale.

Perfect for:
- 📝 Content marketers managing multiple blogs
- 🏢 Agencies serving multiple clients
- 🤖 SaaS platforms offering content generation
- 📊 SEO professionals automating workflows
- 🚀 Startups building content-driven products

## ✨ Features

### 🎯 Core Capabilities

#### Multi-Tenant Architecture
- **Complete data isolation** per tenant
- **Usage tracking** - tokens, costs, limits per tenant
- **Role-based access control** - superadmin, admin, editor
- **Scalable design** - ready for hundreds of tenants

#### AI Content Generation
- **Claude API integration** (Anthropic)
- **Intelligent topic research** via Brave Search API
- **Source aggregation** - RSS feeds, web scraping, APIs
- **Customizable agents** - tone, style, audience, SEO focus
- **Token counting & cost tracking**

#### Advanced SEO Optimization
- Meta titles & descriptions
- Keyword density analysis
- Readability scoring (Flesch-Kincaid)
- Schema markup generation
- Internal linking suggestions
- SEO score calculation (0-100)

#### Flexible Publishing
- **WordPress** - REST API integration
- **Webhook** - custom endpoints
- **API** - generic REST API support
- **Manual** - draft & review workflow
- **Scheduled publishing** with cron expressions

#### Background Processing
- **Celery workers** for async tasks
- **Redis** message broker & caching
- **Real-time task monitoring**
- **Health checks** & worker status
- **Auto-retry** on failures

#### Modern Dashboard
- **React 18** + TypeScript + Vite
- **Ant Design** UI components
- **Real-time updates** with React Query
- **Responsive design** - mobile-ready
- **Markdown preview** with syntax highlighting

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (React + TypeScript)                │
│  Dashboard | Agents | Posts | Sources | Publishers | Tasks  │
│                    http://localhost:5173                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI + SQLAlchemy 2.0)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   CRUD   │  │ Generator│  │ Publisher│   │
│  │   JWT    │  │   API    │  │   AI     │  │ Adapters │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                    http://localhost:8000                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  PostgreSQL  │  │    Redis     │  │ Celery Workers   │
│   Database   │  │ Cache+Queue  │  │ Background Tasks │
└──────────────┘  └──────────────┘  └──────────────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  External Services   │
                │  - Claude API        │
                │  - Brave Search      │
                │  - WordPress Sites   │
                └──────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Python 3.11+** - Modern async/await support
- **FastAPI 0.104+** - High-performance async web framework
- **SQLAlchemy 2.0** - Async ORM with relationship loading
- **PostgreSQL 16+** - ACID-compliant RDBMS
- **Redis 7+** - Caching and message broker
- **Celery 5+** - Distributed task queue
- **Alembic** - Database migrations
- **Pydantic v2** - Data validation
- **Pytest** - Testing framework

### Frontend
- **React 18** - UI library with hooks
- **TypeScript 5** - Type safety
- **Vite 7** - Fast build tool with HMR
- **Ant Design** - Enterprise UI components
- **React Router v6** - Client-side routing
- **TanStack Query** - Data fetching & caching
- **Axios** - HTTP client
- **React Markdown** - Content preview
- **Day.js** - Date manipulation

### AI & External Services
- **Anthropic Claude** - Content generation
- **Brave Search API** - Web research
- **BeautifulSoup4** - HTML parsing
- **Readability** - Text analysis

### DevOps
- **Docker & Docker Compose** - Containerization
- **PostgreSQL** - Official Docker image
- **Redis** - Official Docker image
- **Git** - Version control

## 📦 Quick Start

### Prerequisites

```bash
# Required
- Python 3.11 or higher
- Node.js 18+ and npm
- PostgreSQL 16+
- Redis 7+

# Optional (for Docker setup)
- Docker Desktop
- Docker Compose
```

### Option 1: Docker Setup (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/zurychhh/auto-blog-seo-monster.git
cd automatic-seo-blog

# 2. Copy environment file
cp backend/.env.example backend/.env

# 3. Edit .env with your settings (see Configuration section)
nano backend/.env

# 4. Start all services
docker-compose up -d

# 5. Check status
docker-compose ps

# 6. View logs
docker-compose logs -f

# Access:
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
# - Frontend: http://localhost:5173
```

### Option 2: Manual Setup

#### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup environment
cp .env.example .env
# Edit .env with your settings

# 5. Create database
createdb autoblog_dev

# 6. Run migrations
alembic upgrade head

# 7. Start backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 8. In new terminal, start Celery worker
celery -A app.celery_app worker --loglevel=info

# 9. In new terminal, start Redis
redis-server
```

#### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Default: VITE_API_BASE_URL=http://localhost:8000/api/v1

# 4. Start development server
npm run dev

# Access: http://localhost:5173
```

### First Login

**Default credentials:**
- Email: `admin@test.com`
- Password: `Admin123!`

**IMPORTANT:** Change these credentials in production!

## ⚙️ Configuration

### Environment Variables

Create `backend/.env` from `backend/.env.example`:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/autoblog_dev

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Brave Search API (optional, for research)
BRAVE_API_KEY=your-brave-api-key

# Application
APP_NAME=Auto-Blog SEO Monster
APP_VERSION=1.0.0
DEBUG=false
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🎯 Usage Guide

### 1. Create an Agent

Agents are AI "experts" that generate content with specific characteristics:

```python
{
  "name": "Tech Blog Writer",
  "description": "Writes technical tutorials for developers",
  "tone_style": "professional, educational",
  "keywords": ["python", "javascript", "web development"],
  "target_audience": "software developers",
  "seo_focus": "long-tail keywords, code examples",
  "schedule_cron": "0 9 * * 1"  // Every Monday at 9 AM
}
```

### 2. Add Sources

Configure where the agent gets inspiration:

**RSS Feed:**
```json
{
  "name": "Hacker News RSS",
  "source_type": "rss",
  "config": {
    "url": "https://news.ycombinator.com/rss",
    "check_frequency": "1h"
  }
}
```

**Web Scraping:**
```json
{
  "name": "Tech Blog Scraper",
  "source_type": "api",
  "config": {
    "url": "https://example.com/api/posts",
    "method": "GET"
  }
}
```

### 3. Configure Publisher

Set up where posts should be published:

**WordPress:**
```json
{
  "name": "My WordPress Blog",
  "publisher_type": "wordpress",
  "config": {
    "url": "https://myblog.com",
    "username": "admin",
    "application_password": "xxxx xxxx xxxx xxxx"
  }
}
```

### 4. Generate Content

**Manual trigger:**
```bash
# Via API
POST /api/v1/tasks/trigger
{
  "agent_id": "uuid-here",
  "topic": "Python async/await tutorial",
  "keyword": "python asyncio"
}

# Via Dashboard
Tasks → Trigger New Task → Select Agent → Submit
```

**Automatic (scheduled):**
- Agent with `schedule_cron` runs automatically
- Celery Beat triggers based on cron expression
- Monitor in Tasks dashboard

### 5. Review & Publish

1. Navigate to **Posts** page
2. Click on generated post
3. Review content in **Preview** tab
4. Check **SEO Metrics** tab for scores
5. Edit if needed in **Edit** tab
6. Publish:
   - **Now** - immediate publish
   - **Schedule** - set publish date
   - **Save as Draft** - manual review later

## 📊 API Documentation

### Authentication

All endpoints (except login) require JWT token:

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'

# Response
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}

# Use token in requests
curl http://localhost:8000/api/v1/agents \
  -H "Authorization: Bearer eyJhbGci..."
```

### Key Endpoints

**Interactive docs:** http://localhost:8000/docs

**Agents:**
- `GET /api/v1/agents` - List all agents
- `POST /api/v1/agents` - Create agent
- `GET /api/v1/agents/{id}` - Get agent details
- `PUT /api/v1/agents/{id}` - Update agent
- `DELETE /api/v1/agents/{id}` - Delete agent

**Posts:**
- `GET /api/v1/posts` - List posts (paginated)
- `GET /api/v1/posts/{id}` - Get post
- `PUT /api/v1/posts/{id}` - Update post
- `DELETE /api/v1/posts/{id}` - Delete post
- `POST /api/v1/posts/{id}/publish` - Publish post

**Tasks:**
- `POST /api/v1/tasks/trigger` - Trigger generation
- `GET /api/v1/tasks/active` - List active tasks
- `GET /api/v1/tasks/health` - Celery health check
- `GET /api/v1/tasks/status/{task_id}` - Task status

Full API reference: See [API.md](docs/API.md)

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v

# Run tests matching pattern
pytest -k "test_create" -v
```

### Frontend Tests

```bash
cd frontend

# Type check
npm run type-check

# Build test
npm run build

# Lint
npm run lint
```

## 🗄️ Database Schema

### Core Tables

**tenants** - Multi-tenant isolation
- id, name, is_active
- tokens_used, tokens_limit
- posts_count, posts_limit
- created_at, updated_at

**users** - Authentication & authorization
- id, email, hashed_password
- role (superadmin, admin, editor)
- tenant_id (nullable for superadmin)
- is_active, created_at

**agents** - AI content generators
- id, tenant_id, name, description
- tone_style, keywords[], target_audience
- seo_focus, is_active
- schedule_cron, last_generation
- created_at, updated_at

**posts** - Generated content
- id, agent_id, tenant_id
- title, slug, content, excerpt
- meta_title, meta_description, keywords[]
- status (draft, published, scheduled, failed)
- readability_score, seo_score, word_count
- tokens_used, cost_usd
- published_url, scheduled_at, published_at
- created_at, updated_at

**sources** - Content inspiration
- id, agent_id, tenant_id
- name, source_type (rss, api, webhook)
- config (JSONB), is_active
- last_fetch, created_at, updated_at

**publishers** - Publishing destinations
- id, agent_id, tenant_id
- name, publisher_type (wordpress, webhook, api)
- config (JSONB), is_active
- last_publish, created_at, updated_at

See full schema: [ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 🚀 Deployment

### Railway (Recommended)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add PostgreSQL
railway add -d postgres

# 5. Add Redis
railway add -d redis

# 6. Deploy
railway up

# 7. Set environment variables in Railway dashboard
```

### Docker Production

```bash
# 1. Build images
docker-compose -f docker-compose.prod.yml build

# 2. Start services
docker-compose -f docker-compose.prod.yml up -d

# 3. Run migrations
docker-compose exec api alembic upgrade head

# 4. Check health
curl http://your-domain.com/health
```

### Manual VPS Deployment

See detailed guide: [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📚 Documentation

- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Implement in your project
- **[BLOG_INTEGRATION_GUIDE.md](BLOG_INTEGRATION_GUIDE.md)** - Connect your blog
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[API.md](docs/API.md)** - Complete API reference
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guide

## 🛣️ Roadmap

### Completed ✅
- [x] **Phase 1:** FastAPI backend with async SQLAlchemy
- [x] **Phase 2:** AI content generation with Claude
- [x] **Phase 3:** Source & Publisher adapters
- [x] **Phase 4:** Celery background tasks
- [x] **Phase 5:** React TypeScript dashboard

### In Progress 🚧
- [ ] **Phase 6:** Production deployment & CI/CD
- [ ] **Phase 7:** Monitoring & analytics

### Planned 📋
- [ ] Advanced SEO features (competitor analysis, SERP tracking)
- [ ] Multi-language support
- [ ] Image generation integration (DALL-E, Midjourney)
- [ ] A/B testing for headlines
- [ ] Analytics dashboard (traffic, conversions)
- [ ] Email marketing integration (Mailchimp, SendGrid)
- [ ] Social media auto-posting
- [ ] Content calendar with visual timeline

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup

```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/zurychhh/auto-blog-seo-monster.git

# 3. Create feature branch
git checkout -b feature/amazing-feature

# 4. Make changes and commit
git commit -m "Add amazing feature"

# 5. Push to your fork
git push origin feature/amazing-feature

# 6. Create Pull Request
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI powered by [Ant Design](https://ant.design/)
- AI by [Anthropic Claude](https://www.anthropic.com/)
- Created with [Claude Code](https://claude.ai/claude-code)

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/zurychhh/auto-blog-seo-monster/issues)
- **Discussions:** [GitHub Discussions](https://github.com/zurychhh/auto-blog-seo-monster/discussions)

## ⭐ Star History

If this project helped you, please consider giving it a star! ⭐

---

**Made with ❤️ by the community**

**Version:** 1.0.0
**Status:** Production Ready ✅
**Last Updated:** December 2024
