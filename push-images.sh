#!/bin/bash
set -e

REGISTRY="registry.gitlab.com/wealth-tracking-framework/wealth-tracking-framework"
GITLAB_USER="aaron09912"
GITLAB_PAT="${GITLAB_PAT:-}"

SERVICES=("wtf-node" "wtf-react")

if [ -z "$GITLAB_PAT" ]; then
  echo "ERROR: GITLAB_PAT is not set"
  echo "Run: export GITLAB_PAT=<your-token>"
  exit 1
fi

echo "$GITLAB_PAT" | docker login "$REGISTRY" -u "$GITLAB_USER" --password-stdin

if ! docker buildx version >/dev/null 2>&1; then
  docker buildx create --name localbuilder --use
fi

for SERVICE in "${SERVICES[@]}"; do
  docker buildx build \
    --platform linux/amd64 \
    -t "$REGISTRY/$SERVICE:latest" \
    "$SERVICE" \
    --push
done

echo "All images built and pushed successfully"
