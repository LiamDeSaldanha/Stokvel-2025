# System Architecture

## Overview

This application follows a modern microservices architecture with containerized services.

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP (Port 3000)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Container                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React App (Port 80)                       │ │
│  │  - React 18                                            │ │
│  │  - React Router                                        │ │
│  │  - Axios for API calls                                 │ │
│  │  - Served by Nginx                                     │ │
│  └────────────────────────┬───────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────┘
                             │
                             │ HTTP (Internal Network)
                             │ /api/* → backend:8000
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Container                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              FastAPI App (Port 8000)                   │ │
│  │  - FastAPI Framework                                   │ │
│  │  - Pydantic for validation                             │ │
│  │  - SQLAlchemy ORM                                      │ │
│  │  - Uvicorn ASGI server                                 │ │
│  │  - JWT Authentication (ready)                          │ │
│  └────────────────────────┬───────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────┘
                             │
                             │ PostgreSQL Protocol (Port 5432)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Container                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           PostgreSQL 15 Database                       │ │
│  │  - Persistent volume storage                           │ │
│  │  - Health checks enabled                               │ │
│  │  - Ready for migrations                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  n8n Container (Future)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           n8n Workflow Automation                      │ │
│  │  - Currently commented in docker-compose               │ │
│  │  - Ready to enable when needed                         │ │
│  │  - Port 5678                                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Frontend (React + Node.js + Nginx)
- **Technology**: React 18, Node.js, Nginx
- **Port**: 3000 (external), 80 (internal)
- **Purpose**: User interface
- **Features**:
  - Single Page Application (SPA)
  - API integration via Axios
  - Hot-reload during development
  - Production build served by Nginx

### Backend (FastAPI + Python)
- **Technology**: FastAPI, Python 3.11, Uvicorn
- **Port**: 8000
- **Purpose**: REST API, business logic
- **Features**:
  - Auto-generated OpenAPI documentation
  - Pydantic data validation
  - SQLAlchemy ORM
  - CORS enabled
  - Hot-reload during development

### Database (PostgreSQL)
- **Technology**: PostgreSQL 15
- **Port**: 5432
- **Purpose**: Data persistence
- **Features**:
  - Persistent volume storage
  - Health checks
  - Ready for Alembic migrations

### n8n (Future - Workflow Automation)
- **Technology**: n8n
- **Port**: 5678
- **Purpose**: Workflow automation
- **Status**: Prepared but commented out

## Data Flow

### User Request Flow
1. User interacts with React frontend (Port 3000)
2. Frontend makes API call to `/api/*`
3. Nginx proxies request to backend:8000
4. Backend processes request using FastAPI
5. Backend queries PostgreSQL database
6. Response flows back to frontend
7. Frontend updates UI

### Development Flow
1. Developer edits code locally
2. Docker mounts volumes for hot-reload
3. Changes reflect immediately (no rebuild needed)
4. Backend auto-reloads on Python file changes
5. Frontend auto-reloads on React file changes

## Network Architecture

All services run in a custom Docker bridge network: `stokvel-network`

**Internal Communication:**
- frontend → backend: `http://backend:8000`
- backend → postgres: `postgresql://postgres:5432`

**External Access:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Database: `localhost:5432` (for admin tools)

## Security Considerations

### Current Implementation
- CORS configured for frontend-backend communication
- Environment variables for sensitive data
- .gitignore prevents committing secrets
- PostgreSQL password-protected

### Production Recommendations
1. Use strong SECRET_KEY
2. Enable HTTPS with SSL certificates
3. Use production-grade database passwords
4. Implement JWT authentication
5. Add rate limiting
6. Enable database encryption
7. Use secrets management (e.g., Docker Secrets, Vault)
8. Add API key authentication for n8n webhooks

## Scalability

### Horizontal Scaling
- Frontend: Multiple Nginx instances behind load balancer
- Backend: Multiple FastAPI instances behind load balancer
- Database: PostgreSQL replication (master-slave)

### Vertical Scaling
- Increase container resources in docker-compose.yml
- Add resource limits and requests

## Monitoring & Logging

### Current Setup
- Docker logs via `docker compose logs`
- FastAPI auto-logging to stdout
- PostgreSQL logs to stdout

### Future Enhancements
- Add Prometheus for metrics
- Add Grafana for dashboards
- Add ELK stack for log aggregation
- Add health check endpoints
- Add performance monitoring

## Deployment

### Development
```bash
docker compose up --build
```

### Production
1. Update environment variables
2. Build production images
3. Use docker-compose.prod.yml
4. Deploy to cloud provider (AWS, GCP, Azure)
5. Set up CI/CD pipeline

## File Structure

```
MIB-2025-Stokvel-/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Configuration, database
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── main.py      # FastAPI app
│   ├── Dockerfile       # Backend container config
│   └── requirements.txt # Python dependencies
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── App.js       # Main React component
│   ├── Dockerfile       # Frontend container config
│   ├── nginx.conf       # Nginx configuration
│   └── package.json     # Node dependencies
└── docker-compose.yml   # Orchestration config
```
