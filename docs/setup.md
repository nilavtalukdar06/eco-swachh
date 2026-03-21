# Project Setup Documentation

This document describes the architecture, configuration, and tools used in this monorepo project.

## Overview

The project is structured as a monorepo using **pnpm workspaces** and **Turborepo**. It contains multiple applications and shared packages, streamlining the development, linting, formatting, and building processes.

- **Package Manager**: pnpm (v9.15.9)
- **Node Version**: >= 20
- **Build System**: Turbo (v2.8.20)

## Repository Structure

The monorepo organizes code into `apps/` for applications and `packages/` for shared libraries and configurations:

```
.
├── apps/
│   ├── admin/       # Next.js admin dashboard
│   └── web/         # Next.js public-facing web app
├── packages/
│   ├── database/    # Prisma ORM and database configurations
│   ├── eslint-config/      # Shared ESLint configuration
│   ├── typescript-config/  # Shared TypeScript configuration
│   └── ui/          # Shared UI components (shadcn/ui, Tailwind CSS)
├── docs/            # Project documentation
├── turbo.json       # Turborepo task pipeline configuration
├── pnpm-workspace.yaml # pnpm workspaces definitions
└── package.json     # Root dependencies and monorepo scripts
```

## Applications

### `apps/web`

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.4
- **Dev Server**: Runs via Turbopack (`next dev --turbopack --port 3000`)
- **Dependencies**: Uses internally shared packages (`@workspace/ui`, `@workspace/db`).

### `apps/admin`

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.4
- **Dev Server**: Runs via Turbopack (`next dev --turbopack --port 3001`)
- **Dependencies**: Uses internally shared packages (`@workspace/ui`, `@workspace/db`).

## Packages

### `@workspace/db` (`packages/database`)

Provides the database schema, models, and Prisma client to the rest of the workspace.

- **ORM**: Prisma (v7.5.0)
- **Driver**: `@prisma/adapter-pg` and `pg` for PostgreSQL.
- **Scripts**: Contains predefined scripts for generating the client, migrating the dev database, and deploying migrations (`db:generate`, `db:migrate`, `db:deploy`).

### `@workspace/ui` (`packages/ui`)

A shared component library built on top of Tailwind CSS and Radix UI primitives.

- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`) and `tw-animate-css`.
- **Components**: Utilizes `shadcn` and `radix-ui` for accessible base components.
- **Utilities**: Includes `tailwind-merge`, `clsx`, and `class-variance-authority` (cva) for dynamic styling and variants.

### `@workspace/typescript-config` (`packages/typescript-config`)

Centralized TypeScript configs for keeping TS rules consistent across apps and packages. Contains specialized configurations for:

- `base.json`
- `nextjs.json`
- `react-library.json`

### `@workspace/eslint-config` (`packages/eslint-config`)

Centralized ESLint configurations for automatic linting across all workspace projects.
Contains specialized configurations for:

- `base.js`
- `next.js`
- `react-internal.js`

## root `tsconfig.json` Setup

The root `tsconfig.json` only extends from the centralized `typescript-config` base rules:

```json
{
  "extends": "@workspace/typescript-config/base.json"
}
```

## Turborepo Configuration (`turbo.json`)

The `turbo.json` handles task orchestration for ensuring tasks run in the correct order, leveraging caching where possible:

- **`build`**: Depends on previous pipeline builds (`^build`) and database generation (`^db:generate`). Caches `.next/**` folders.
- **`dev`**: Persistent task ensuring `db:generate` is executed before starting Next.js dev servers.
- **Linting & Formatting**: Independent tasks for `lint`, `format`, and `typecheck`.
- **Database Scripts**: `db:generate`, `db:migrate`, and `db:deploy` tasks have cache intentionally disabled to ensure accurate execution on every run.
- **Env**: Exposes `DATABASE_URL` safely to global tools.

## Scripts (Root `package.json`)

Run these from the root to orchestrate changes across the monorepo:

- `pnpm dev`: Runs `dev` across all apps (Web, Admin) utilizing the dependency tree.
- `pnpm build`: Triggers optimized builds for all apps.
- `pnpm lint`: Triggers ESLint across all apps and packages.
- `pnpm format`: Runs Prettier.
- `pnpm typecheck`: Triggers `tsc --noEmit`.
