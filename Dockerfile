FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY svelte.config.js tsconfig.json vite.config.ts ./
COPY src/ src/
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/build/ build/

RUN npm ci --omit=dev && \
    addgroup -S app && adduser -S app -G app && \
    chown -R app:app /app

USER app

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build"]
