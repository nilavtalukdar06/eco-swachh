# Eco Swachh - Digital Waste Management Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-blueviolet.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

Eco Swachh is an innovative digital platform that transforms waste management under the Swachh Bharat initiative, leveraging blockchain technology and AI for a cleaner, sustainable India.

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [License](#license)

## Overview

Eco Swachh revolutionizes waste management through a sophisticated digital platform that combines blockchain technology, artificial intelligence, and community engagement. Our platform serves as a bridge between citizens, waste collectors, and municipal authorities, creating a transparent and efficient waste management ecosystem.

### Core Objectives

- Streamline waste reporting and collection processes
- Incentivize community participation through tokenized rewards
- Provide real-time tracking and analytics
- Ensure data transparency and accountability
- Promote sustainable waste management practices

## 🚀 Features

### 1. AI-Powered Waste Verification

- **Image Recognition**: Utilizes Google's Gemini AI for accurate waste classification
- **Real-time Analysis**: Processes images in under 2 seconds
- **Multi-waste Detection**: Can identify multiple waste types in a single image
- **Quantity Estimation**: AI-driven waste volume and weight estimation
- **Confidence Scoring**: Provides accuracy metrics for each analysis

### 2. Blockchain Integration

- **Smart Contracts**: Automated reward distribution
- **Transaction Types**:
  - Waste reporting
  - Collection verification
  - Reward distribution
  - Token transfers
- **Network**: Polygon (MATIC) for low-cost, efficient transactions
- **Token Standard**: ERC-20 compliant ECO tokens

### 3. Location Services

- Real-time tracking with Google Maps integration
- Geofencing for waste collection zones
- Route optimization for collectors
- Heatmaps for waste concentration
- Location history and analytics

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework for production-grade applications
- **TypeScript** - Static type checking and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form validation and handling
- **@react-google-maps/api** - Google Maps integration

### Backend & Database

- **Drizzle ORM** - TypeScript ORM for SQL databases
- **PostgreSQL** - Primary database (via Neon)
- **Google AI (Gemini)** - AI-powered waste verification

### Authentication & Web3

- **Web3Auth** - Decentralized authentication
- **Ethereum Provider** - Blockchain integration

## Technical Architecture

### Frontend Architecture

```typescript
Frontend/
├── components/
│   ├── common/           # Reusable UI components
│   ├── forms/            # Form components and validation
│   ├── maps/            # Map-related components
│   └── blockchain/      # Web3 integration components
├── hooks/
│   ├── useAuth.ts       # Authentication hooks
│   ├── useWeb3.ts       # Blockchain interaction hooks
│   └── useWaste.ts      # Waste management hooks
└── services/
    ├── api/            # API integration
    ├── blockchain/     # Smart contract interactions
    └── analytics/      # Analytics and tracking
```

### Backend Services

```
Backend/
├── api/
│   ├── waste/          # Waste management endpoints
│   ├── auth/           # Authentication services
│   └── rewards/        # Reward distribution logic
├── ml/
│   ├── classification/ # Waste classification models
│   └── estimation/     # Quantity estimation models
└── blockchain/
    ├── contracts/      # Smart contract implementations
    └── transactions/   # Transaction handling
```

## 🔧 System Architecture

### Component Interaction Diagram

```mermaid
graph TD
    A[User Interface] --> B[Next.js Frontend]
    B --> C[API Layer]
    C --> D[Database]
    C --> E[Blockchain]
    C --> F[AI Services]
    E --> G[Smart Contracts]
    F --> H[Gemini AI]
    D --> I[PostgreSQL]
```

### Microservices Architecture

- **API Gateway**: Rate limiting, authentication, routing
- **User Service**: Account management, profiles
- **Waste Service**: Report processing, validation
- **Analytics Service**: Data processing, insights
- **Notification Service**: Real-time updates
- **Blockchain Service**: Transaction management

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42),
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Reports Table

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    location_point GEOGRAPHY(POINT),
    waste_type VARCHAR(50),
    amount DECIMAL,
    verification_data JSONB,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 📋 Prerequisites

- Node.js 18.0 or later
- PostgreSQL database
- Google Cloud Platform account
- Web3Auth account

## 🚀 Getting Started

1. Clone the repository

```bash
git clone https://github.com/yourusername/eco-swachh.git
```

2. Install dependencies

```bash
cd eco-swachh
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

4. Start the development server

```bash
npm run dev
```

## Installation

### 1. Core Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies for ML services
pip install -r requirements.txt

# Setup database
npm run db:setup
```

### 2. Environment Configuration

```bash
# Development environment
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@host:port/db
WEB3_PROVIDER_URL=your_provider_url
CONTRACT_ADDRESS=your_contract_address
```

### 3. Database Setup

```sql
-- Initialize database schema
CREATE DATABASE eco_swachh;

-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Development

### Running Development Environment

```bash
# Start development server
npm run dev

# Watch for changes
npm run watch

# Run tests
npm run test

# Build for production
npm run build
```

### Code Quality Tools

```bash
# Run linter
npm run lint

# Run type checker
npm run type-check

# Format code
npm run format
```

## API Documentation

### Waste Management Endpoints

#### Report Waste

```typescript
POST / api / waste / report;
Body: {
  location: string;
  wasteType: string;
  amount: string;
  image: File;
  verificationData: {
    confidence: number;
    classification: string;
  }
}
```

## 🔐 Security Implementation

### Authentication Flow

```typescript
interface AuthFlow {
  step1: "Web3Auth Connect";
  step2: "Wallet Signature";
  step3: "JWT Generation";
  step4: "Session Management";
}
```

### Data Encryption

- AES-256 for sensitive data
- TLS 1.3 for data in transit
- Key rotation every 30 days

## 📊 Analytics Integration

### Event Tracking

```typescript
interface WasteEvent {
  type: "REPORT" | "COLLECTION" | "VERIFICATION";
  timestamp: Date;
  location: GeoPoint;
  metadata: Record<string, any>;
}
```

### Metrics Collected

- Waste collection efficiency
- User engagement rates
- Environmental impact
- Response times

## 🚀 Deployment Pipeline

### CI/CD Workflow

```yaml
name: Deployment
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
  build:
    needs: test
    steps:
      - run: npm build
  deploy:
    needs: build
    environment: production
```

### Infrastructure (Terraform)

```hcl
resource "aws_eks_cluster" "eco_swachh" {
  name     = "eco-swachh-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  vpc_config {
    subnet_ids = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  }
}
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe("Waste Verification", () => {
  it("should verify waste image correctly", async () => {
    // Test implementation
  });
});
```

### E2E Tests

```typescript
describe("Report Submission", () => {
  it("should submit report successfully", async () => {
    // Test implementation
  });
});
```

## 🔄 API Documentation

### Authentication Endpoints

```typescript
/**
 * @route POST /api/auth/connect
 * @desc Connect wallet and authenticate user
 */
interface AuthResponse {
  token: string;
  user: {
    id: string;
    wallet: string;
    reputation: number;
  };
}
```

### Waste Management Endpoints

```typescript
/**
 * @route POST /api/waste/report
 * @desc Submit new waste report
 */
interface ReportRequest {
  location: GeoPoint;
  wasteType: string;
  amount: number;
  images: string[];
  verificationData?: VerificationResult;
}
```

## 📱 Mobile Responsiveness

### Breakpoints

```scss
$breakpoints: (
  "mobile": 320px,
  "tablet": 768px,
  "desktop": 1024px,
  "wide": 1440px,
);
```

### Sample Media Queries

```scss
@media (max-width: 768px) {
  .waste-card {
    flex-direction: column;
  }
}
```

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. **Image Upload Failures**

   - Check image size (max 10MB)
   - Verify supported formats (PNG, JPG, GIF)
   - Ensure stable internet connection

2. **Transaction Errors**
   - Confirm wallet has sufficient MATIC
   - Check network congestion
   - Verify contract ABI version

## Security

### Authentication Flow

1. User initiates Web3Auth connection
2. Platform verifies wallet signature
3. JWT token generated and stored
4. Subsequent requests authenticated via JWT

### Data Protection

- End-to-end encryption for sensitive data
- Rate limiting on all API endpoints
- Input sanitization and validation
- Regular security audits
- GDPR compliance measures

## 🎯 Performance Optimization

### Frontend Optimization

- Code splitting
- Image optimization
- Lazy loading
- Service Worker implementation
- Cache strategies

### Backend Optimization

- Query optimization
- Connection pooling
- Caching layers
- Load balancing
- Rate limiting

## 📈 Monitoring & Logging

### Metrics

- Response times
- Error rates
- Transaction success rates
- Resource utilization
- User engagement

### Logging

```typescript
interface LogEntry {
  level: "INFO" | "WARN" | "ERROR";
  timestamp: Date;
  service: string;
  message: string;
  metadata: Record<string, any>;
}
```

## 📝 Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org)
- [Drizzle ORM](https://orm.drizzle.team)
- [Web3Auth](https://web3auth.io)
- [Google Cloud Platform](https://cloud.google.com)

## 📞 Contact

- Project Link: [https://github.com/yourusername/eco-swachh](https://github.com/yourusername/eco-swachh)

- **Technical Support**: support@ecoswachh.com
- **Security Issues**: security@ecoswachh.com
- **Partnership Inquiries**: partners@ecoswachh.com

---

Built with 💚 for a cleaner India
