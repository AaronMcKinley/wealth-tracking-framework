FROM node:20

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
