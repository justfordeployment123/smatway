FROM node:24-bookworm-slim AS deps
WORKDIR /app

# Install dependencies from app-local package manifest.
COPY package*.json ./
RUN npm install --no-audit --no-fund

FROM node:24-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

RUN groupadd -r nodejs && useradd -r -g nodejs nestjs

# Runtime needs dist plus Prisma schema/migrations and installed modules.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules ./node_modules

USER nestjs

EXPOSE 3002

CMD ["npm", "run", "start:prod"]
