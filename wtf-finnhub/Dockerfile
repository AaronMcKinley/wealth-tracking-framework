FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm install -g typescript

RUN npx tsc --project tsconfig.json

CMD ["node", "dist/fetchWtfStocks.js"]
