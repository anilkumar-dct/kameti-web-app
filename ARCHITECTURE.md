# Architecture Guide

This document provides a technical overview of the Kameti Web App architecture, designed for developers who are new to the project or looking to understand its core systems.

## 🏗 System Overview

The Kameti Web App is a backend service built with **NestJS**, a progressive Node.js framework. It follows a modular architecture to ensure scalability, maintainability, and clear separation of concerns.

### Core Technology Stack

- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens) with Passport.js
- **Validation**: class-validator & class-transformer
- **Containerization**: Docker & Docker Compose
- **Code Quality**: ESLint, Prettier, Husky (pre-commit hooks)

---

## 📂 Project Structure

The project follows the standard NestJS structure with business logic encapsulated in modules.

```text
src/
├── common/              # Shared logic, guards, filters, entities, and enums
│   ├── decorators/      # Custom decorators (e.g., @Roles)
│   ├── dto/             # Shared Data Transfer Objects
│   ├── entities/        # Mongoose Schema definitions
│   ├── enums/           # Global Enums (UserRole, ApiStatus)
│   ├── filters/         # Global Exception Filters
│   ├── guards/          # Auth and Role guards
│   ├── response/        # Standardized API response structure
│   └── utils/           # Helper utilities (e.g., Exception Explainer)
├── config/              # Configuration management using ConfigService
├── database/            # Database connection and module setup
├── modules/             # Feature-specific modules
│   ├── auth/            # JWT Strategy, Token Generation, Login/Signup
│   └── users/           # User CRUD logic and profile management
└── main.ts              # Entry point of the application
```

---

## 🔐 Authentication & Authorization

### JWT Implementation

We use a **Cookie-based JWT strategy**. Tokens are generated upon login/signup and stored in a secure, `httpOnly` cookie.

- **Service**: `AuthTokenGenerateService` handles token creation and cookie storage.
- **Strategy**: `JwtStrategy` (Passport) extracts the token from cookies and validates it.

### Access Control

Authorization is managed using a combination of Guards and Decorators:

1. **JwtAuthGuard**: Protects routes requiring a valid JWT.
2. **RolesGuard**: Checks the user's role against the required roles for a route.
3. **@Roles() Decorator**: Used on controller methods to specify access levels (e.g., `UserRole.ADMIN`).

---

## 💾 Database Layer

Data persistence is handled by **Mongoose**.

- **User Entity**: Defined in `src/common/entities/user.entity.ts`.
- **Hooks**: Password hashing is performed in the service layer using `bcrypt` before persistence.
- **Versioning**: We use standard Mongoose timestamps (`createdAt`, `updatedAt`).

---

## 🚨 Error Handling System

The project features a standardized error handling system to provide consistent and helpful API responses.

### Mongoose Exception Filter

A global `MongooseExceptionFilter` catches database-specific errors:

- **CastError**: Triggers when invalid IDs are passed.
- **ValidationError**: Triggers when schema validation fails.
- **DuplicateKey (11000)**: Triggers on unique constraint violations.

### Exception Explainer

The `MongooseExceptionExplainer` utility parses raw Mongoose errors into human-readable messages, shielding the client from technical stack traces while providing enough detail for debugging.

---

## 🚀 Development Workflow

### Code Quality Guards

- **Husky**: Runs `pnpm run lint` and `pnpm run lint --fix` during every commit.
- **ESLint**: Enforces strict typing and code style.
- **Prettier**: Handles automatic formatting.

### Docker Infrastructure

The project is fully containerized.

- **Dockerfile**: Optimized multi-stage build.
- **Ignore Scripts**: We use `--ignore-scripts` in production stages to prevent `husky` from failing when `devDependencies` are absent.
- **Environment**: Managed via `.env.development` and Docker Compose environment variables.
