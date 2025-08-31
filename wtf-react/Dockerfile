# Stage 1: Build React app
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Pass API URL at build time (used by React)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL $REACT_APP_API_URL

RUN npm run build

# Stage 2: Export static build artifacts
FROM busybox AS export
COPY --from=builder /app/build /build
