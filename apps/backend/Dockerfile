# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN npm install -g pnpm@9
WORKDIR /app

# Copy only the files needed to resolve the workspace graph
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json    ./apps/backend/

RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Stage 2: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN npm install -g pnpm@9
WORKDIR /app

COPY --from=deps /app/node_modules        ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

RUN pnpm --filter @njiani/shared build
RUN pnpm --filter @njiani/backend build

# ── Stage 3: production image ─────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Only ship the compiled output + prod node_modules
COPY --from=builder /app/apps/backend/dist         ./dist
COPY --from=builder /app/node_modules              ./node_modules
COPY --from=builder /app/packages/shared/dist      ./packages/shared/dist
COPY --from=builder /app/apps/backend/package.json ./package.json

# Prisma client is generated into node_modules — no extra copy needed
# Public folder for local-dev uploads (not used in prod with Cloudinary)
RUN mkdir -p public/uploads

EXPOSE 3500
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3500/api/v1/health || exit 1

CMD ["node", "dist/main"]
