# Use official Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port the service runs on
EXPOSE 5000

# Start the service using compiled JavaScript
CMD ["node", "dist/server.js"]
