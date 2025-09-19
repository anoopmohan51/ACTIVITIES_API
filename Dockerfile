FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm config adjustments
RUN npm config set registry http://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm install --no-audit --no-fund && \
    npm install multer@1.4.5-lts.1 @types/multer@1.4.11 --no-audit --no-fund

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application (use nodemon in development)
CMD ["npm", "run", "dev"]
