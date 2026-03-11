# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source code
COPY . .

# Expose backend port
EXPOSE 4000

# Correct CMD syntax
CMD ["node", "server.js"]
