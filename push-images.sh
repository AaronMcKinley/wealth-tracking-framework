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

echo "Stopping and removing all running containers..."
docker compose down

echo "Pulling latest images from $REGISTRY..."
docker compose pull

echo "Pruning unused Docker images (optional cleanup)..."
docker image prune -af

echo "Starting up containers..."
docker compose up -d

echo "Deployment complete!"
docker compose ps
