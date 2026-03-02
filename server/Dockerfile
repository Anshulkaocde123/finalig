# ─── VNIT IG App — Backend Dockerfile ───
# Multi-stage build for minimal production image

# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only package files first (cache-friendly layer)
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# ── Stage 2: Production image ──
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create uploads directory (writable by appuser)
RUN mkdir -p /app/uploads && chown -R appuser:nodejs /app/uploads

# Switch to non-root user
USER appuser

# Expose the server port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/alive || exit 1

# Start the server
CMD ["node", "server.js"]
