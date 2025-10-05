# Development Guide

## Getting Started

This guide will help you get started with development on the Stokvel application.

## Prerequisites

- Docker Desktop (includes docker and docker compose)
- Git
- A code editor (VS Code recommended)

## Initial Setup

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run `docker compose up --build`

## Development Workflow

### Making Changes

**Backend (Python/FastAPI):**
- Edit files in `backend/app/`
- Changes are hot-reloaded automatically
- View logs: `docker compose logs -f backend`

**Frontend (React/JavaScript):**
- Edit files in `frontend/src/`
- Changes are hot-reloaded automatically (during dev)
- View logs: `docker compose logs -f frontend`

### Running Commands

**Backend:**
```bash
# Access backend container
docker compose exec backend bash

# Install new Python package
docker compose exec backend pip install <package-name>
# Then add to requirements.txt

# Run Python shell
docker compose exec backend python

# Create database migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker compose exec backend alembic upgrade head
```

**Frontend:**
```bash
# Access frontend container (build stage)
docker compose run --rm frontend sh

# Install new npm package (after adding to package.json)
docker compose run --rm frontend npm install
```

**Database:**
```bash
# Access PostgreSQL
docker compose exec postgres psql -U stokvel_user -d stokvel_db

# Common SQL commands:
# \dt - list tables
# \d tablename - describe table
# SELECT * FROM users; - query table
# \q - quit
```

## Testing

### Backend Tests
```bash
# Run pytest (when tests are added)
docker compose exec backend pytest

# Run with coverage
docker compose exec backend pytest --cov=app
```

### Frontend Tests
```bash
# Run Jest tests (when tests are added)
docker compose exec frontend npm test
```

## Building for Production

For production deployment:

1. Update environment variables in `.env`
2. Set `ENVIRONMENT=production`
3. Use stronger `SECRET_KEY`
4. Build optimized images:
   ```bash
   docker compose -f docker-compose.yml build --no-cache
   ```

## Common Issues

### Port Already in Use
If ports 3000, 8000, or 5432 are already in use:
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Rebuilding from Scratch
```bash
# Stop and remove all containers, networks, and volumes
docker compose down -v

# Rebuild and start
docker compose up --build
```

### Database Issues
```bash
# Reset database
docker compose down -v
docker compose up -d postgres
# Wait for database to initialize
docker compose up backend frontend
```

## Code Style

**Python:**
- Follow PEP 8
- Use type hints
- Document functions with docstrings

**JavaScript:**
- Use ES6+ features
- Use functional components with hooks
- Follow React best practices

## API Development

### Adding a New Endpoint

1. Create schema in `backend/app/schemas/`
2. Create model in `backend/app/models/` (if needed)
3. Create endpoint in `backend/app/api/v1/endpoints/`
4. Register endpoint in `backend/app/api/v1/api.py`
5. Test at http://localhost:8000/docs

Example:
```python
# backend/app/api/v1/endpoints/example.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()

@router.get("/items")
async def get_items(db: Session = Depends(get_db)):
    return {"items": []}
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request
5. Wait for review

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
