FROM cypress/included:13.11.0

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends chromium && \
    ln -sf /usr/bin/chromium /usr/bin/google-chrome && \
    ln -sf /usr/bin/chromium /usr/bin/chromium-browser && \
    rm -rf /var/lib/apt/lists/*

ENV CHROME_EXTRA_LAUNCH_ARGS="--disable-dev-shm-usage --disable-gpu --no-sandbox --disable-software-rasterizer"

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx cypress verify

CMD ["npx", "cypress", "run", "--browser", "chromium", "--e2e"]
