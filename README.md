# Eco Swachh - Digital Waste Management Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-blueviolet.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.28-orange.svg)](https://orm.drizzle.team/)
[![Web3Auth](https://img.shields.io/badge/Web3Auth-Latest-green.svg)](https://web3auth.io/)

Eco Swachh is an innovative digital platform that transforms waste management under the Swachh Bharat initiative, leveraging AI and blockchain technology for a cleaner, sustainable India.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### For Users
- 📱 Real-time waste reporting with location tracking
- 🤖 AI-powered waste verification using Google Gemini
- 💰 Reward points system for waste management contributions
- 📊 Personal dashboard with waste reporting history
- 🎯 Leaderboard for community engagement

### For Collectors
- 🗺️ Location-based waste collection task management
- ✅ Verification system for completed collections
- 📸 Photo evidence submission and AI verification
- 💎 Token rewards for verified collections

### For Platform
- 📊 Analytics dashboard for waste management insights
- 🔄 Automated reward distribution system
- 🌐 Blockchain-based transaction tracking
- 📱 Progressive Web App capabilities

## 🏗 Architecture

### Data Flow Diagram

```mermaid
graph TD
    subgraph Users["User Interface Layer"]
        User[User/Reporter]
        Collector[Waste Collector]
        Admin[Admin Dashboard]
        Mobile[Mobile App]
        Web[Web Interface]
    end

    subgraph Processing["Processing Layer"]
        Auth[Authentication Service]
        WR[Waste Report Service]
        AI[Gemini AI Service]
        VP[Verification Process]
        RP[Reward Processing]
        Analytics[Analytics Engine]
        Notify[Notification Service]
    end

    subgraph Storage["Data Storage Layer"]
        DB[(PostgreSQL Database)]
        Cache[(Redis Cache)]
        Images[Image Storage]
    end

    subgraph Blockchain["Blockchain Layer"]
        Smart[Smart Contracts]
        Token[Token Management]
    end

    User -->|Login| Auth
    Collector -->|Login| Auth
    Auth -->|Verify| DB
    
    User -->|Submit Report| WR
    WR -->|Store Images| Images
    WR -->|Analyze| AI
    AI -->|Verification Result| VP
    VP -->|Store Result| DB
    
    Collector -->|View Tasks| DB
    Collector -->|Update Collection| VP
    VP -->|Trigger| RP
    
    RP -->|Update Points| DB
    RP -->|Issue Tokens| Smart
    Smart -->|Manage Rewards| Token
    
    DB -->|Feed Data| Analytics
    Analytics -->|Display| Admin
    
    Notify -->|Push| Mobile
    Notify -->|Alert| Web
    
    DB <-->|Cache Data| Cache
    
    subgraph Integration["External Integration"]
        Maps[Google Maps API]
        Payment[Payment Gateway]
        Weather[Weather API]
    end
    
    WR -->|Location Data| Maps
    RP -->|Process Payment| Payment
    WR -->|Weather Check| Weather

    style Users fill:#f9f,stroke:#333,stroke-width:2px
    style Processing fill:#bbf,stroke:#333,stroke-width:2px
    style Storage fill:#bfb,stroke:#333,stroke-width:2px
    style Blockchain fill:#ffb,stroke:#333,stroke-width:2px
    style Integration fill:#fbf,stroke:#333,stroke-width:2px
```

### Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ REPORTS : "submits"
    USERS ||--o{ REWARDS : "earns"
    USERS ||--o{ COLLECTED_WASTE : "collects"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ TRANSACTIONS : "has"
    
    REPORTS ||--o{ COLLECTED_WASTE : "becomes"
    
    USERS {
        int id PK
        string email
        string name
        timestamp created_at
    }
    
    REPORTS {
        int id PK
        int user_id FK
        string location
        string waste_type
        string amount
        string image_url
        json verification_result
        string status
        timestamp created_at
        int collector_id FK
    }
    
    REWARDS {
        int id PK
        int user_id FK
        int points
        timestamp created_at
        timestamp updated_at
        boolean is_available
        string description
        string name
        string collection_info
    }
    
    COLLECTED_WASTE {
        int id PK
        int report_id FK
        int collector_id FK
        timestamp collection_date
        string status
    }
    
    NOTIFICATIONS {
        int id PK
        int user_id FK
        string message
        string type
        boolean is_read
        timestamp created_at
    }
    
    TRANSACTIONS {
        int id PK
        int user_id FK
        string type
        int amount
        string description
        timestamp date
    }
```

## 🛠️ Tech Stack

### Frontend Technologies
- **Next.js 14** - React framework with server-side rendering
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Modern icon library
- **React Hook Form** - Form validation
- **@react-google-maps/api** - Google Maps integration
- **Toast** - User notifications

### Backend & Database
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Primary database (via Neon)
- **Google AI (Gemini)** - AI-powered waste verification
- **Web3Auth** - Decentralized authentication
- **Razorpay** - Payment processing

### Development & DevOps
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **GitHub Actions** - CI/CD pipeline

## 📋 Prerequisites

- Node.js 18.0 or later
- PostgreSQL database
- Google Cloud Platform account with Gemini API enabled
- Web3Auth account
- Razorpay account (for donations)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/eco-swachh.git
cd eco-swachh
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure environment variables:
```env
DATABASE_URL=your_postgres_url
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_id
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

5. Initialize the database:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
eco-swachh/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── collect/          # Waste collection module
│   ├── report/           # Waste reporting module
│   └── rewards/          # Rewards management
├── components/            # Reusable React components
├── lib/                   # Utility functions
├── public/               # Static files
├── styles/               # Global styles
├── types/                # TypeScript definitions
└── utils/
    └── db/               # Database operations
```

## 📚 API Documentation

### Waste Management Endpoints

```typescript
POST /api/reports
GET /api/reports
POST /api/collect
POST /api/verify
GET /api/rewards
```

### Authentication Endpoints

```typescript
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/user
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -am 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Drizzle ORM team for the database toolkit
- Web3Auth for decentralized authentication
- Google Cloud Platform for AI services

## 📞 Contact

- Project Link: [https://github.com/yourusername/eco-swachh](https://github.com/yourusername/eco-swachh)
- Documentation: [https://docs.eco-swachh.com](https://docs.eco-swachh.com)

---

Built with 💚 for a cleaner India | © 2024 Eco Swachh
