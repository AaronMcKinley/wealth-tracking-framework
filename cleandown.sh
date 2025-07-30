#!/bin/bash
set -e

echo "Stopping and removing ALL containers..."
docker ps -aq | xargs -r docker stop
docker ps -aq | xargs -r docker rm -f

echo "Removing ALL images..."
docker images -aq | xargs -r docker rmi -f

echo "Removing ALL unused volumes..."
docker volume ls -q | xargs -r docker volume rm

echo "Pruning ALL unused networks..."
docker network prune -f

echo "Docker clean-down complete!"
