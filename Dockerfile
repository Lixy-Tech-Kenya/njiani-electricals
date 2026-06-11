FROM node:20-alpine
RUN npm install -g pnpm@10

WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source
COPY . .

# Build shared package first, then generate Prisma client, then build backend
RUN pnpm --filter @njiani/shared build
RUN pnpm --filter @njiani/backend exec prisma generate
RUN pnpm --filter @njiani/backend build

ENV NODE_ENV=production
EXPOSE 3500

CMD ["node", "apps/backend/dist/main"]
