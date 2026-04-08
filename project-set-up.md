# Njiani Electricals – Master Implementation Prompt

## 0. ROLE & CONTEXT

You are a senior full-stack engineer implementing an e-commerce marketplace called
**Njiani Electricals Online Marketplace** for Njiani Electricals Limited, a Kenyan electrical
products retailer.

**Business model:** B2C, Phase 1 — no online payments. Orders are submitted via WhatsApp or Email.
**Target users:** Homeowners, electricians, contractors, small businesses, and internal staff (admin).
**Phases:**
- Phase 1 (now): Product catalogue + WhatsApp / Email orders
- Phase 2: M-Pesa payments
- Phase 3: Mobile app + automation

Always write **TypeScript** everywhere. Never use `any`. Prefer explicit types and Zod schemas
for all validation boundaries (API inputs, env vars, form data).

---

## 1. MONOREPO STRUCTURE

Initialize a **pnpm workspaces** monorepo with the following layout. Do not deviate from this
structure.

```
njiani-electricals/
├── apps/
│   ├── web/          # SvelteKit – Customer storefront
│   ├── admin/        # SvelteKit – Admin dashboard
│   └── backend/      # NestJS – REST API
├── packages/
│   └── shared/       # Shared TypeScript types, DTOs, Zod schemas, utils
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── nginx/
│       └── nginx.conf
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── pnpm-workspace.yaml
├── package.json        # root – scripts only, no prod deps
├── tsconfig.base.json
└── .env.example
```

### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Root package.json scripts
```json
{
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "db:migrate": "pnpm --filter backend prisma migrate dev",
    "db:seed": "pnpm --filter backend prisma db seed",
    "db:studio": "pnpm --filter backend prisma studio"
  }
}
```

### tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## 2. SHARED PACKAGE (`packages/shared`)

This package is imported by both frontend apps and the backend. It must be framework-agnostic.

### Install
```bash
cd packages/shared
pnpm add zod
pnpm add -D typescript
```

### Directory layout
```
packages/shared/src/
├── types/
│   ├── product.ts
│   ├── category.ts
│   ├── order.ts
│   └── user.ts
├── schemas/
│   ├── product.schema.ts
│   ├── category.schema.ts
│   └── order.schema.ts
├── constants/
│   └── categories.ts
└── index.ts
```

### Types to define

**Product**
```typescript
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  categoryId: string;
  category?: Category;
  price: number;          // stored in KES (Kenya Shilling), integer cents
  description: string;
  imageUrls: string[];
  status: ProductStatus;
  isFeatured: boolean;
  createdAt: string;      // ISO date string
  updatedAt: string;
}
```

**Category**
```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  products?: Product[];
}
```

**Order (Phase 1 — WhatsApp/Email)**
```typescript
export type OrderChannel = 'WHATSAPP' | 'EMAIL';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  referenceNumber: string;   // e.g. NJE-20240601-0042
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerLocation?: string;
  notes?: string;
  channel: OrderChannel;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
```

**Cart (client-side only — not persisted)**
```typescript
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}
```

### Zod Schemas

Define Zod schemas for all API inputs. Example for order creation:

```typescript
import { z } from 'zod';

export const CreateOrderSchema = z.object({
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number'),
  customerEmail: z.string().email().optional(),
  customerLocation: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  channel: z.enum(['WHATSAPP', 'EMAIL']),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(999),
  })).min(1, 'Cart must have at least one item'),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
```

### Category constants

Pre-seed these 21 categories (from the business spec):
```typescript
export const PRODUCT_CATEGORIES = [
  'Chandeliers',
  'Switches',
  'Outdoor & Garden Electrical Accessories',
  'Extension Cables',
  'Electrical Cables',
  'Wall Brackets',
  'Solar Floodlights',
  'Staircase Lights',
  'LED Floodlights',
  'Solar Streetlights',
  'Cat Outs',
  'String Lights',
  'Mirror Lights',
  'Copper Tapes & Lightning Arrestors',
  'Rechargeable Lamps',
  'LED Ceiling Lights',
  'Power Meters',
  'Sockets (Waterproof & Non-Waterproof)',
  'Office Lights',
  'Up & Down Lights',
  'Other Items',
] as const;

export type ProductCategoryName = (typeof PRODUCT_CATEGORIES)[number];
```

---

## 3. BACKEND (`apps/backend`)

### Stack
- **NestJS** with TypeScript
- **Prisma** ORM
- **PostgreSQL** (via Docker in dev)
- **Nodemailer** for email notifications
- **Jest** for unit + integration tests
- **class-validator** + **class-transformer** for DTO validation
- **passport-jwt** + **bcrypt** for admin authentication

### Install
```bash
cd apps/backend
pnpm add @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/config
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add @prisma/client zod class-validator class-transformer
pnpm add nodemailer @nestjs-modules/mailer handlebars
pnpm add -D prisma @types/bcrypt @types/nodemailer @types/passport-jwt
pnpm add -D jest @nestjs/testing ts-jest supertest @types/supertest
```

### Environment variables (`.env`)
```env
# Database
DATABASE_URL="postgresql://njiani:njiani_pass@localhost:5432/njiani_db"

# JWT
JWT_SECRET="replace-with-256-bit-secret"
JWT_EXPIRES_IN="7d"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="orders@njiani.co.ke"
SMTP_PASS="app-specific-password"
SMTP_FROM="Njiani Electricals <orders@njiani.co.ke>"

# Business contacts
BUSINESS_EMAIL="orders@njiani.co.ke"
BUSINESS_WHATSAPP="+254700000000"
BUSINESS_NAME="Njiani Electricals Limited"

# App
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
ADMIN_URL="http://localhost:5174"
```

Validate all env vars at startup using a Zod schema in `src/config/env.schema.ts`.

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(ADMIN)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role {
  ADMIN
  STAFF
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  description String?
  imageUrl    String?
  sortOrder   Int       @default(0)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id          String        @id @default(uuid())
  name        String
  sku         String        @unique
  slug        String        @unique
  categoryId  String
  category    Category      @relation(fields: [categoryId], references: [id])
  price       Int           // KES cents (e.g. 1500 = KES 15.00)
  description String        @db.Text
  imageUrls   String[]
  status      ProductStatus @default(ACTIVE)
  isFeatured  Boolean       @default(false)
  orderItems  OrderItem[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
}

model Order {
  id               String      @id @default(uuid())
  referenceNumber  String      @unique
  customerName     String
  customerPhone    String
  customerEmail    String?
  customerLocation String?
  notes            String?     @db.Text
  channel          OrderChannel
  status           OrderStatus @default(PENDING)
  totalAmount      Int
  items            OrderItem[]
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
}

model OrderItem {
  id          String  @id @default(uuid())
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product @relation(fields: [productId], references: [id])
  productName String
  sku         String
  quantity    Int
  unitPrice   Int
}

enum OrderChannel {
  WHATSAPP
  EMAIL
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  DELIVERED
  CANCELLED
}
```

### Module Structure

```
src/
├── main.ts
├── app.module.ts
├── config/
│   ├── env.schema.ts
│   └── configuration.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── decorators/
│   │   └── public.decorator.ts
│   └── pipes/
│       └── zod-validation.pipe.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── dto/
│       └── login.dto.ts
├── categories/
│   ├── categories.module.ts
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── dto/
│       ├── create-category.dto.ts
│       └── update-category.dto.ts
├── products/
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── dto/
│       ├── create-product.dto.ts
│       ├── update-product.dto.ts
│       └── product-query.dto.ts
├── orders/
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── dto/
│       ├── create-order.dto.ts
│       └── update-order-status.dto.ts
├── mail/
│   ├── mail.module.ts
│   ├── mail.service.ts
│   └── templates/
│       ├── order-confirmation.hbs
│       └── new-order-alert.hbs
├── upload/
│   ├── upload.module.ts
│   └── upload.service.ts
└── prisma/
    ├── prisma.module.ts
    └── prisma.service.ts
```

### Key API Endpoints

#### Public (no auth required)
```
GET    /api/categories                        – list all categories
GET    /api/categories/:slug                  – category with products
GET    /api/products                          – paginated + filtered list
GET    /api/products/featured                 – featured products
GET    /api/products/:slug                    – single product detail
POST   /api/orders                            – create order (Phase 1 entry point)
```

#### Admin (JWT required)
```
POST   /api/auth/login                        – returns JWT
GET    /api/auth/me                           – current user

GET    /api/admin/products                    – paginated product list
POST   /api/admin/products                    – create product
PATCH  /api/admin/products/:id                – update product
DELETE /api/admin/products/:id                – soft delete (set INACTIVE)

GET    /api/admin/categories                  – list
POST   /api/admin/categories                  – create
PATCH  /api/admin/categories/:id              – update
DELETE /api/admin/categories/:id              – delete if no products

GET    /api/admin/orders                      – paginated order list
GET    /api/admin/orders/:id                  – order detail
PATCH  /api/admin/orders/:id/status           – update status
GET    /api/admin/dashboard/stats             – summary counts + recent orders

POST   /api/admin/upload/image                – upload product image
```

### Query parameters for `GET /api/products`
```
?category=slug
?search=keyword          – searches name, sku, description
?status=ACTIVE           – default ACTIVE only for public
?featured=true
?page=1&limit=20         – pagination
?sort=price_asc|price_desc|name_asc|newest
```

### Order creation flow (Phase 1)

When `POST /api/orders` is called:
1. Validate request body with `CreateOrderSchema` from shared package.
2. Fetch all products by ID, verify they exist and are ACTIVE.
3. Calculate `totalAmount` server-side (never trust client price).
4. Generate `referenceNumber`: `NJE-YYYYMMDD-XXXX` (sequential daily counter).
5. Persist order and items in a Prisma transaction.
6. Fire two emails concurrently (non-blocking, wrapped in try/catch):
   - **Customer confirmation** (if email provided): `order-confirmation.hbs`
   - **Business alert**: `new-order-alert.hbs` to `BUSINESS_EMAIL`
7. Return the created order (201).

### WhatsApp link generation (utility function)

```typescript
export function buildWhatsAppOrderUrl(
  phone: string,
  items: CartItem[],
  customerName: string,
): string {
  const itemList = items
    .map(i => `• ${i.product.name} (x${i.quantity}) – KES ${formatPrice(i.product.price * i.quantity)}`)
    .join('\n');

  const message = encodeURIComponent(
    `Hello Njiani Electricals,\n\nI'd like to place an order:\n\n${itemList}\n\n` +
    `Total: KES ${formatPrice(items.reduce((s, i) => s + i.product.price * i.quantity, 0))}\n\n` +
    `My name: ${customerName}\n\nPlease confirm availability and delivery details. Thank you.`
  );

  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;
}
```

### Tests

Write **unit tests** for:
- `OrdersService.create()` – mock PrismaService, verify price calculation, reference generation
- `ProductsService.findAll()` – filter/pagination logic
- `MailService.sendOrderConfirmation()` – mock nodemailer, verify template vars

Write **e2e tests** for:
- `POST /api/orders` – happy path + invalid items + empty cart
- `POST /api/auth/login` – valid + invalid credentials
- `GET /api/products` – filter by category, search, pagination

```bash
# jest.config.ts at backend root
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

---

## 4. CUSTOMER STOREFRONT (`apps/web`)

### Stack
- **SvelteKit** with TypeScript
- **TanStack Query for Svelte** (`@tanstack/svelte-query`)
- **Tailwind CSS** + custom design tokens
- No UI component library — build custom components

### Install
```bash
cd apps/web
pnpm add @tanstack/svelte-query @tanstack/svelte-query-devtools
pnpm add -D tailwindcss autoprefixer postcss
```

### Design System — Electrical Theme

```css
/* src/app.css */
:root {
  --color-primary: #1a1a2e;       /* deep navy */
  --color-accent: #e94560;        /* electric red */
  --color-accent-alt: #f5a623;    /* amber – warm electrical */
  --color-whatsapp: #25d366;      /* WhatsApp green */
  --color-surface: #ffffff;
  --color-surface-2: #f8f9fa;
  --color-text: #1a1a2e;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
  --radius: 8px;
  --radius-lg: 12px;
}
```

**Typography:** Use `Inter` (body) + `Space Grotesk` (headings). Load via `@fontsource`.

**WhatsApp CTA button:** Always `background: var(--color-whatsapp)`, white text, phone icon,
minimum 48px tall, full-width on mobile. This is the highest-priority UI element.

### Route Structure

```
src/routes/
├── +layout.svelte           – navbar, footer, QueryClientProvider, cart store
├── +layout.ts               – load categories for nav
├── +page.svelte             – homepage: hero, featured products, category grid
├── products/
│   ├── +page.svelte         – all products with filters sidebar
│   ├── +page.ts             – load products (TanStack Query prefetch)
│   └── [slug]/
│       ├── +page.svelte     – product detail
│       └── +page.ts
├── categories/
│   └── [slug]/
│       ├── +page.svelte     – products in category
│       └── +page.ts
├── cart/
│   └── +page.svelte         – cart review + order form
└── order/
    └── success/
        └── +page.svelte     – order confirmation page
```

### Cart Store (`src/lib/stores/cart.svelte.ts`)

Use Svelte 5 runes. Persist to `localStorage`.

```typescript
import type { CartItem, Product } from '@njiani/shared';

function createCart() {
  let items = $state<CartItem[]>([]);

  // Hydrate from localStorage on init
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('njiani-cart');
    if (saved) items = JSON.parse(saved);
  }

  $effect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('njiani-cart', JSON.stringify(items));
    }
  });

  return {
    get items() { return items; },
    get totalAmount() {
      return items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    },
    get itemCount() {
      return items.reduce((s, i) => s + i.quantity, 0);
    },
    addItem(product: Product, quantity = 1) {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({ product, quantity });
      }
    },
    removeItem(productId: string) {
      items = items.filter(i => i.product.id !== productId);
    },
    updateQuantity(productId: string, quantity: number) {
      const item = items.find(i => i.product.id === productId);
      if (item) item.quantity = Math.max(1, quantity);
    },
    clear() { items = []; },
  };
}

export const cart = createCart();
```

### API Client (`src/lib/api/`)

Create a typed API client that wraps `fetch`. All functions should be usable
both in `+page.ts` (server-side) and in TanStack Query `queryFn` (client-side).

```typescript
// src/lib/api/client.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  products: {
    list: (params?: ProductQueryParams) => request<PaginatedResponse<Product>>(`/api/products?${qs(params)}`),
    bySlug: (slug: string) => request<Product>(`/api/products/${slug}`),
    featured: () => request<Product[]>('/api/products/featured'),
  },
  categories: {
    list: () => request<Category[]>('/api/categories'),
    bySlug: (slug: string) => request<Category>(`/api/categories/${slug}`),
  },
  orders: {
    create: (data: CreateOrderInput) => request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
};
```

### TanStack Query — Query Keys

Define all query keys in a central file:

```typescript
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params: ProductQueryParams) => ['products', 'list', params] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    featured: ['products', 'featured'] as const,
  },
  categories: {
    all: ['categories'] as const,
    detail: (slug: string) => ['categories', 'detail', slug] as const,
  },
};
```

### Key Pages to Build

**Homepage (`+page.svelte`)**
- Hero section: full-width banner, tagline "Kenya's electrical products marketplace"
- Featured products carousel/grid (4–8 products)
- Category grid (icon or image per category, tap to browse)
- "How to order" — 3-step explanation (Browse → Cart → WhatsApp/Email)

**Product listing (`/products`)**
- Filters: category (sidebar on desktop, sheet drawer on mobile), price range, in-stock toggle
- Sorting: price ↑↓, newest, name
- Product cards: image, name, category, price (KES), "Add to Cart" button
- Skeleton loader during fetch
- Empty state when no results

**Product detail (`/products/[slug]`)**
- Image gallery (thumbnails + main image)
- SKU, category breadcrumb
- Price in KES (formatted with commas)
- Availability badge (In Stock / Out of Stock)
- Add to Cart + quantity selector
- WhatsApp order button (direct single-product order, bypasses cart)
- Related products from same category

**Cart page (`/cart`)**
- Line items with quantity adjusters
- Remove item button
- Order summary (subtotal, no tax in Phase 1)
- Customer details form: name (required), phone (required), email (optional), location (optional), notes
- Two CTA buttons:
  1. **"Send via WhatsApp"** (primary, green) — generates pre-filled WhatsApp link, opens in new tab, then POSTs order to API with `channel: 'WHATSAPP'`
  2. **"Send via Email"** (secondary) — POSTs order to API with `channel: 'EMAIL'`, sends confirmation
- Form validation with client-side Zod before submission

---

## 5. ADMIN PANEL (`apps/admin`)

### Stack
Same as web: SvelteKit, TanStack Query, Tailwind. Add:
- `@tanstack/table` (for data tables)
- Route protection via JWT in `locals`

### Auth Flow
- Login page at `/login` — posts credentials, stores JWT in `httpOnly` cookie via a SvelteKit endpoint
- All admin routes protected in `+layout.server.ts` — check `locals.user`
- Logout clears cookie and redirects to `/login`

### Route Structure

```
src/routes/
├── login/
│   └── +page.svelte
├── (admin)/                    – protected layout
│   ├── +layout.server.ts       – auth guard
│   ├── +layout.svelte          – sidebar nav
│   ├── +page.svelte            – dashboard overview
│   ├── products/
│   │   ├── +page.svelte        – products table
│   │   ├── new/
│   │   │   └── +page.svelte    – create product form
│   │   └── [id]/
│   │       └── +page.svelte    – edit product form
│   ├── categories/
│   │   ├── +page.svelte
│   │   └── [id]/
│   │       └── +page.svelte
│   └── orders/
│       ├── +page.svelte        – orders table with status filter
│       └── [id]/
│           └── +page.svelte    – order detail + status update
```

### Dashboard Stats (`GET /api/admin/dashboard/stats`)

Return and display:
```typescript
interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  recentOrders: Order[];      // last 5
  ordersByStatus: Record<OrderStatus, number>;
}
```

### Product Form

Fields:
- Name (text, required)
- SKU (text, required, unique-check on blur via API)
- Category (select from fetched list, required)
- Price in KES (number input, stored as integer cents internally)
- Description (textarea, rich text optional in Phase 2)
- Images (multi-file upload, preview, drag-to-reorder)
- Status (Active / Inactive / Out of Stock)
- Is Featured (checkbox)

### Order Table

Columns: Reference No. | Customer | Phone | Channel | Items | Total (KES) | Status | Date

- Filter by status (tabs: All / Pending / Confirmed / Processing / Delivered / Cancelled)
- Filter by channel (WhatsApp / Email)
- Date range filter
- Search by reference number or customer name
- Click row → order detail page
- Status badge coloured by state

### Order Detail Page

Show all order info. Provide a "Status" dropdown with an "Update" button.
Show a timeline of status changes (store in a separate `OrderStatusHistory` model if needed).

---

## 6. INFRASTRUCTURE (`infra/`)

### `docker-compose.yml` (development)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: njiani
      POSTGRES_PASSWORD: njiani_pass
      POSTGRES_DB: njiani_db
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U njiani']
      interval: 5s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer
    ports:
      - '8080:8080'
    depends_on:
      - postgres

volumes:
  pgdata:
```

### `docker-compose.prod.yml` (production)

Add `backend`, `web`, and `admin` services with built Docker images.
Include an `nginx` reverse proxy service.

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - backend
      - web
      - admin
```

### `nginx/nginx.conf`

Route:
- `njiani.co.ke` → web (SvelteKit, port 3000)
- `admin.njiani.co.ke` → admin (SvelteKit, port 3002)
- `api.njiani.co.ke` → backend (NestJS, port 3001)

### Dockerfiles

Each app needs a multi-stage `Dockerfile`:

```dockerfile
# apps/backend/Dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter shared build
RUN pnpm --filter backend build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

---

## 7. CI/CD (`.github/workflows/`)

### `ci.yml` — runs on every PR and push to `main`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: njiani
          POSTGRES_PASSWORD: njiani_pass
          POSTGRES_DB: njiani_test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Build shared package
        run: pnpm --filter shared build

      - name: Lint
        run: pnpm -r lint

      - name: Type check
        run: pnpm -r typecheck

      - name: Run backend tests
        working-directory: apps/backend
        env:
          DATABASE_URL: postgresql://njiani:njiani_pass@localhost:5432/njiani_test_db
          JWT_SECRET: ci-test-secret
          NODE_ENV: test
        run: |
          pnpm prisma migrate deploy
          pnpm test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

### `deploy.yml` — runs on push to `main` after CI passes

Trigger a deployment to your VPS:
1. SSH into server
2. `git pull`
3. `pnpm install --frozen-lockfile`
4. `pnpm --filter backend prisma migrate deploy`
5. `docker compose -f infra/docker-compose.prod.yml up -d --build`

---

## 8. SEEDING

Create `prisma/seed.ts`:
1. Create all 21 categories from `PRODUCT_CATEGORIES` constant.
2. Create a default admin user: `admin@njiani.co.ke` / `Admin@1234` (bcrypt hashed).
3. Create 10 sample products spread across categories.

```bash
pnpm db:seed
```

---

## 9. IMPLEMENTATION ORDER (follow this sequence)

1. **Monorepo scaffold** — workspace config, tsconfig, .gitignore, .env.example
2. **`packages/shared`** — all types, Zod schemas, category constants, build it
3. **Prisma schema + migrations** — get DB running in Docker, run first migration
4. **NestJS backend foundation** — PrismaService, config, global exception filter, transform interceptor
5. **Auth module** — login endpoint, JWT strategy, admin guard
6. **Categories module** — CRUD (public read, admin write)
7. **Products module** — CRUD + public list/detail with filters
8. **Orders module** — create order, mail service, WhatsApp util
9. **Admin dashboard stats endpoint**
10. **Unit + e2e tests** for backend
11. **SvelteKit web app** — routing, API client, TanStack Query setup
12. **Cart store + cart page + order submission**
13. **Homepage + product listing + product detail**
14. **SvelteKit admin app** — auth, products CRUD, orders table, dashboard
15. **Docker Compose** — dev and prod configs
16. **GitHub Actions** — CI pipeline
17. **README** — setup, dev, test, deploy instructions

---

## 10. CONVENTIONS

- **Naming:** camelCase for variables/functions, PascalCase for classes/types, kebab-case for files
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Branches:** `feature/`, `fix/`, `chore/`
- **Price formatting:** Always display as `KES X,XXX` (Kenyan Shillings). Store as integer cents.
- **Slugs:** Auto-generate from name using `slugify`, ensure uniqueness with UUID suffix if collision
- **Dates:** Always store UTC, display in `Africa/Nairobi` timezone (`+03:00`)
- **Error responses:** Always `{ statusCode, message, error }` shape via the global exception filter
- **Pagination:** Always `{ data: T[], meta: { total, page, limit, totalPages } }`
- **Image storage:** Phase 1 — store in `public/uploads/` on server, serve statically via NestJS.
  Phase 2 — migrate to Cloudflare R2 or AWS S3.
- **CORS:** Allow `FRONTEND_URL` and `ADMIN_URL` from env
- **Rate limiting:** Apply `@nestjs/throttler` on the orders create endpoint (5 req/min per IP)

---

## 11. FUTURE PHASE NOTES (don't build now, but design for it)

- **Phase 2 – M-Pesa:** The `Order` model already has `totalAmount`. Add a `Payment` model with
  `orderId`, `provider`, `transactionId`, `status`, `amount`. The M-Pesa Daraja API integration
  goes in a `payments` module.
- **Phase 3 – Mobile:** The REST API is shared. Add a React Native / Expo app in `apps/mobile`.
  Auth tokens work the same way.
- **B2B orders:** Add a `customerType` enum (`RETAIL | WHOLESALE | CONTRACTOR`) to `Order` and
  support bulk pricing tiers in `Product`.
- **Inventory tracking:** Add `stockQuantity` and `lowStockThreshold` to `Product`. Fire email
  alerts when stock drops below threshold.
- **Product reviews:** `Review` model with `productId`, `customerName`, `rating`, `comment`,
  `isApproved`.

Notes:
After every set up commit the changes and push to github. 
Make use you use cli tools to make the work easier and faster. 
Use pnpm to manage the workspace.