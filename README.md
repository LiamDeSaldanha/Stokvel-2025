# MIB-2025-Stokvel-

A full-stack web application for Stokvel management built with React, Node.js, FastAPI, PostgreSQL, and Docker.

## 🏗️ Architecture

This application uses a modern microservices architecture with:

- **Frontend**: React 18 with Node.js, served via Nginx
- **Backend**: FastAPI with Pydantic for data validation
- **Database**: PostgreSQL 15
- **Containerization**: Docker and Docker Compose
- **Future Integration**: n8n workflow automation (prepared but commented)

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MIB-2025-Stokvel-
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration (optional, defaults are provided)

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Alternative API Documentation: http://localhost:8000/redoc

## 🛠️ Development

### Backend Development

The backend uses FastAPI with hot-reload enabled. Any changes to Python files will automatically restart the server.

```bash
# View backend logs
docker-compose logs -f backend

# Access backend container
docker-compose exec backend bash

# Run migrations (when implemented)
docker-compose exec backend alembic upgrade head
```

### Frontend Development

The frontend uses React with hot-reload during development.

```bash
# View frontend logs
docker-compose logs -f frontend

# Access frontend container
docker-compose exec frontend sh

# Install new packages (after adding to package.json)
docker-compose exec frontend npm install
```

### Database Management

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U stokvel_user -d stokvel_db

# View database logs
docker-compose logs -f postgres

# Backup database
docker-compose exec postgres pg_dump -U stokvel_user stokvel_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U stokvel_user stokvel_db < backup.sql
```

## 📁 Project Structure

```
MIB-2025-Stokvel-/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   └── health.py
│   │   │       └── api.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   └── user.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name
- `SECRET_KEY`: Backend secret key for security
- `REACT_APP_API_URL`: Backend API URL for frontend

### Adding Dependencies

**Backend (Python)**:
1. Add package to `backend/requirements.txt`
2. Rebuild: `docker-compose up --build backend`

**Frontend (Node.js)**:
1. Add package to `frontend/package.json`
2. Rebuild: `docker-compose up --build frontend`

## 🎯 API Endpoints

### Health Check
- `GET /`: Welcome message
- `GET /health`: Simple health check
- `GET /api/v1/health`: Detailed health check with database status

### Documentation
- `GET /docs`: Interactive API documentation (Swagger UI)
- `GET /redoc`: Alternative API documentation (ReDoc)

## 🔮 Future Enhancements

### n8n Integration

The docker-compose.yml includes a commented n8n service. To enable:

1. Uncomment the n8n service section in `docker-compose.yml`
2. Uncomment the n8n volume
3. Set n8n credentials in `.env`
4. Start services: `docker-compose up -d n8n`
5. Access n8n at: http://localhost:5678

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8000 is available
- Verify PostgreSQL is running: `docker-compose ps postgres`
- Check logs: `docker-compose logs backend`

### Frontend won't start
- Check if port 3000 is available
- Verify backend is running
- Check logs: `docker-compose logs frontend`

### Database connection issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database credentials in `.env`
- Wait for database to initialize (first run takes longer)

### Rebuilding from scratch
```bash
docker-compose down -v
docker-compose up --build
```

## 📝 License

[Your License Here]

## 👥 Contributors

[Your Team Here]