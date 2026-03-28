<p align="center">
  <img src="apps/web/public/logo.svg" alt="EcoSwachh Logo" width="280" />
</p>

<h1 align="center">EcoSwachh — Smart Waste Management Platform</h1>

<p align="center">
  <strong>An AI-powered, full-stack waste management and sustainability platform built for communities, municipalities, and individuals committed to a cleaner tomorrow.</strong>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma" />
  <img alt="tRPC" src="https://img.shields.io/badge/tRPC-11-398ccb?logo=trpc" />
  <img alt="Ethereum" src="https://img.shields.io/badge/Ethereum-Sepolia-627eea?logo=ethereum" />
  <img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-2.8-ef4444?logo=turborepo" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

## 🌍 Overview

**EcoSwachh** is a production-grade, AI-integrated waste management platform built as a Turborepo monorepo. It provides a user-facing web app for waste reporting, environmental intelligence, and community engagement, alongside an admin portal for report management, complaint resolution, and user moderation.

The platform leverages **GPT-5 Mini** for AI-powered spam detection and waste classification, **Inngest** for asynchronous background job processing, **Mapbox GL** for 3D geospatial visualization, **Upstash Redis** for intelligent caching, and **Web3 wallet integration** (wagmi v3 + ethers.js) for on-chain ERC-20 EcoToken minting on the Ethereum Sepolia testnet — all orchestrated through a type-safe **tRPC** API layer.

---

## ✨ Features

### 🧑‍💻 User Application (`apps/web` — Port 5173)

| Feature | Description |
|---|---|
| **📊 Dashboard** | Real-time stats — total reports, waste weight, points earned, CO₂ offset — fetched via tRPC with SSR prefetching |
| **🗑️ Waste Reporting** | Submit reports with image uploads (ImageKit), GPS/manual location, and AI processing pipeline |
| **🤖 AI Analysis** | Automated spam detection + waste classification (type, weight, priority, disposal instructions) via GPT-5 Mini |
| **🗺️ Geospatial Mapping** | Interactive 3D Mapbox GL maps with direction routing for report locations |
| **🌱 Carbon Heatmap** | Real-time carbon emission intensity heatmap across Indian grid zones via Electricity Maps API |
| **📰 News Feed** | AI-curated sustainability news via Firecrawl web scraping with GPT-powered daily summaries |
| **📈 Green Stocks** | Live sustainability stock tracker (10 green energy companies) via Finnhub API |
| **🏆 Leaderboard** | Community points leaderboard ranked by contributions with paginated data tables |
| **📝 Complaints** | Submit and track complaints with status management (Pending/Resolved) |
| **🔗 Web3 Wallet** | MetaMask wallet connection via wagmi v3 with automatic address persistence to database |
| **🪙 EcoToken Minting** | Automatic ERC-20 token minting on Ethereum Sepolia when reports are resolved (Inngest background job) |
| **🔐 Authentication** | Email/password auth via Better Auth with role-based access control (user/admin) |
| **🎨 Theming** | Dark/light mode with `next-themes` and a custom Shadcn UI design system |

### 🛡️ Admin Portal (`apps/admin` — Port 5174)

| Feature | Description |
|---|---|
| **📋 Report Management** | View all user reports across the platform with filters (status, priority) |
| **✅ Report Resolution** | Resolve reports with comments, awarding 20 points to the reporting user |
| **📨 Complaint Resolution** | View, resolve, or soft-delete community complaints with admin comments |
| **👥 User Management** | List all users, ban/unban with reasons via Better Auth admin plugin |
| **🔐 Admin Auth** | Separate auth context with admin role enforcement on all procedures |

---

## 🏗️ Tech Stack

### Core Framework

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.1.6 | React framework with App Router, Turbopack, SSR/SSG |
| [React](https://react.dev/) | 19.2 | UI library with Server Components & Suspense |
| [TypeScript](https://typescriptlang.org/) | 5.9 | Static type safety across the entire codebase |
| [Turborepo](https://turbo.build/) | 2.8 | Monorepo build orchestration & caching |
| [pnpm](https://pnpm.io/) | 9.15 | Fast, disk-efficient package manager with workspaces |

### Backend & Data

| Technology | Purpose |
|---|---|
| [tRPC](https://trpc.io/) v11 | End-to-end type-safe API layer with React Query integration |
| [Prisma](https://prisma.io/) v7 | Type-safe ORM with PostgreSQL adapter |
| [PostgreSQL](https://postgresql.org/) | Primary relational database |
| [Upstash Redis](https://upstash.com/) | Serverless caching for API responses (news, carbon, stocks) |
| [Better Auth](https://better-auth.com/) | Authentication framework with admin plugin & role management |
| [Inngest](https://inngest.com/) | Durable function execution for async AI processing pipelines |

### AI & Intelligence

| Technology | Purpose |
|---|---|
| [OpenAI GPT-5 Mini](https://openai.com/) | Spam detection, waste analysis, news summarization |
| [Vercel AI SDK](https://sdk.vercel.ai/) | Unified API for structured AI object generation |
| [Firecrawl](https://firecrawl.dev/) | Web scraping API for sustainability news aggregation |
| [Electricity Maps API](https://electricitymap.org/) | Real-time carbon intensity data for Indian grid zones |
| [Finnhub API](https://finnhub.io/) | Live stock market data for green energy companies |

### Web3 & Blockchain

| Technology | Purpose |
|---|---|
| [wagmi](https://wagmi.sh/) v3 | React hooks for Ethereum wallet connection |
| [ethers.js](https://docs.ethers.org/) v6 | Ethereum library for smart contract interaction & token minting |
| [MetaMask](https://metamask.io/) | Primary wallet connector (injected + MetaMask providers) |
| [Ethereum Sepolia](https://sepolia.dev/) | Testnet for ERC-20 EcoToken contract deployment |

### Frontend & UI

| Technology | Purpose |
|---|---|
| [Shadcn/UI](https://ui.shadcn.com/) | Headless component library (Radix UI primitives) |
| [Tailwind CSS](https://tailwindcss.com/) v4 | Utility-first CSS framework |
| [Mapbox GL JS](https://mapbox.com/) | Interactive 3D maps & directions |
| [TanStack React Table](https://tanstack.com/table/) | Headless data table with sorting, pagination, filtering |
| [TanStack React Query](https://tanstack.com/query/) | Server state management & caching |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form management with schema validation |
| [Phosphor Icons](https://phosphoricons.com/) / [React Icons](https://react-icons.github.io/) | Icon systems |
| [nuqs](https://nuqs.47ng.com/) | Type-safe URL search parameter state management |
| [Sonner](https://sonner.emilkowal.dev/) | Toast notification system |

---

## 📁 Project Structure

```
waste-management-app/
├── apps/
│   ├── web/                          # User-facing Next.js application (port 5173)
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (routes)/             # Authenticated route group
│   │   │   │   ├── _components/      # Route-scoped UI components
│   │   │   │   ├── complaint/        # Complaints page
│   │   │   │   ├── my-reports/       # User reports list + detail ([id])
│   │   │   │   ├── news-feed/        # AI-curated news page
│   │   │   │   ├── layout.tsx        # Auth guard + sidebar layout
│   │   │   │   └── page.tsx          # Dashboard (stats + leaderboard)
│   │   │   ├── api/                  # API route handlers
│   │   │   │   ├── auth/             # Better Auth endpoint
│   │   │   │   ├── inngest/          # Inngest webhook handler
│   │   │   │   ├── trpc/             # tRPC HTTP handler
│   │   │   │   └── upload-auth/      # ImageKit upload auth
│   │   │   ├── auth/                 # Public auth pages (login/signup)
│   │   │   └── layout.tsx            # Root layout (fonts, providers)
│   │   ├── components/               # Shared app components
│   │   │   └── shared/               # Sidebar, Navbar
│   │   ├── dal/                      # Data Access Layer (tRPC)
│   │   │   ├── routers/_app.ts       # Root router composition
│   │   │   ├── client.tsx            # tRPC React client provider
│   │   │   ├── server.tsx            # tRPC server-side caller
│   │   │   ├── init.ts              # tRPC initialization & middleware
│   │   │   └── query-client.ts       # TanStack Query client factory
│   │   ├── features/                 # Feature modules (vertical slices)
│   │   │   ├── auth/                 # Auth hooks & UI
│   │   │   ├── carbon/               # Carbon heatmap (server + UI)
│   │   │   ├── complaint/            # Complaints (server + UI)
│   │   │   ├── dashboard/            # Dashboard stats (server + UI)
│   │   │   ├── leaderboard/          # Leaderboard (server + UI)
│   │   │   ├── news/                 # News feed + AI summary (server + UI + prompts)
│   │   │   ├── report/               # Waste reports (server + UI + prompts)
│   │   │   ├── stocks/               # Green stocks (server + UI)
│   │   │   └── wallet/               # Web3 wallet connection (server + UI)
│   │   ├── hooks/                    # Global React hooks
│   │   ├── jobs/                     # Inngest background jobs
│   │   │   ├── client.ts             # Inngest client instance
│   │   │   ├── process-report.ts     # AI report processing pipeline
│   │   │   └── mint-tokens.ts        # ERC-20 EcoToken minting pipeline
│   │   ├── lib/                      # Shared utilities
│   │   │   ├── auth.ts               # Better Auth server config
│   │   │   ├── auth-client.ts        # Better Auth client instance
│   │   │   ├── firecrawl.ts          # Firecrawl API client
│   │   │   ├── redis.ts              # Upstash Redis client
│   │   │   ├── wagmi.ts              # wagmi config (Sepolia chain + connectors)
│   │   │   └── wagmi-provider.tsx     # WagmiProvider + QueryClientProvider
│   │   └── public/                   # Static assets (logo, icons, metamask.svg)
│   │
│   └── admin/                        # Admin portal Next.js application (port 5174)
│       ├── app/                      # Next.js App Router (same structure as web)
│       │   ├── (routes)/             # Authenticated admin routes
│       │   │   ├── complaint/        # Complaint management
│       │   │   ├── manage-users/     # User moderation
│       │   │   ├── reports/          # Report management + detail ([id])
│       │   │   ├── layout.tsx        # Admin auth guard + sidebar
│       │   │   └── page.tsx          # Admin dashboard (all reports)
│       │   ├── api/                  # API routes (auth, trpc)
│       │   └── auth/                 # Admin login/signup
│       ├── components/               # Shared admin components
│       ├── dal/                      # Admin tRPC layer
│       ├── features/                 # Admin feature modules
│       │   ├── auth/                 # Admin auth hooks
│       │   ├── complaint/            # Complaint resolution procedures
│       │   ├── report/               # Report resolution procedures
│       │   └── users/                # User ban/unban procedures
│       └── lib/                      # Admin auth config
│
├── packages/
│   ├── database/                     # @workspace/db — Shared database package
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema (8 models, 3 enums)
│   │   │   └── migrations/           # Migration history
│   │   ├── src/index.ts              # Prisma client re-export
│   │   └── prisma.config.ts          # Prisma configuration
│   ├── ui/                           # @workspace/ui — Shared component library
│   │   └── src/
│   │       ├── components/           # 19 Shadcn/UI components
│   │       ├── hooks/                # Shared React hooks
│   │       ├── lib/                  # Utilities (cn, etc.)
│   │       └── styles/               # Global CSS with design tokens
│   ├── eslint-config/                # @workspace/eslint-config
│   │   ├── base.js                   # Base ESLint rules
│   │   ├── next.js                   # Next.js-specific rules
│   │   └── react-internal.js         # React library rules
│   └── typescript-config/            # @workspace/typescript-config
│       ├── base.json                 # Base TypeScript config
│       ├── nextjs.json               # Next.js TypeScript config
│       └── react-library.json        # React library config
│
├── docs/                             # Project documentation
├── turbo.json                        # Turborepo pipeline configuration
├── pnpm-workspace.yaml               # pnpm workspace definition
├── package.json                      # Root package with workspace scripts
└── tsconfig.json                     # Root TypeScript config
```

> 📖 **Full documentation** is available in the [`docs/`](./docs/) directory.

---

## 🗄️ Database Schema

The application uses **PostgreSQL** managed through **Prisma ORM** with 8 models and 3 enums. The `User` model includes an optional `walletAddress` field for Web3 wallet integration:

### Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ ComplaintComment : "has comments"
    User ||--o{ Report : "has reports"
    User ||--o{ SpamReport : "reports spam"
    User ||--o{ ResolvedReport : "resolves reports"
    Complaint ||--o{ ComplaintComment : "has comments"
    Report ||--o{ SpamReport : "has spam record"
    Report ||--o{ ResolvedReport : "has resolution"

    User {
        String id PK
        String name
        String email UK
        Boolean emailVerified
        String image
        Int points
        String role
        Boolean banned
        String banReason
        DateTime banExpires
        String walletAddress "optional Ethereum address"
        DateTime createdAt
        DateTime updatedAt
    }

    Session {
        String id PK
        DateTime expiresAt
        String token UK
        String ipAddress
        String userAgent
        String userId FK
        String impersonatedBy
    }

    Account {
        String id PK
        String accountId
        String providerId
        String userId FK
        String accessToken
        String refreshToken
        String password
        DateTime createdAt
    }

    Verification {
        String id PK
        String identifier
        String value
        DateTime expiresAt
    }

    Complaint {
        String id PK
        String userId FK
        String title
        String description
        String status
        Boolean deletedForAdmin
        DateTime resolvedAt
        DateTime createdAt
    }

    ComplaintComment {
        String id PK
        String complaintId FK
        String adminId FK
        String comment
        DateTime createdAt
    }

    Report {
        String id PK
        String imageUrl
        String userDescription
        String aiTitle
        String aiDescription
        String wasteType
        String wasteDetails
        Float estimatedWeight
        String disposalInstructions
        String warnings
        String priority
        String status
        Float latitude
        Float longitude
        String manualLocation
        String userId FK
    }

    SpamReport {
        String id PK
        String spamReason
        String reportId FK
        String userId FK
    }

    ResolvedReport {
        String id PK
        String comment
        String reportId FK
        String userId FK
    }
```

### Data Enums

| Enum | Values | Description |
|---|---|---|
| `ComplaintStatus` | `PENDING`, `RESOLVED` | Complaint lifecycle states |
| `ReportPriority` | `LOW`, `MEDIUM`, `HIGH` | AI-assigned waste report priority |
| `ReportStatus` | `PROCESSING`, `SPAM`, `PENDING`, `RESOLVED` | Report processing pipeline states |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** 9.15+
- **PostgreSQL** database
- **Upstash Redis** instance
- **MetaMask** browser extension (for Web3 wallet features)
- API keys for: OpenAI, Mapbox, ImageKit, Firecrawl, Electricity Maps, Finnhub
- Sepolia testnet RPC URL and an ERC-20 token contract (for Web3 minting)

### 1. Clone & Install

```bash
git clone https://github.com/nilavtalukdar06/waste-management-app.git
cd waste-management-app
pnpm install
```

### 2. Environment Variables

Create `.env` files in the required locations:

**`packages/database/.env`**
```env
DATABASE_URL="postgresql://user:password@host:5432/ecoswachh"
```

**`apps/web/.env`**
```env
# Auth
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:5173"

# Database
DATABASE_URL="postgresql://user:password@host:5432/ecoswachh"

# Redis
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# AI
OPENAI_API_KEY="sk-..."

# Maps
MAPBOX_PUBLIC_TOKEN="pk...."

# Image Upload
IMAGEKIT_PUBLIC_KEY="your-key"
IMAGEKIT_PRIVATE_KEY="your-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"

# News
FIRECRAWL_API_URL="https://api.firecrawl.dev/v1/search"
FIRECRAWL_API_KEY="fc-..."

# Carbon
EM_API_KEY="your-electricity-maps-key"

# Stocks
FINNHUB_API_KEY="your-finnhub-key"

# Inngest
INNGEST_EVENT_KEY="your-key"
INNGEST_SIGNING_KEY="your-key"

# Web3 (Wallet & Token Minting)
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/your-infura-key"
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/your-infura-key"
MINTER_PRIVATE_KEY="0x...your-minter-wallet-private-key"
ECO_TOKEN_CONTRACT="0x...your-deployed-erc20-contract-address"
```

**`apps/admin/.env`**
```env
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:5174"
DATABASE_URL="postgresql://user:password@host:5432/ecoswachh"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm --filter @workspace/db db:generate

# Run migrations
pnpm --filter @workspace/db db:migrate
```

### 4. Development

```bash
# Start all apps in development mode (Turbopack)
pnpm dev
```

This starts:
- **Web app** → [http://localhost:5173](http://localhost:5173)
- **Admin portal** → [http://localhost:5174](http://localhost:5174)

### 5. Production Build

```bash
pnpm build
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode with Turbopack |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Run ESLint across the entire monorepo |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm --filter @workspace/db db:generate` | Generate Prisma client |
| `pnpm --filter @workspace/db db:migrate` | Run database migrations |
| `pnpm --filter @workspace/db db:deploy` | Deploy migrations to production |

---

## 🔄 Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB["Web App<br/>(Next.js 16 — Port 5173)"]
        ADMIN["Admin Portal<br/>(Next.js 16 — Port 5174)"]
        METAMASK["MetaMask<br/>(wagmi v3)"]
    end

    subgraph "API Layer"
        TRPC1["tRPC Router<br/>(9 sub-routers)"]
        TRPC2["tRPC Router<br/>(3 sub-routers)"]
        AUTH["Better Auth<br/>(Role-based)"]
    end

    subgraph "Processing Layer"
        INNGEST["Inngest<br/>(Durable Functions)"]
        AI["OpenAI GPT-5 Mini<br/>(Spam + Analysis)"]
        MINT["EcoToken Minter<br/>(ethers.js v6)"]
    end

    subgraph "Data Layer"
        PG["PostgreSQL<br/>(Prisma ORM)"]
        REDIS["Upstash Redis<br/>(Cache Layer)"]
    end

    subgraph "External APIs"
        MAPBOX["Mapbox GL"]
        IMAGEKIT["ImageKit"]
        FIRECRAWL["Firecrawl"]
        EMAP["Electricity Maps"]
        FINNHUB["Finnhub"]
    end

    subgraph "Blockchain"
        SEPOLIA["Ethereum Sepolia<br/>(ERC-20 EcoToken)"]
    end

    WEB --> TRPC1
    WEB --> AUTH
    WEB --> METAMASK
    ADMIN --> TRPC2
    ADMIN --> AUTH
    TRPC1 --> PG
    TRPC1 --> REDIS
    TRPC2 --> PG
    TRPC1 --> INNGEST
    INNGEST --> AI
    INNGEST --> PG
    INNGEST --> MINT
    MINT --> SEPOLIA
    WEB --> MAPBOX
    WEB --> IMAGEKIT
    TRPC1 --> FIRECRAWL
    TRPC1 --> EMAP
    TRPC1 --> FINNHUB
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push to branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with 💚 for a cleaner planet
</p>
