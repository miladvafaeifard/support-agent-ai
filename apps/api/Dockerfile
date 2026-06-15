FROM node:22-alpine AS base
RUN corepack enable pnpm
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @support-agent/api build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/main.js"]
