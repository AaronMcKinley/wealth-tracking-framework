FROM node:20

WORKDIR /app

COPY fetchWtfCoins.ts .
COPY coinList.ts .
COPY tsconfig.json .

RUN npm install typescript ts-node axios pg dotenv @types/node @types/pg @types/dotenv

RUN mkdir -p ./data

CMD ["sh", "-c", "while true; do npx ts-node fetchWtfCoins.ts; sleep 600; done"]
