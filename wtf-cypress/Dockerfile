FROM cypress/included:13.11.0

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx cypress verify

CMD ["bash"]