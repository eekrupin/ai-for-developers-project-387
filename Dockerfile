FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

RUN npm --prefix backend ci
RUN npm --prefix frontend ci

COPY backend ./backend
COPY frontend ./frontend

RUN npm --prefix frontend run build
RUN npm --prefix backend run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV FRONTEND_DIST_DIR=frontend/dist

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
RUN npm --prefix backend ci --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 3000

CMD ["node", "backend/dist/index.js"]
