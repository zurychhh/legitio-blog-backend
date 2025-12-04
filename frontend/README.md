# Auto-Blog SEO Monster - React Frontend

Modern React dashboard for managing the Auto-Blog SEO Monster content generation system.

## Features

- **Authentication** - JWT-based login with protected routes
- **Dashboard** - Real-time statistics and recent posts
- **Agents Management** - CRUD operations for AI agents
- **Posts Management** - View, edit, schedule, and publish posts
- **Sources** - Configure RSS feeds and API integrations
- **Publishers** - WordPress, Webhook, and API publishing
- **Task Monitoring** - Real-time Celery task tracking

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Ant Design (UI components)
- React Router (routing)
- Axios (HTTP client)
- TanStack Query (data fetching)
- React Markdown (content preview)

## Quick Start

### Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

**Login:** admin@test.com / Admin123!

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/          # API client and services
├── components/   # Reusable components
├── context/      # React contexts (Auth)
├── pages/        # Page components
├── types/        # TypeScript types
└── App.tsx       # Main app with routing
```

## Environment Variables

Create `.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Documentation

- **Complete Guide:** ../PHASE5_COMPLETE.md
- **Testing Guide:** ../PHASE5_TESTING.md

## Scripts

- `npm run dev` - Development server (port 3000)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

The frontend connects to the FastAPI backend at http://localhost:8000

**API Proxy:** Configured in vite.config.ts for CORS handling in development.

## License

MIT
