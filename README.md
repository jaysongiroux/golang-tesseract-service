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
- Deployment support (likely via Docker)
- Role-based access control
- Rate limiting / usage tracking
