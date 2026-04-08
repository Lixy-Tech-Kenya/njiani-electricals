# Implementation Plan - Njiani Electricals Marketplace

This plan outlines the complete implementation of **Njiani Electricals Online Marketplace**, focusing on security, performance, SEO, and scalability.

## Phase 1: Core Foundation & Shared Logic
- [x] 1. **Monorepo scaffold** — workspace config, tsconfig, .gitignore, .env.example
- [x] 2. **`packages/shared`** Refactor:
    - [x] Replace Zod with `class-validator` and `class-transformer` for DTOs.
    - [x] Add **SEO metadata** (OpenGraph, Meta tags) to `Product` and `Category`.
    - [x] Add **Basic Inventory** (stock levels, thresholds) to `Product`.
    - [x] Ensure DTOs are compatible with both NestJS and SvelteKit.
    - [x] Category constants and shared utility types.

## Phase 2: Secure & Optimized Backend (NestJS)
- [x] 3. **Prisma & Database Optimization**:
    - [x] Schema design with appropriate indices for faster querying.
    - [x] **Full-Text Search** support using GIN indices (PostgreSQL).
    - [ ] **Database Pooling**: Configure Prisma for connection pooling.
    - [ ] Run migrations and set up seeding with dummy data.
- [x] 4. **NestJS Foundation & Security**:
    - [x] Security headers with `Helmet`.
    - [x] **Rate Limiting** via `@nestjs/throttler` for sensitive endpoints.
    - [x] Global exception filter and response transformation interceptor.
    - [x] **RBAC Guards**: Implement `JwtAuthGuard` and `RolesGuard` for access control.
    - [x] **Audit Logs**: Trace important admin actions (product changes, order status).
    - [x] **Image Optimization**: Local storage for Phase 1 with resizing/compression (Sharp).
- [x] 5. **Core API Modules**:
    - [x] **Auth**: JWT-based admin authentication with secure HttpOnly cookie handling.
    - [x] **Categories**: Public read with nested product counts.
    - [x] **Products**: Paginated list with **fuzzy search**, category filters, and featured section.
    - [ ] **Orders**: Secure order creation with **transactions**, **idempotency**, server-side price calculation, and validation.
    - [ ] **Caching**: Implement **Redis** for caching frequent queries (categories, featured products).
    - [x] **Mail Service**: SMTP-based order alerts and confirmations.
    - [x] **Admin Dashboard Stats**: Summary metrics and recent activity feed.
- [ ] 6. **Testing**: Comprehensive unit and e2e tests for core business logic.

## Phase 3: Performance-Focused Storefront (SvelteKit)
- [ ] 7. **SvelteKit Storefront Foundation**:
    - [ ] Routing and TanStack Query setup for efficient data fetching and caching.
    - [ ] **SEO Strategy**: dynamic meta tags, JSON-LD schema for products, and sitemap generation.
    - [ ] **Performance**: Image lazy loading, skeleton screens, and minimal bundle sizes.
- [ ] 8. **E-commerce Features**:
    - [ ] **Cart Store**: Persistent cart using Svelte 5 runes.
    - [ ] **Product Catalog**: Multi-faceted filtering and debounced search.
    - [ ] **Order Submission**: Validated WhatsApp/Email flow with detailed success feedback.
    - [ ] **Static Pages**: About Us, Contact, and Legal policies (Terms, Privacy).

## Phase 4: Secure Admin Dashboard (SvelteKit)
- [ ] 9. **Admin Panel**:
    - [ ] Secure layout with server-side auth guards.
    - [ ] **Inventory Management**: Track stock levels and receive low-stock alerts.
    - [ ] **Product Management**: Multi-image upload, SEO field editing, and status control.
    - [ ] **Order Tracking**: Visual status timeline and detailed customer information.

## Phase 5: Infrastructure & CI/CD
- [ ] 10. **Docker Compose**: Production-ready setup with Nginx reverse proxy.
- [ ] 11. **GitHub Actions**: Automated CI pipeline for linting, testing, and building.
- [ ] 12. **Deployment**: Automated staging/production deployment scripts.
- [ ] 13. **README**: Comprehensive setup and maintenance guide.
