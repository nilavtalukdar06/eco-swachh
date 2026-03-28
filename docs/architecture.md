# 🏛️ Architecture Overview

EcoSwachh follows a **monorepo-first, feature-sliced** architecture built on top of Turborepo. The system is split into two independent Next.js applications (user-facing web app and admin portal) that consume shared internal packages for database access, UI components, and tooling configuration.

---

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        direction LR
        WEB["🌐 Web App<br/>(Next.js 16 — Port 5173)"]
        ADMIN["🛡️ Admin Portal<br/>(Next.js 16 — Port 5174)"]
    end

    subgraph "API Gateway"
        direction LR
        TRPC_WEB["tRPC Router<br/>(Web — 9 routers)"]
        TRPC_ADMIN["tRPC Router<br/>(Admin — 3 routers)"]
        BA["Better Auth<br/>(RBAC)"]
    end

    subgraph "Background Processing"
        INNGEST_ENGINE["Inngest Engine"]
        SPAM_CHECK["Step 1: Spam Check<br/>(GPT-5 Mini)"]
        WASTE_ANALYSIS["Step 2: Waste Analysis<br/>(GPT-5 Mini)"]
        DB_UPDATE["Step 3: DB Update"]
    end

    subgraph "Caching Layer"
        REDIS["Upstash Redis"]
        NEWS_CACHE["news:daily<br/>(TTL: 24h)"]
        CARBON_CACHE["carbon:intensity<br/>(TTL: 1h)"]
        STOCK_CACHE["stocks:quotes<br/>(TTL: 2min)"]
        SUMMARY_CACHE["summary:daily<br/>(TTL: 24h)"]
    end

    subgraph "Persistence Layer"
        PG["PostgreSQL"]
        PRISMA["Prisma ORM v7<br/>(Type-safe queries)"]
    end

    subgraph "External Services"
        OPENAI["OpenAI API"]
        MAPBOX["Mapbox GL"]
        IMAGEKIT["ImageKit CDN"]
        FIRECRAWL["Firecrawl API"]
        EMAP["Electricity Maps"]
        FINNHUB["Finnhub API"]
    end

    subgraph "Web3 Layer"
        WAGMI["wagmi v3<br/>(MetaMask + Injected)"]
        ETHERS["ethers.js v6<br/>(Signer + Contract)"]
        SEPOLIA["Ethereum Sepolia<br/>(ERC-20 EcoToken)"]
    end

    WEB --> TRPC_WEB
    WEB --> BA
    WEB --> MAPBOX
    WEB --> IMAGEKIT
    WEB --> WAGMI
    ADMIN --> TRPC_ADMIN
    ADMIN --> BA

    TRPC_WEB --> PRISMA
    TRPC_WEB --> REDIS
    TRPC_WEB --> INNGEST_ENGINE
    TRPC_WEB --> FIRECRAWL
    TRPC_WEB --> EMAP
    TRPC_WEB --> FINNHUB

    TRPC_ADMIN --> PRISMA

    INNGEST_ENGINE --> SPAM_CHECK
    SPAM_CHECK --> WASTE_ANALYSIS
    WASTE_ANALYSIS --> DB_UPDATE
    SPAM_CHECK --> OPENAI
    WASTE_ANALYSIS --> OPENAI
    DB_UPDATE --> PRISMA

    REDIS --> NEWS_CACHE
    REDIS --> CARBON_CACHE
    REDIS --> STOCK_CACHE
    REDIS --> SUMMARY_CACHE

    PRISMA --> PG

    INNGEST_ENGINE --> ETHERS
    ETHERS --> SEPOLIA
    WAGMI --> SEPOLIA
```

---

## Application Architecture Patterns

### 1. Feature-Sliced Design

Each feature is organized as a self-contained vertical slice under `features/`:

```
features/<feature-name>/
├── server/          # tRPC procedures (backend logic)
├── ui/              # React components (frontend)
├── hooks/           # Feature-specific React hooks
└── prompts/         # AI prompt templates (if applicable)
```

This ensures features are independently maintainable and testable. Each slice owns its server procedures, its UI components, and any AI prompts it needs.

### 2. Data Access Layer (DAL)

The DAL is located at `dal/` in each app and manages the tRPC stack:

```
dal/
├── init.ts           # tRPC initialization, context creation, middleware
├── routers/_app.ts   # Root router composing all feature routers
├── client.tsx        # TRPCReactProvider with React Query integration
├── server.tsx        # Server-side tRPC caller for SSR prefetching
└── query-client.ts   # TanStack Query client factory
```

**Key design decisions:**
- `createTRPCContext` uses `cache()` from React for request deduplication
- `protectedProcedure` middleware enforces authentication
- `superjson` transformer enables proper serialization of Dates, Maps, etc.

### 3. Server-Side Prefetching

Pages use a consistent prefetching pattern for optimal performance:

```tsx
// Server Component (page.tsx)
export default async function Page() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.feature.getData.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<ErrorComponent />}>
        <Suspense fallback={<LoadingComponent />}>
          <ClientComponent />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
}
```

### 4. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS as Next.js Server
    participant BetterAuth as Better Auth
    participant DB as PostgreSQL

    User->>Browser: Navigate to /
    Browser->>NextJS: GET /
    NextJS->>BetterAuth: getSession(headers)
    BetterAuth->>DB: Query session token
    DB-->>BetterAuth: Session data
    
    alt No Session
        BetterAuth-->>NextJS: null
        NextJS-->>Browser: redirect(/auth/login)
    else Valid Session
        BetterAuth-->>NextJS: { session, user }
        NextJS-->>Browser: Render dashboard
    end

    Note over User, DB: All (routes) layouts enforce auth guard
```

---

## Request-Response Flow

### tRPC Request Lifecycle

```mermaid
sequenceDiagram
    participant Client as React Component
    participant RQ as React Query
    participant TRPC as tRPC Client
    participant Handler as API Route<br/>(/api/trpc)
    participant Router as tRPC Router
    participant Middleware as Auth Middleware
    participant Procedure as Feature Procedure
    participant DB as Prisma/PostgreSQL

    Client->>RQ: useSuspenseQuery()
    RQ->>TRPC: Execute query
    TRPC->>Handler: HTTP POST /api/trpc/<procedure>
    Handler->>Router: Route to procedure
    Router->>Middleware: protectedProcedure
    Middleware->>Middleware: Validate session
    
    alt Unauthorized
        Middleware-->>Client: TRPCError(UNAUTHORIZED)
    else Authorized
        Middleware->>Procedure: Execute with ctx.user
        Procedure->>DB: Prisma query
        DB-->>Procedure: Data
        Procedure-->>Client: Typed response
    end
```

---

## Background Job Pipeline (Report Processing)

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Web App
    participant TRPC as tRPC Mutation
    participant DB as PostgreSQL
    participant Inngest as Inngest
    participant GPT as GPT-5 Mini

    User->>WebApp: Submit waste report
    WebApp->>TRPC: reports.submit()
    TRPC->>DB: Create report (status: PROCESSING)
    TRPC->>DB: Award 10 points to user
    TRPC->>Inngest: Send "report/submitted" event
    TRPC-->>User: { success, reportId }

    Note over Inngest: Async processing begins

    Inngest->>GPT: Step 1: Spam check (image + description)
    GPT-->>Inngest: { isSpam, reason }

    alt Is Spam
        Inngest->>DB: Update status → SPAM
        Inngest->>DB: Create SpamReport record
    else Not Spam
        Inngest->>GPT: Step 2: Waste analysis
        GPT-->>Inngest: { aiTitle, wasteType, priority, ... }
        Inngest->>DB: Update report with AI analysis
        Inngest->>DB: Set status → PENDING
    end
```

---

## Caching Strategy

| Cache Key | TTL | Source API | Invalidation |
|---|---|---|---|
| `news:daily` | 24 hours | Firecrawl | Time-based expiry |
| `summary:daily` | 24 hours | OpenAI (web search) | Time-based expiry |
| `carbon:intensity` | 1 hour | Electricity Maps | Time-based expiry |
| `stocks:quotes` | 2 minutes | Finnhub | Time-based expiry |

All caching is handled through **Upstash Redis** with a read-through caching pattern:
1. Check Redis for cached data
2. If hit → parse and return
3. If miss → fetch from external API → cache in Redis → return

---

## Security Architecture

| Layer | Mechanism |
|---|---|
| **Authentication** | Better Auth with secure HTTP-only session cookies |
| **Authorization** | tRPC middleware (`protectedProcedure`) validates session on every request |
| **Admin RBAC** | Admin procedures check `ctx.user.role === "admin"` |
| **Input Validation** | Zod schemas on all tRPC inputs |
| **CSRF Protection** | Cookie-prefix scoping (`web` vs `admin`) |
| **Spam Prevention** | AI-powered spam detection on report submissions |
| **User Moderation** | Admin can ban/unban users with reason tracking |

---

## Web3 Wallet Connection Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant MetaMask
    participant Wagmi as wagmi v3
    participant TRPC as tRPC API
    participant DB as PostgreSQL

    User->>Browser: Click "Connect Wallet"
    Browser->>Wagmi: connect({ connector: metaMask })
    Wagmi->>MetaMask: Request accounts
    MetaMask-->>User: Approve connection popup
    User->>MetaMask: Approve
    MetaMask-->>Wagmi: wallet address
    Wagmi-->>Browser: { address, isConnected: true }

    Note over Browser: Auto-save on connect
    Browser->>TRPC: wallet.saveWalletAddress({ walletAddress })
    TRPC->>DB: UPDATE user SET walletAddress
    DB-->>TRPC: Updated user
    TRPC-->>Browser: { success: true }

    Browser-->>User: Show truncated address + green indicator
```

## EcoToken Minting Pipeline

```mermaid
sequenceDiagram
    participant Inngest
    participant DB as PostgreSQL
    participant Ethers as ethers.js Signer
    participant Sepolia as Ethereum Sepolia
    participant Contract as ERC-20 EcoToken

    Note over Inngest: Triggered by "token/mint" event
    Inngest->>DB: Step 1: get-user-wallet
    DB-->>Inngest: { walletAddress }

    alt No Wallet Connected
        Inngest-->>Inngest: Return { skipped: true }
    else Wallet Available
        Inngest->>Ethers: Step 2: Create signer (MINTER_PRIVATE_KEY)
        Ethers->>Contract: mint(walletAddress, amount)
        Contract->>Sepolia: Execute transaction
        Sepolia-->>Contract: Transaction receipt
        Contract-->>Ethers: txHash
        Ethers-->>Inngest: { success: true, txHash }
    end
```
