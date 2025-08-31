# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code (exclude node_modules)
COPY . .
RUN rm -rf node_modules

# Force rebuild timestamp
RUN echo "Build timestamp: $(date)" > /tmp/build-time

# Install all dependencies including dev dependencies for build
RUN npm ci

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Force rebuild with timestamp
RUN echo "Build time: $(date)" > /tmp/buildtime

# Copy built app and server
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Expose port
EXPOSE 8080

# Run the server
CMD ["node", "server.js"]
