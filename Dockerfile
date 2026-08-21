# Built ahead of Phase 6 (deploy) needing it, while the app was already
# fresh in context — a multi-stage build so the runtime image doesn't carry
# devDependencies or TypeScript source.

FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3100
ENV PORT=3100
# tsconfig's rootDir is "." (not "src"), so it can also typecheck tests/ —
# that means tsc mirrors the full source tree under dist/, landing the
# entrypoint at dist/src/index.js, not dist/index.js. Verified against the
# actual built image, not assumed.
CMD ["node", "dist/src/index.js"]
