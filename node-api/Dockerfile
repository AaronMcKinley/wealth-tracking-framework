# Use the official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install -g nodemon && npm install

# Start the server (adjust as needed)
CMD ["npm", "run", "dev"]

# Expose backend port
EXPOSE 5000
