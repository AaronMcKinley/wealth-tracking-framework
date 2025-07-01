FROM cypress/included:13.11.0

WORKDIR /app

RUN apt-get update && apt-get install -y zip && apt-get clean

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx cypress verify

CMD ["npx", "cypress", "run", "--config-file=cypress.config.js"]
