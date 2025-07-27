#!/bin/bash
set -e

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "ERROR: .env file not found"
  exit 1
fi

REGISTRY="registry.gitlab.com/wealth-tracking-framework/wealth-tracking-framework"
GITLAB_USER="aaron09912"

if [ -z "$GITLAB_TOKEN" ]; then
  echo "ERROR: GITLAB_TOKEN is not set in .env"
  exit 1
fi

echo "$GITLAB_TOKEN" | docker login "$REGISTRY" -u "$GITLAB_USER" --password-stdin

services=(
  "wtf-jenkins"
  "wtf-node"
  "wtf-react"
  "wtf-finnhub"
  "wtf-coingecko"
)

for service in "${services[@]}"; do
  echo "Building amd64 image for $service..."
  docker buildx build --platform linux/amd64 \
    -t "$REGISTRY/$service:latest" \
    ./"$service" --push
done

echo "All amd64 images built and pushed successfully!"
