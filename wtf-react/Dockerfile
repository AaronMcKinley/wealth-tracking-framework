FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL $REACT_APP_API_URL

RUN npm run build

FROM busybox AS export
COPY --from=builder /app/build /build
