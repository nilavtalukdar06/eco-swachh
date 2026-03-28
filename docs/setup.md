# 🚀 Setup & Deployment Guide

Complete setup instructions for development and production environments.

---

## Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| **Node.js** | ≥ 20 | JavaScript runtime |
| **pnpm** | 9.15+ | Package manager with workspace support |
| **PostgreSQL** | 14+ | Primary database |
| **Git** | 2.x | Version control |

### External Service Accounts Required

| Service | Purpose | Free Tier? |
|---|---|---|
| [OpenAI](https://platform.openai.com/) | AI waste analysis & spam detection | Pay-per-use |
| [Upstash Redis](https://upstash.com/) | Serverless caching | ✅ Free tier (10k commands/day) |
| [Mapbox](https://mapbox.com/) | Interactive maps & directions | ✅ Free tier (50k loads/month) |
| [ImageKit](https://imagekit.io/) | Image upload & CDN | ✅ Free tier (20GB bandwidth) |
| [Firecrawl](https://firecrawl.dev/) | Web scraping for news | ✅ Free tier (500 credits) |
| [Electricity Maps](https://electricitymap.org/) | Carbon intensity data | ✅ Free tier (limited) |
| [Finnhub](https://finnhub.io/) | Stock market data | ✅ Free tier (60 calls/min) |
| [Inngest](https://inngest.com/) | Background job processing | ✅ Free tier (local dev free) |
| [Infura](https://infura.io/) / [Alchemy](https://alchemy.com/) | Ethereum Sepolia RPC provider | ✅ Free tier |
| [MetaMask](https://metamask.io/) | Ethereum wallet (browser extension) | ✅ Free |

---

## Step 1: Clone & Install

```bash
git clone https://github.com/nilavtalukdar06/waste-management-app.git
cd waste-management-app
pnpm install
```

---

## Step 2: Environment Variables

### `packages/database/.env`

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecoswachh?schema=public"
```

### `apps/web/.env`

```env
# ─── Authentication ──────────────────────────────────────────────
BETTER_AUTH_SECRET="generate-a-random-secret-string"
BETTER_AUTH_URL="http://localhost:5173"

# ─── Database ────────────────────────────────────────────────────
DATABASE_URL="postgresql://username:password@localhost:5432/ecoswachh?schema=public"

# ─── Upstash Redis ───────────────────────────────────────────────
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxxxxxxxxxxxx"

# ─── OpenAI ──────────────────────────────────────────────────────
OPENAI_API_KEY="sk-..."

# ─── Mapbox ──────────────────────────────────────────────────────
MAPBOX_PUBLIC_TOKEN="pk.eyJ1..."

# ─── ImageKit ────────────────────────────────────────────────────
IMAGEKIT_PUBLIC_KEY="public_xxxx"
IMAGEKIT_PRIVATE_KEY="private_xxxx"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"

# ─── Firecrawl ───────────────────────────────────────────────────
FIRECRAWL_API_URL="https://api.firecrawl.dev/v1/search"
FIRECRAWL_API_KEY="fc-..."

# ─── Electricity Maps ───────────────────────────────────────────
EM_API_KEY="your-electricity-maps-api-key"

# ─── Finnhub ────────────────────────────────────────────────────
FINNHUB_API_KEY="your-finnhub-api-key"

# ─── Inngest ────────────────────────────────────────────────────
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# ─── Web3 / Blockchain ───────────────────────────────────────────
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/your-project-id"
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/your-project-id"
MINTER_PRIVATE_KEY="0x...private-key-of-minter-wallet"
ECO_TOKEN_CONTRACT="0x...deployed-erc20-contract-address"
```

### `apps/admin/.env`

```env
# ─── Authentication ──────────────────────────────────────────────
BETTER_AUTH_SECRET="same-secret-as-web-app"
BETTER_AUTH_URL="http://localhost:5174"

# ─── Database ────────────────────────────────────────────────────
DATABASE_URL="postgresql://username:password@localhost:5432/ecoswachh?schema=public"
```

> ⚠️ **Important:** Both apps must use the **same `DATABASE_URL`** and the **same `BETTER_AUTH_SECRET`** to share the user base.

---

## Step 3: Database Setup

```bash
# Generate Prisma client from schema
pnpm --filter @workspace/db db:generate

# Create database tables (development migrations)
pnpm --filter @workspace/db db:migrate
```

### Creating an Admin User

After setting up the database and creating a regular user account through the web app:

1. Connect to your PostgreSQL database
2. Update the user's role to `admin`:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your-admin@email.com';
```

3. Log in to the admin portal at `http://localhost:5174` with those credentials

---

## Step 4: Run Development Servers

```bash
# Start all apps simultaneously with Turbopack
pnpm dev
```

This starts:
- **Web App:** [http://localhost:5173](http://localhost:5173)
- **Admin Portal:** [http://localhost:5174](http://localhost:5174)

### Running Individual Apps

```bash
# Web app only
pnpm --filter web dev

# Admin app only
pnpm --filter admin dev
```

### Running Inngest Dev Server (Optional)

For local background job testing:

```bash
npx inngest-cli@latest dev
```

This starts the Inngest dev server at `http://localhost:8288` where you can monitor background functions.

---

## Step 5: Production Build

```bash
# Build all packages and apps
pnpm build

# Deploy database migrations
pnpm --filter @workspace/db db:deploy
```

### Production Environment Variables

Update `BETTER_AUTH_URL` in both apps to point to your production domains:

```env
# apps/web/.env.production
BETTER_AUTH_URL="https://your-web-domain.com"

# apps/admin/.env.production
BETTER_AUTH_URL="https://your-admin-domain.com"
```

---

## Common Issues

### Prisma Client Not Generated

If you see errors about missing Prisma types:

```bash
pnpm --filter @workspace/db db:generate
```

### Database Connection Failed

Ensure PostgreSQL is running and the `DATABASE_URL` is correct. Test with:

```bash
psql "postgresql://username:password@localhost:5432/ecoswachh"
```

### Port Conflicts

The apps use ports 5173 (web) and 5174 (admin). If these are in use, modify the `dev` script in each app's `package.json`:

```json
"dev": "next dev --turbopack --port YOUR_PORT"
```

### Turbopack Cache Issues

Clear the Turbo cache if you encounter stale build artifacts:

```bash
pnpm turbo clean
pnpm dev
```

### MetaMask Not Connecting

Ensure the MetaMask browser extension is installed and unlocked. The app uses the Sepolia testnet — you may need to add Sepolia to MetaMask:

1. Open MetaMask → Settings → Networks → Add Network
2. Select "Sepolia" from the list of test networks
3. Switch to Sepolia in the network dropdown

### Token Minting Fails

If the `mint-eco-tokens` Inngest function fails:

1. Verify `MINTER_PRIVATE_KEY` corresponds to an account with minter role on the EcoToken contract
2. Ensure the minter wallet has Sepolia ETH for gas (use a [Sepolia faucet](https://sepoliafaucet.com/))
3. Confirm `ECO_TOKEN_CONTRACT` is the correct deployed contract address
4. Check the Inngest dev server at `http://localhost:8288` for detailed error logs
