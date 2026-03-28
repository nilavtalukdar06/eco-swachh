# 📊 Database Design & Diagrams

This document covers the complete database schema, entity relationships, class diagrams, and data flow sequences for the EcoSwachh platform.

---

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Session : "authenticates via"
    User ||--o{ Account : "has provider"
    User ||--o{ Complaint : "submits"
    User ||--o{ ComplaintComment : "resolves as admin"
    User ||--o{ Report : "submits"
    User ||--o{ SpamReport : "flagged for"
    User ||--o{ ResolvedReport : "resolved by admin"
    Complaint ||--o| ComplaintComment : "resolved with"
    Report ||--o| SpamReport : "flagged as spam"
    Report ||--o| ResolvedReport : "resolved with"

    User {
        String id PK
        String name
        String email UK
        Boolean emailVerified
        String image
        Int points
        String role "user | admin"
        Boolean banned
        String banReason
        DateTime banExpires
        String walletAddress "optional Ethereum 0x address"
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
        DateTime createdAt
        DateTime updatedAt
    }

    Account {
        String id PK
        String accountId
        String providerId
        String userId FK
        String accessToken
        String refreshToken
        String idToken
        DateTime accessTokenExpiresAt
        DateTime refreshTokenExpiresAt
        String scope
        String password "hashed"
        DateTime createdAt
        DateTime updatedAt
    }

    Verification {
        String id PK
        String identifier
        String value
        DateTime expiresAt
        DateTime createdAt
        DateTime updatedAt
    }

    Complaint {
        String id PK "UUID"
        String userId FK
        String title
        String description
        ComplaintStatus status "PENDING | RESOLVED"
        Boolean deletedForAdmin "soft delete for admin view"
        DateTime resolvedAt
        DateTime createdAt
        DateTime updatedAt
    }

    ComplaintComment {
        String id PK "UUID"
        String complaintId FK_UK "1:1 with Complaint"
        String adminId FK
        String comment
        DateTime createdAt
        DateTime updatedAt
    }

    Report {
        String id PK "UUID"
        String imageUrl
        String userDescription
        String aiTitle "AI-generated"
        String aiDescription "AI-generated"
        String wasteType "AI-classified"
        String wasteDetails "AI-generated"
        Float estimatedWeight "AI-estimated kg"
        String disposalInstructions "AI-generated"
        String warnings "AI-generated"
        ReportPriority priority "LOW | MEDIUM | HIGH"
        ReportStatus status "PROCESSING | SPAM | PENDING | RESOLVED"
        Float latitude "optional GPS"
        Float longitude "optional GPS"
        String manualLocation "optional text"
        String userId FK
        DateTime createdAt
        DateTime updatedAt
    }

    SpamReport {
        String id PK "UUID"
        String spamReason "AI explanation"
        String reportId FK_UK "1:1 with Report"
        String userId FK
        DateTime createdAt
        DateTime updatedAt
    }

    ResolvedReport {
        String id PK "UUID"
        String comment "Admin comment"
        String reportId FK_UK "1:1 with Report"
        String userId FK "Admin who resolved"
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## Class Diagram

This diagram represents the key domain classes as they map to the Prisma schema and application code:

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +Boolean emailVerified
        +String? image
        +Int points
        +String? role
        +Boolean? banned
        +String? banReason
        +DateTime? banExpires
        +String? walletAddress
        +DateTime createdAt
        +DateTime updatedAt
        +Session[] sessions
        +Account[] accounts
        +Complaint[] complaints
        +ComplaintComment[] resolvedComplaints
        +Report[] reports
        +SpamReport[] spamReports
        +ResolvedReport[] resolvedReports
    }

    class Session {
        +String id
        +DateTime expiresAt
        +String token
        +String? ipAddress
        +String? userAgent
        +String userId
        +String? impersonatedBy
    }

    class Account {
        +String id
        +String accountId
        +String providerId
        +String userId
        +String? accessToken
        +String? refreshToken
        +String? password
    }

    class Verification {
        +String id
        +String identifier
        +String value
        +DateTime expiresAt
    }

    class Complaint {
        +String id
        +String userId
        +String title
        +String description
        +ComplaintStatus status
        +Boolean deletedForAdmin
        +DateTime? resolvedAt
        +ComplaintComment? resolution
    }

    class ComplaintComment {
        +String id
        +String complaintId
        +String adminId
        +String comment
    }

    class Report {
        +String id
        +String imageUrl
        +String userDescription
        +String aiTitle
        +String aiDescription
        +String wasteType
        +String wasteDetails
        +Float estimatedWeight
        +String disposalInstructions
        +String warnings
        +ReportPriority priority
        +ReportStatus status
        +Float? latitude
        +Float? longitude
        +String? manualLocation
        +String userId
        +SpamReport? spamRecord
        +ResolvedReport? resolution
    }

    class SpamReport {
        +String id
        +String spamReason
        +String reportId
        +String userId
    }

    class ResolvedReport {
        +String id
        +String comment
        +String reportId
        +String userId
    }

    class ComplaintStatus {
        <<enumeration>>
        PENDING
        RESOLVED
    }

    class ReportPriority {
        <<enumeration>>
        LOW
        MEDIUM
        HIGH
    }

    class ReportStatus {
        <<enumeration>>
        PROCESSING
        SPAM
        PENDING
        RESOLVED
    }

    User "1" --> "*" Session
    User "1" --> "*" Account
    User "1" --> "*" Complaint
    User "1" --> "*" Report
    User "1" --> "*" ComplaintComment : resolves
    User "1" --> "*" SpamReport
    User "1" --> "*" ResolvedReport : resolves
    Complaint "1" --> "0..1" ComplaintComment
    Report "1" --> "0..1" SpamReport
    Report "1" --> "0..1" ResolvedReport
    Complaint ..> ComplaintStatus
    Report ..> ReportPriority
    Report ..> ReportStatus
```

---

## Sequence Diagrams

### 1. User Registration & Login

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextJS as Next.js App
    participant BetterAuth as Better Auth
    participant Prisma
    participant PostgreSQL

    User->>Browser: Fill signup form
    Browser->>NextJS: POST /api/auth/signup
    NextJS->>BetterAuth: signUp({ email, password, name })
    BetterAuth->>Prisma: user.create()
    Prisma->>PostgreSQL: INSERT INTO user
    PostgreSQL-->>Prisma: User record
    BetterAuth->>Prisma: account.create({ providerId: "credential" })
    Prisma->>PostgreSQL: INSERT INTO account
    BetterAuth->>Prisma: session.create()
    Prisma->>PostgreSQL: INSERT INTO session
    BetterAuth-->>NextJS: Set session cookie
    NextJS-->>Browser: 200 OK + Set-Cookie
    Browser-->>User: Redirect to Dashboard
```

### 2. Waste Report Submission & AI Processing

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant ImageKit
    participant TRPC as tRPC API
    participant Prisma
    participant DB as PostgreSQL
    participant Inngest
    participant OpenAI as GPT-5 Mini

    User->>Browser: Select image + description + location
    Browser->>ImageKit: Upload image
    ImageKit-->>Browser: imageUrl (CDN)
    Browser->>TRPC: reports.submit({ imageUrl, description, lat, lng })
    
    Note over TRPC: protectedProcedure middleware
    TRPC->>Prisma: report.create(status: PROCESSING)
    Prisma->>DB: INSERT INTO report
    TRPC->>Prisma: user.update(points += 10)
    Prisma->>DB: UPDATE user SET points
    TRPC->>Inngest: send("report/submitted", { reportId, ... })
    TRPC-->>Browser: { success: true, reportId }
    Browser-->>User: Show "Processing..." status

    Note over Inngest: Async background pipeline

    Inngest->>OpenAI: Spam check (image + text)
    OpenAI-->>Inngest: { isSpam: false }
    Inngest->>OpenAI: Waste analysis (image + text)
    OpenAI-->>Inngest: { aiTitle, wasteType, priority, ... }
    Inngest->>Prisma: report.update(status: PENDING, AI fields...)
    Prisma->>DB: UPDATE report

    Note over User: User polls/refreshes to see updated status
    User->>Browser: Refresh report
    Browser->>TRPC: reports.getById({ reportId })
    TRPC->>Prisma: report.findFirst()
    Prisma->>DB: SELECT FROM report
    TRPC-->>Browser: Full report with AI analysis
    Browser-->>User: Display enriched report
```

### 3. Admin Report Resolution

```mermaid
sequenceDiagram
    actor Admin
    participant Browser
    participant TRPC as Admin tRPC
    participant Prisma
    participant DB as PostgreSQL

    Admin->>Browser: View report details
    Browser->>TRPC: report.getById({ reportId })
    TRPC->>Prisma: report.findFirst(include: user)
    Prisma->>DB: SELECT report JOIN user
    TRPC-->>Browser: Report + submitter details
    Browser-->>Admin: Display report detail page

    Admin->>Browser: Click "Resolve" + enter comment
    Browser->>TRPC: report.resolve({ reportId, comment })

    Note over TRPC: Admin role check
    TRPC->>Prisma: $transaction([...])
    
    Note over Prisma: Transaction: 3 operations
    Prisma->>DB: UPDATE report SET status = RESOLVED
    Prisma->>DB: INSERT INTO resolved_report
    Prisma->>DB: UPDATE user SET points += 20
    
    DB-->>Prisma: All committed
    TRPC-->>Browser: Resolved report
    Browser-->>Admin: Success toast notification
```

### 4. Complaint Lifecycle

```mermaid
sequenceDiagram
    actor User
    actor Admin
    participant Web as Web App
    participant AdminApp as Admin Portal
    participant TRPC_Web as Web tRPC
    participant TRPC_Admin as Admin tRPC
    participant DB as PostgreSQL

    User->>Web: Submit complaint (title + description)
    Web->>TRPC_Web: complaints.create({ title, description })
    TRPC_Web->>DB: INSERT INTO complaint (status: PENDING)
    TRPC_Web-->>Web: { success, complaintId }
    Web-->>User: Complaint submitted

    Admin->>AdminApp: View complaints list
    AdminApp->>TRPC_Admin: complaint.getAll({ status: PENDING })
    TRPC_Admin->>DB: SELECT complaints WHERE deletedForAdmin = false
    TRPC_Admin-->>AdminApp: Complaints list with user info

    alt Admin resolves
        Admin->>AdminApp: Resolve with comment
        AdminApp->>TRPC_Admin: complaint.resolve({ complaintId, comment })
        TRPC_Admin->>DB: Transaction: UPDATE status, CREATE comment
        AdminApp-->>Admin: Resolved!
    else Admin soft-deletes
        Admin->>AdminApp: Dismiss complaint
        AdminApp->>TRPC_Admin: complaint.delete({ complaintId })
        TRPC_Admin->>DB: UPDATE deletedForAdmin = true
        AdminApp-->>Admin: Removed from view
    end

    User->>Web: Check complaint status
    Web->>TRPC_Web: complaints.getAll({})
    TRPC_Web->>DB: SELECT complaints WHERE userId
    Web-->>User: Show updated status (RESOLVED)
```

### 5. Carbon Heatmap Data Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant TRPC as tRPC API
    participant Redis as Upstash Redis
    participant EMaps as Electricity Maps API

    User->>Browser: Navigate to Carbon Heatmap
    Browser->>TRPC: carbon.getCarbonIntensity()
    TRPC->>Redis: GET carbon:intensity

    alt Cache Hit
        Redis-->>TRPC: Cached city data[]
        TRPC-->>Browser: Return cached data
    else Cache Miss
        Redis-->>TRPC: null
        loop For each Indian grid zone (5 zones)
            TRPC->>EMaps: GET /carbon-intensity/latest?zone={zone}
            EMaps-->>TRPC: { carbonIntensity: number }
            Note over TRPC: Map to all cities in zone
        end
        TRPC->>Redis: SET carbon:intensity (TTL: 1h)
        TRPC-->>Browser: Fresh city data[]
    end

    Browser->>Browser: Render Mapbox GL heatmap
    Browser-->>User: Interactive carbon emission map
```

### 6. News Feed with AI Summary

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant TRPC as tRPC API
    participant Redis as Upstash Redis
    participant Firecrawl
    participant OpenAI as GPT-5 Mini

    User->>Browser: Navigate to News Feed
    
    par Fetch News Articles
        Browser->>TRPC: news.fetchNews()
        TRPC->>Redis: GET news:daily
        alt Cache Hit
            Redis-->>TRPC: Cached articles
        else Cache Miss
            TRPC->>Firecrawl: POST /search (sustainability + waste management)
            Firecrawl-->>TRPC: Top 8 articles
            TRPC->>Redis: SET news:daily (TTL: 24h)
        end
        TRPC-->>Browser: Articles data
    and Fetch AI Summary
        Browser->>TRPC: ai.generateSummary()
        TRPC->>Redis: GET summary:daily
        alt Cache Hit
            Redis-->>TRPC: Cached summary
        else Cache Miss
            TRPC->>OpenAI: generateText() with web_search tool
            OpenAI-->>TRPC: Daily sustainability summary
            TRPC->>Redis: SET summary:daily (TTL: 24h)
        end
        TRPC-->>Browser: Summary text
    end

    Browser-->>User: News cards + AI summary panel
```

---

## Database Indexes

| Table | Index | Columns | Purpose |
|---|---|---|---|
| `session` | `session_token_key` | `token` (unique) | Fast session lookup |
| `session` | `session_userId_idx` | `userId` | Query sessions by user |
| `account` | `account_userId_idx` | `userId` | Query accounts by user |
| `verification` | `verification_identifier_idx` | `identifier` | Fast verification lookup |
| `user` | `user_email_key` | `email` (unique) | Unique email constraint |
| `complaint` | composite | `userId, status` | Filter complaints per user |
| `complaint` | `complaint_deletedForAdmin_idx` | `deletedForAdmin` | Admin soft-delete filter |
| `complaint_comment` | `complaintComment_complaintId_key` | `complaintId` (unique) | 1:1 relation |
| `spam_report` | `spamReport_reportId_key` | `reportId` (unique) | 1:1 relation |
| `resolved_report` | `resolvedReport_reportId_key` | `reportId` (unique) | 1:1 relation |

---

## Points System

| Action | Points | Triggered By |
|---|---|---|
| Submit a waste report | **+10** | `reports.submit` mutation |
| Report resolved by admin | **+20** | `report.resolve` admin mutation |

Points are displayed on the dashboard, leaderboard, and influence user ranking.
