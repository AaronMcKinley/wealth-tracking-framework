FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN echo "----- tsconfig.json -----" && cat tsconfig.json && echo "----------------------"
RUN ls -l

RUN npx tsc --showConfig

RUN npm install -g typescript

RUN npx tsc --project tsconfig.json fetchWtfStocks.ts

CMD ["node", "fetchWtfStocks.js"]
