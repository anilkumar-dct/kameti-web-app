# Kameti Web Application

A robust and scalable backend service built with **NestJS**, designed for managing Kameti transactions and user registrations.

[![NestJS](https://img.shields.io/badge/framework-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-UNLICENSED-blue.svg)](LICENSE)

---

## 🚀 Overview

The Kameti Web App provides a secure API for managing users, roles, and kameti memberships. It features a custom exception handling system, cookie-based JWT authentication, and a fully containerized development environment.

### Key Features

- **Authentication**: Secure Login/Signup with JWT stored in `httpOnly` cookies.
- **Authorization**: Role-based Access Control (RBAC) with custom decorators and guards.
- **Error Handling**: Standardized API responses with a specialized Mongoose exception filter.
- **Code Quality**: Enforced via ESLint, Prettier, and Husky pre-commit hooks.
- **Environment**: Multi-stage Docker builds for development and production.

---

## 🛠 Getting Started

### Prerequisites

| Tool        | Version |
| :---------- | :------ |
| **Node.js** | >= 20.x |
| **pnpm**    | >= 8.x  |
| **Docker**  | Latest  |

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd kameti-web-app
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.development` or `.env.production` file in the root directory based on the `.env.example` (if provided) or following the project's config requirements.

---

## 📡 Running the Project

### Local Development

```bash
# Watch mode (automatically restarts on changes)
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

### Docker (Recommended)

The easiest way to run the project and its dependencies (MongoDB) is via Docker Compose:

```bash
# Build and start all services
$ docker-compose up --build
```

---

## 🧪 Testing & Quality

Manage code quality and run tests using these commands:

```bash
# Linting (with automatic fixes)
$ pnpm run lint

# Formatting
$ pnpm run format

# Run Unit Tests
$ pnpm run test

# Run E2E Tests
$ pnpm run test:e2e
```

---

## 📘 Documentation

For a deeper dive into the technical design, authentication flow, and project structure, please refer to the **[Architecture Guide](ARCHITECTURE.md)**.

### API Endpoints (Brief Overview)

- **Auth**: `POST /auth/signup`, `POST /auth/login`
- **Users**: `POST /user/create`, `GET /user`, `PATCH /user/update`, `GET /user/:id`

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`).
2. Ensure your changes pass the linter and tests.
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is **UNLICENSED**. See the [package.json](package.json) for more details.
