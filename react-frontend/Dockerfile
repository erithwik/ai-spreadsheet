FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 8080

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
