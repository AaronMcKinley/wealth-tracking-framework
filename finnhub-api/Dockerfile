FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "fetchwtfstocks.js"]  # after tsc build
