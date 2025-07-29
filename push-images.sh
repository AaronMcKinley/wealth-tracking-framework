#!/bin/bash
set -e

CLEAN=false

# Parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    -c|--clean)
      CLEAN=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

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

if [ "$CLEAN" = true ]; then
  echo "Stopping all containers and pruning system..."
  docker compose down
  docker system prune -af --volumes
  echo "Cleanup complete."
  exit 0
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
  echo "Pushing image for $service..."
  docker push "$REGISTRY/$service:latest"
done

echo "All images pushed successfully!"
