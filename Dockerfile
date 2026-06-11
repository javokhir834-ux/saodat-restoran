# ============================================================
#  Saodat Restoran — bitta image (frontend + backend)
#  Muallif: Ibrayimov Javohir
#  Render / Railway / Fly — hammasi uchun mos.
# ============================================================

# ---- 1-bosqich: frontendni build qilamiz ----
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000
COPY frontend/ ./
RUN npm run build

# ---- 2-bosqich: backend + tayyor frontend ----
FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000
COPY backend/ ./
RUN npx prisma generate
# Frontend build natijasini backend ichidagi public/ ga ko'chiramiz
COPY --from=frontend /app/frontend/dist ./public

ENV NODE_ENV=production
EXPOSE 5000

# Avval bazaga migratsiyalarni qo'llaymiz, keyin serverni ishga tushiramiz
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
