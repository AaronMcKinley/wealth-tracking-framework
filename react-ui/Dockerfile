# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything into the container
COPY . .

# Install dependencies
RUN npm install

# Start the React dev server
CMD ["npm", "start"]

# Open port
EXPOSE 3000
