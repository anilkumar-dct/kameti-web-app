# -------- Base Stage --------
FROM node:20-alpine AS base

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

# -------- Development Stage --------
FROM base AS development

RUN pnpm install

COPY . .

EXPOSE 8000

CMD ["pnpm", "run", "start:dev"]

# -------- Build Stage --------
FROM base AS builder

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# -------- Production Stage --------
FROM node:20-alpine AS production

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/main.js"]
