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

# Install all dependencies including dev dependencies for build
RUN npm ci

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy built app
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Serve the app on port 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
