FROM node:20 AS builder

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .

RUN mkdir -p /app/build && npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
