# 🚀 NestJS Starter Template

A production-ready NestJS starter template with authentication, Prisma ORM, and best practices built-in. Clone this repo to kickstart any new project without repetitive setup.

## ✨ Features

- **Authentication System** - Complete JWT-based auth for Users and Super Admins
- **Prisma ORM** - Type-safe database access with MySQL/MariaDB
- **Modular Architecture** - Clean separation of concerns with core services
- **Swagger Documentation** - Auto-generated API docs with authentication
- **Security** - Password hashing with bcrypt, JWT tokens, session management
- **TypeScript** - Full type safety throughout the codebase
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks for pre-commit checks

## 📁 Project Structure

```
src/
├── core/                    # Core business logic services
│   ├── base-query-core/     # Base query builder with pagination
│   ├── user-core/           # User CRUD operations
│   ├── user-credential-core/# User password management
│   ├── user-session-core/   # User session management
│   ├── super-admin-core/    # Super admin CRUD operations
│   ├── super-admin-credential-core/
│   └── super-admin-session-core/
├── modules/                 # Feature modules
│   ├── user/               # User module with auth
│   │   └── auth/           # User authentication
│   └── super-admin/        # Super admin module with auth
│       └── auth/           # Super admin authentication
├── shared/                  # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── keys/               # Constants and messages
│   ├── libs/               # Helper libraries
│   ├── modules/            # Shared modules (Prisma, Common)
│   └── types/              # TypeScript types
├── app.module.ts           # Root module
├── main.ts                 # Application entry point
└── swagger-setup.ts        # Swagger configuration
```

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url> my-new-project
cd my-new-project
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# JWT Secrets
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# JWT Expiration
JWT_ACCESS_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Swagger
SWAGGER_PASSWORD="admin123"

# Application
PORT=3000
NODE_ENV="development"
```

### 4. Setup Database

```bash
# Generate Prisma Client
yarn prisma:generate

# Push schema to database (development)
yarn prisma:push

# Or create migration (production)
yarn prisma:migrate --name init
```

### 5. Start Development Server

```bash
yarn start:dev
```

## 📚 API Documentation

Swagger UI available at: `http://localhost:3000/api`

- **Username:** `admin`
- **Password:** (from `SWAGGER_PASSWORD` in `.env`)

## 🔐 Authentication Endpoints

### User Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/auth/register` | Register new user |
| POST | `/user/auth/login` | Login user |
| POST | `/user/auth/logout` | Logout user |
| POST | `/user/auth/refresh-token` | Refresh access token |
| POST | `/user/auth/profile` | Get user profile |

### Super Admin Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/super-admin/auth/register` | Register super admin |
| POST | `/super-admin/auth/login` | Login super admin |
| POST | `/super-admin/auth/logout` | Logout super admin |
| POST | `/super-admin/auth/refresh-token` | Refresh access token |
| POST | `/super-admin/auth/profile` | Get super admin profile |

## 📜 Available Scripts

```bash
# Development
yarn start:dev      # Start with hot-reload

# Production
yarn build          # Build the project
yarn start:prod     # Start production server

# Database
yarn prisma:generate  # Generate Prisma Client
yarn prisma:push      # Push schema to DB
yarn prisma:migrate   # Run migrations
yarn prisma:studio    # Open Prisma Studio

# Code Quality
yarn lint           # Run ESLint
yarn format         # Format with Prettier
yarn type-check     # TypeScript type checking

# Testing
yarn test           # Run unit tests
yarn test:e2e       # Run e2e tests
yarn test:cov       # Test coverage
```

## 🗄️ Database Schema

The starter includes these models:

- **User** - Basic user with email, phone, status
- **UserCredential** - Encrypted password storage
- **UserSession** - Session tracking with IP, user agent, geo
- **SuperAdmin** - Admin user management
- **SuperAdminCredential** - Admin password storage
- **SuperAdminSession** - Admin session tracking

## 🔧 Customization

### Adding a New Module

1. Create core service in `src/core/`
2. Create module in `src/modules/`
3. Add to Prisma schema
4. Run `yarn prisma:generate`

### Adding New Auth Type

1. Copy `src/modules/user/auth/` structure
2. Create new JWT strategy
3. Create new guard
4. Update `TOKEN_USER_TYPE` enum

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT access & refresh tokens
- ✅ Separate credential tables
- ✅ Session tracking with geo-location
- ✅ Rate limiting with Throttler
- ✅ Swagger protected with basic auth

## 📦 Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript 5.9
- **ORM:** Prisma 7 (with MariaDB adapter)
- **Database:** MySQL/MariaDB
- **Auth:** Passport + JWT
- **Docs:** Swagger/OpenAPI
- **Validation:** class-validator
- **Concurrency:** p-limit (latest ESM version)

## ⚡ Prisma 7 Setup

This starter uses **Prisma 7** with the new adapter pattern for better performance and compatibility:

```typescript
// src/shared/modules/prisma/prisma.service.ts
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  public prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
```

### Prisma 7 Key Features Used:
- Uses the Prisma MariaDB driver adapter
- Reads Prisma CLI datasource config from `prisma.config.ts`
- Type-safe queries with full TypeScript support
- Explicit disconnect on NestJS module shutdown

## 🔄 ESM Package Handling (p-limit)

The starter handles ESM-only packages like `p-limit` (v7+) using dynamic imports:

```typescript
// src/shared/modules/prisma/safe-prisma-call.ts
let prismaConcurrencyLimit: <T>(fn: () => Promise<T>) => Promise<T>;

const initPLimit = (async () => {
  const pLimit = (await import('p-limit')).default;
  prismaConcurrencyLimit = pLimit(concurrencyLimit);
})();

export async function safePrismaCall<T>(fn: () => Promise<T>): Promise<T> {
  await initPLimit;
  return prismaConcurrencyLimit(fn);
}
```

This pattern allows using the latest ESM-only packages in a CommonJS NestJS environment.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is [MIT licensed](LICENSE).
