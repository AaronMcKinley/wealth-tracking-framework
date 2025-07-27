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

if [ -z "$GITLAB_PAT" ]; then
  echo "ERROR: GITLAB_PAT is not set in .env"
  exit 1
fi

echo "$GITLAB_PAT" | docker login "$REGISTRY" -u "$GITLAB_USER" --password-stdin

docker build -t "$REGISTRY/wtf-node:latest" ./wtf-node
docker push "$REGISTRY/wtf-node:latest"

docker build -t "$REGISTRY/wtf-react:latest" ./wtf-react
docker push "$REGISTRY/wtf-react:latest"

echo "Both images built and pushed successfully"
