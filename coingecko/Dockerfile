# Use official Node.js base image with LTS version
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy only the fetch script and any config (like tsconfig)
COPY fetch.ts .
COPY tsconfig.json .

# Install dependencies
RUN npm install typescript ts-node axios @types/node

# Run fetch.ts every 10 minutes (600 seconds)
CMD ["sh", "-c", "while true; do npx ts-node fetch.ts; sleep 600; done"]
