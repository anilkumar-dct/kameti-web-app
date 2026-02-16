# ----- Base Image -----
FROM node:20-alpine

# ----- Work Directory -----
WORKDIR /app

# 👉 Activates Corepack that already comes with Node.js.
# 👉 Lets you use pnpm without installing it globally.
# 👉 Ensures the package manager version stays consistent across machines and builds.
# 👉 Keeps your Docker image smaller and cleaner.
RUN corepack enable

# ----- Copied package.json and pnpm-lock.yaml -----
COPY package.json pnpm-lock.yaml ./

# ----- Install Dependencies -----
RUN pnpm install --frozen-lockfile

# ----- Copy Source Code -----
COPY . .

# ----- Build Application -----
RUN pnpm build

# Run stage
CMD ["pnpm", "start"]


# -------- Production Stage --------
FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/main.js"]
