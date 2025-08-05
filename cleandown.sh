#!/bin/bash
set -e

echo "Excluding volumes: jenkins_data, postgres_data"
EXCLUDE_VOLUMES=("jenkins_data" "postgres_data")

echo "Stopping and removing ALL containers..."
docker ps -aq | xargs -r docker stop
docker ps -aq | xargs -r docker rm -f

echo "Removing ALL images..."
docker images -aq | xargs -r docker rmi -f

echo "Removing ALL volumes EXCEPT jenkins_data and postgres_data..."
for volume in $(docker volume ls -q); do
  if [[ ! " ${EXCLUDE_VOLUMES[@]} " =~ " ${volume} " ]]; then
    echo "Removing volume: $volume"
    docker volume rm "$volume"
  else
    echo "Skipping volume: $volume"
  fi
done

echo "Pruning ALL unused networks..."
docker network prune -f

echo "Docker clean-down complete! Jenkins and Postgres volumes preserved."
