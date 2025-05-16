FROM node:20

WORKDIR /app

COPY fetchWtfCoins.ts .
COPY coinList.ts .
COPY tsconfig.json .

# Install runtime dependencies (including pg and dotenv)
RUN npm install typescript ts-node axios pg dotenv @types/node @types/pg @types/dotenv

# Create data folder for JSON output
RUN mkdir -p ./data

# Run the script every 10 minutes
CMD ["sh", "-c", "while true; do npx ts-node fetchWtfCoins.ts; sleep 600; done"]
