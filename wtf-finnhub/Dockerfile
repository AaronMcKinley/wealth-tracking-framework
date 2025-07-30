FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN echo "---- WORKDIR ----" && pwd
RUN echo "---- Directory Listing ----" && ls -l
RUN echo "---- tsconfig.json ----" && cat tsconfig.json
RUN echo "---- find tsconfig ----" && find . -iname "tsconfig*.json"
RUN grep exclude tsconfig.json || echo "No exclude found"
RUN head -20 tsconfig.json
RUN npx tsc --project tsconfig.json --showConfig | grep exclude || echo "No exclude in showConfig"
RUN ls -l /app
RUN ls -l /app/*.ts || echo "No .ts files found"

RUN npm install -g typescript

RUN npx tsc --project tsconfig.json

CMD ["node", "fetchWtfStocks.js"]
