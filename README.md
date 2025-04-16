# Golang Tesseract OCR Service

A lightweight OCR (Optical Character Recognition) service built with Golang using Tesseract. This service is built for local development, supports JWT-based authentication, and comes with built-in Swagger documentation.

## Features

- ⚡️ Built with [Gin](https://github.com/gin-gonic/gin) for high-performance HTTP handling
- 🔁 Live reloads during development via [Air](https://github.com/cosmtrek/air)
- 🔍 OCR powered by [Tesseract](https://github.com/tesseract-ocr/tesseract)
- 📘 Swagger UI for exploring and testing API routes
- 🐳 Docker-based setup with Postgres and Tesseract pre-installed
- 🧠 Database interactions using [GORM](https://gorm.io/)
- 🔐 JWT Authentication (Access & Refresh Tokens) using email/password
- 📀 OCR Result Caching using file content hashing

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Go](https://golang.org/) (for development outside container)
- [swag](https://github.com/swaggo/swag) CLI for updating Swagger docs

```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

### 🚀 Running the Project
1. Clone the repository
```bash
git clone https://github.com/jaysongiroux/tesseract-ocr-service.git
cd tesseract-ocr-service
```

2. Copy the example environment variables file
```bash
cp .env.example .env
```
3. Run the app
```bash
docker-compose up --build
```
This will spin up:
- The Go service (with live reload via Air) pre-installed Tesseract runtime
- Postgres database
- pgadmin

## 📚 Swagger Docs
Once running, the API documentation will be available at:

```bash
http://localhost:8080/swagger/index.html
```
If you make changes to your route annotations, regenerate the Swagger docs using:

```bash
swag init
```

## 🚀 Production Deployment

This project includes a production-ready Dockerfile for cloud deployment.

### Prerequisites
- Docker installed on your production server or cloud environment
- Access to a PostgreSQL database (either managed service or self-hosted)
- Proper network security configured for your production environment

### Deployment Steps

1. Clone the repository on your build server
```bash
git clone https://github.com/jaysongiroux/tesseract-ocr-service.**git**
cd tesseract-ocr-service
```

2. Build the Docker image
```bash
docker build -f Dockerfile.prod -t tesseract-ocr-service:latest .
```

1. Run the built docker image
```bash
docker run -d \
  --name tesseract-ocr-service \
  -p 8001:8001 \
  -e DATABASE_URL='postgres://admin:password1!@192.168.1.97:5432/ocrDB' \
  -e SECRET_KEY=your-secret-key \
  -e ENV=production \
  tesseract-ocr-service:latest
```

### Production Configuration

The production setup includes:
- Multi-stage Docker build for a smaller, optimized container
- Secure environment configuration through environment variables

### Continuous Deployment

This project includes a GitHub Actions workflow for continuous deployment to Digital Ocean:

1. Automatically builds the production Docker image
2. Pushes the image to Digital Ocean Container Registry
3. Deploys to either Digital Ocean App Platform or Kubernetes

For setup instructions, see the [deployment guide](deployment-guide.md).

## Technical Docs

### 🔐 Authentication
This service uses JWT authentication. You'll need to:

- Register/login using your email and password
- Include the Authorization header with your access token when calling protected endpoints
- Use the /auth/renew-token endpoint with a refresh token to obtain a new access token

For access to the OCR service you will need to create an organization then gnerate an API key to include in your POST request as `X-API-Key` header. 

Swagger will guide you through the available endpoints.

## 📄 License
MIT

## 🛠️ Future Plans
- Organization role-based access control
- Rate limiting / usage tracking
- Monitoring and alerting integration
- Horizontal scaling configuration for high-load scenarios
