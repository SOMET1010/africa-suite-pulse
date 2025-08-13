# Multi-stage build pour AfricaSuite
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments for configuration
ARG NODE_ENV=production
ARG DEPLOYMENT_MODE=cloud
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY

# Environment variables
ENV NODE_ENV=$NODE_ENV
ENV DEPLOYMENT_MODE=$DEPLOYMENT_MODE
ENV VITE_SUPABASE_URL=$SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Add entrypoint script for dynamic configuration
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Use entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]