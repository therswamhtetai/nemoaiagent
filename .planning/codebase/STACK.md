# Technology Stack

**Analysis Date:** 2026-01-27

## Languages

**Primary:**
- TypeScript - Main application language for frontend logic and API routes
- JavaScript - Configuration files and build scripts

## Runtime

**Environment:**
- Node.js - Server runtime (inferred from package managers)

**Package Manager:**
- pnpm - Primary package manager (pnpm section in package.json)
- Lockfile: Present (pnpm-lock.yaml implied)

## Frameworks

**Core:**
- Next.js v16.0.10 - Full-stack React framework with SSR/SSG capabilities
- React v19.2.0 - Frontend UI library

**Testing:**
- None detected - No testing frameworks in dependencies

**Build/Dev:**
- Tailwind CSS v4.1.9 - Utility-first CSS framework
- PostCSS v8.5 - CSS processing
- Autoprefixer v10.4.20 - CSS vendor prefixing
- TypeScript v5 - Type checking and compilation

## Key Dependencies

**Critical:**
- @supabase/supabase-js (latest) - Database ORM and real-time subscriptions
- @supabase/ssr v0.8.0 - Server-side Supabase client for Next.js
- Radix UI components (v1.1.4-2.2.4) - Accessible UI primitives

**Infrastructure:**
- @ducanh2912/next-pwa v10.2.5 - Progressive Web App support
- @vercel/analytics v1.3.1 - Web analytics
- web-push v3.6.7 - Push notification service
- jose v6.1.3 - JWT token handling for authentication

## Configuration

**Environment:**
- Environment variables loaded from .env.local
- Supabase URL and keys configured via env vars
- Custom server middleware for authentication

**Build:**
- Next.js configuration in next.config.mjs
- TypeScript configuration in tsconfig.json with strict mode
- PostCSS configuration for Tailwind CSS processing
- PWA manifest generated dynamically

## Platform Requirements

**Development:**
- Node.js with pnpm package manager
- TypeScript compiler
- PostCSS and Tailwind CSS build tools

**Production:**
- Vercel - Hosting platform (inferred from @vercel/analytics integration)

---

*Stack analysis: 2026-01-27*