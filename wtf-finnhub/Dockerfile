FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN echo "---- WORKDIR ----" && pwd
RUN echo "---- Directory Listing ----" && ls -l
RUN echo "---- tsconfig.json ----" && cat tsconfig.json
RUN echo "---- find tsconfig ----" && find . -iname "tsconfig*.json"

RUN npx tsc --project tsconfig.json --showConfig

RUN npm install -g typescript

RUN npx tsc --project tsconfig.json fetchWtfStocks.ts

CMD ["node", "fetchWtfStocks.js"]
