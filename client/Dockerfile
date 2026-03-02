# ─── VNIT IG App — Frontend Dockerfile ───
# Multi-stage: build with Node → serve with Nginx

# ── Stage 1: Install deps & build ──
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files (cache-friendly layer)
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Copy source and build
COPY . .

# Set the API base URL at build time (can be overridden via build arg)
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ── Stage 2: Serve with Nginx ──
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Nginx runs as root by default (needed to bind port 80), then drops privileges
CMD ["nginx", "-g", "daemon off;"]
