# 🛠️ API Reference

Complete reference for all tRPC procedures exposed by both the **Web** and **Admin** applications.

---

## Web App API (`apps/web`)

Base URL: `http://localhost:5173/api/trpc`

### Router Composition

```ts
appRouter = {
  complaints:  complaintRouter,   // User complaint CRUD
  news:        newsRouter,        // Sustainability news feed
  ai:          aiRouter,          // AI-powered summaries
  carbon:      carbonRouter,      // Carbon intensity data
  stocks:      stockRouter,       // Green stock market data
  leaderboard: leaderboardRouter, // Community rankings
  reports:     reportRouter,      // Waste report CRUD + AI pipeline
  dashboard:   dashboardRouter,   // Aggregated user metrics
};
```

---

### `complaints` Router

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `complaints.create` | `mutation` | ✅ Protected | `{ title: string(2-50), description: string(5-200) }` | `{ success: boolean, complaintId: string }` |
| `complaints.getAll` | `query` | ✅ Protected | `{ status?: "PENDING" \| "RESOLVED", cursor?: string }` | `{ items: Complaint[], nextCursor?: string }` |
| `complaints.delete` | `mutation` | ✅ Protected | `{ complaintId: string(uuid) }` | `Complaint` |

> Pagination: cursor-based, 12 items per page. Only returns complaints belonging to the authenticated user.

---

### `reports` Router

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `reports.submit` | `mutation` | ✅ Protected | `{ imageUrl: string, userDescription: string(3-500), latitude: number?, longitude: number?, manualLocation: string? }` | `{ success: boolean, reportId: string }` |
| `reports.getAll` | `query` | ✅ Protected | `{ status?: ReportStatus, priority?: ReportPriority, cursor?: string }` | `{ items: Report[], nextCursor?: string }` |
| `reports.getById` | `query` | ✅ Protected | `{ reportId: string(uuid) }` | `Report \| null` |
| `reports.delete` | `mutation` | ✅ Protected | `{ reportId: string(uuid) }` | `Report` |

**Side effects of `reports.submit`:**
1. Creates report with `status: PROCESSING`
2. Awards **10 points** to user
3. Sends `report/submitted` event to Inngest → triggers 3-step AI pipeline

---

### `dashboard` Router

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `dashboard.getStats` | `query` | ✅ Protected | _none_ | `{ reportsSubmitted: number, wasteReported: string, pointsEarned: number, co2Offset: string }` |

**Metrics calculation:**
- `reportsSubmitted` → count of user's reports
- `wasteReported` → sum of `estimatedWeight` from all reports (in kg)
- `pointsEarned` → user's `points` field
- `co2Offset` → `wasteReported * 0.5` (estimated CO₂ in kg)

---

### `leaderboard` Router

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `leaderboard.getTopUsers` | `query` | ✅ Protected | _none_ | `User[]` (ordered by points desc, role = "user" only) |

---

### `news` Router

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `news.fetchNews` | `query` | ✅ Protected | _none_ | `{ web: Article[] }` |

- **Cached** in Redis with key `news:daily` (TTL: 24 hours)
- Source: Firecrawl API web search

---

### `ai` Router

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `ai.generateSummary` | `query` | ✅ Protected | _none_ | `{ result: string }` |

- **Cached** in Redis with key `summary:daily` (TTL: 24 hours)
- Uses GPT-5 Mini with web search tool for real-time sustainability summary

---

### `carbon` Router

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `carbon.getCarbonIntensity` | `query` | ✅ Protected | _none_ | `CityData[]` |

**CityData shape:**
```ts
{
  name: string;          // City name
  lat: number;           // Latitude
  lng: number;           // Longitude
  zone: string;          // Grid zone code (e.g., "IN-NO")
  zoneName: string;      // Zone name (e.g., "Northern India")
  carbonIntensity: number; // gCO₂eq/kWh
}
```

- **Cached** in Redis with key `carbon:intensity` (TTL: 1 hour)
- Source: Electricity Maps API, 5 Indian grid zones, ~20 cities

---

### `stocks` Router

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `stocks.getStockQuotes` | `query` | ✅ Protected | _none_ | `StockQuote[]` |

**StockQuote shape:**
```ts
{
  symbol: string;         // Ticker (e.g., "NEE")
  name: string;           // Company name
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}
```

**Tracked companies:** NEE, ENPH, FSLR, SEDG, PLUG, BE, RUN, CSIQ, NOVA, DQ

- **Cached** in Redis with key `stocks:quotes` (TTL: 2 minutes)
- Source: Finnhub API

---

## Admin App API (`apps/admin`)

Base URL: `http://localhost:5174/api/trpc`

### Router Composition

```ts
appRouter = {
  complaint: complaintRouter,  // Complaint moderation
  user:      userRouter,       // User management (ban/unban)
  report:    reportRouter,     // Report resolution
};
```

---

### `complaint` Router (Admin)

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `complaint.getAll` | `query` | ✅ Protected | `{ status?: "PENDING" \| "RESOLVED", cursor?: string }` | `{ items: (Complaint & { user: User })[], nextCursor?: string }` |
| `complaint.delete` | `mutation` | ✅ Protected | `{ complaintId: string(uuid) }` | `Complaint` |
| `complaint.resolve` | `mutation` | ✅ Protected | `{ complaintId: string(uuid), comment: string(5-200) }` | `Complaint` |

**Key differences from user complaint router:**
- Returns all complaints (not just current user's), filtered by `deletedForAdmin = false`
- `delete` performs **soft deletion** (`deletedForAdmin = true`)
- `resolve` uses a transaction: updates status + creates `ComplaintComment`

---

### `report` Router (Admin)

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `report.getAll` | `query` | ✅ Protected | `{ status?: ReportStatus, priority?: ReportPriority, cursor?: string }` | `{ items: (Report & { user: User })[], nextCursor?: string }` |
| `report.getById` | `query` | ✅ Protected | `{ reportId: string(uuid) }` | `(Report & { user: User }) \| null` |
| `report.resolve` | `mutation` | ✅ Protected | `{ reportId: string(uuid), comment: string(5-500) }` | `Report` |

**`report.resolve` side effects (transaction):**
1. Sets report `status → RESOLVED`
2. Creates `ResolvedReport` record with admin comment
3. Awards **+20 points** to the original reporting user

---

### `user` Router (Admin)

| Procedure | Type | Auth | Input | Output |
|---|---|---|---|---|
| `user.getAll` | `query` | ✅ Protected + Admin | _none_ | `User[]` (role = "user", ordered by createdAt desc) |
| `user.banUser` | `mutation` | ✅ Protected + Admin | `{ userId: string, banReason: string(5-200) }` | `void` |
| `user.unbanUser` | `mutation` | ✅ Protected + Admin | `{ userId: string }` | `void` |

> **Additional authorization:** All user management procedures explicitly check `ctx.user.role === "admin"` and throw `TRPCError(UNAUTHORIZED)` if not satisfied.

---

## REST Endpoints

In addition to tRPC, the following REST API routes exist:

### Web App

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/[...all]` | ALL | Better Auth catch-all handler (login, signup, session, etc.) |
| `/api/trpc/[...trpc]` | POST | tRPC HTTP batch handler |
| `/api/inngest` | POST | Inngest webhook for background function execution |
| `/api/upload-auth` | GET | ImageKit upload authentication (returns signature + token) |

### Admin App

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/[...all]` | ALL | Better Auth catch-all (admin authentication) |
| `/api/trpc/[...trpc]` | POST | tRPC HTTP batch handler |

---

## Background Jobs (Inngest)

### `process-report` Function

**Trigger:** `report/submitted` event

**Steps:**

| Step | Name | Description |
|---|---|---|
| 1 | `spam-check` | Sends image + description to GPT-5 Mini for spam detection |
| 2a | `mark-as-spam` | If spam: updates report status to `SPAM`, creates `SpamReport` record |
| 2b | `analyze-waste` | If not spam: sends to GPT-5 Mini for waste classification |
| 3 | `update-report` | Updates report with AI analysis results, sets status to `PENDING` |

**AI Analysis Schema:**
```ts
{
  aiTitle: string;              // Generated title
  aiDescription: string;       // Detailed description
  wasteType: string;           // Classification (e.g., "Electronic waste")
  wasteDetails: string;        // Specific details
  estimatedWeight: number;     // Weight in kg
  disposalInstructions: string; // How to dispose
  warnings: string;            // Safety warnings
  priority: "LOW" | "MEDIUM" | "HIGH";
}
```
