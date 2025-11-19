# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack TypeScript application built with **TanStack Start** - a meta-framework for React with SSR capabilities. Uses Prisma with PostgreSQL for data persistence, oRPC for type-safe API calls, and Clerk for authentication.

## Commands

### Development
```bash
pnpm dev              # Start dev server on port 3000
pnpm build            # Production build
pnpm serve            # Preview production build
pnpm test             # Run Vitest tests
```

### Database (uses .env.local)
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database
```

### Code Quality
```bash
pnpm format           # Format with Biome
pnpm lint             # Lint with Biome
pnpm check            # Full Biome check
```

## Architecture

### Tech Stack
- **Framework**: TanStack Start (SSR) + TanStack Router (file-based routing)
- **React 19** with TypeScript (strict mode)
- **Database**: Prisma ORM with PostgreSQL
- **API**: oRPC with Zod v4 validation
- **Data Fetching**: TanStack Query
- **Auth**: Clerk
- **UI**: Tailwind CSS v4 + shadcn/ui (new-york style, zinc base color)
- **Build**: Vite 7 with Nitro

### Directory Structure
- `src/routes/` - File-based routing; route files export `Route` using `createFileRoute()`
- `src/components/ui/` - shadcn UI primitives
- `src/orpc/` - oRPC setup: `client.ts` (isomorphic client), `router/` (server procedures), `schema.ts` (Zod schemas)
- `src/integrations/` - Third-party providers (Clerk, TanStack Query)
- `src/lib/utils.ts` - Utility functions including `cn()` for Tailwind class merging
- `src/db.ts` - Prisma client singleton
- `schema.prisma` - Database schema

### Key Patterns

**Routing**: API routes at `src/routes/api.*.ts` use `server.handlers` for HTTP methods. oRPC endpoint at `api/rpc/*`.

**oRPC**: Server procedures in `src/orpc/router/`, validated with Zod. Client uses `createTanstackQueryUtils` for TanStack Query integration.

**Components**: Use `cn()` utility for class merging. Tailwind CSS variables for theming.

## Code Style

- **Formatter**: Biome (tabs, double quotes)
- **Path alias**: `@/*` maps to `./src/*`
- Files prefixed with `demo` are examples and can be deleted

## Environment Variables

Required in `.env.local`:
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `DATABASE_URL` - PostgreSQL connection string
