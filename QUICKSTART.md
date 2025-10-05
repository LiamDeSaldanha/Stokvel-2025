# Quick Start Commands

## Essential Commands

### Start Everything
```bash
docker compose up
```

### Start in Background
```bash
docker compose up -d
```

### Rebuild and Start
```bash
docker compose up --build
```

### Stop Everything
```bash
docker compose down
```

### Stop and Remove Volumes (Fresh Start)
```bash
docker compose down -v
```

### View Logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Follow logs (live)
docker compose logs -f backend
```

### Access Containers
```bash
# Backend shell
docker compose exec backend bash

# Frontend shell  
docker compose exec frontend sh

# Database
docker compose exec postgres psql -U stokvel_user -d stokvel_db
```

## URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## Quick Health Check

```bash
# Check if all services are running
docker compose ps

# Test backend API
curl http://localhost:8000/health

# Test detailed health check
curl http://localhost:8000/api/v1/health
```

## Development

### Install New Python Package
```bash
# Add to requirements.txt first, then:
docker compose up --build backend
```

### Install New Node Package
```bash
# Add to package.json first, then:
docker compose up --build frontend
```

### View Service Status
```bash
docker compose ps
```

## Troubleshooting

### Restart a Single Service
```bash
docker compose restart backend
```

### View Resource Usage
```bash
docker stats
```

### Remove All Containers and Start Fresh
```bash
docker compose down -v
docker compose up --build
```
