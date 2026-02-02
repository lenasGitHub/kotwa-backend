# Build Stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev deps for build)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript to Javascript
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma Client for production
RUN npx prisma generate

# Copy built app from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
