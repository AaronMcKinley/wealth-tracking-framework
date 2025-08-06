#!/bin/bash
set -e

# Volumes you want to preserve (edit as needed)
KEEP_VOLUMES=("jenkins_data" "postgres_data")

echo "Stopping and removing ALL containers..."
docker ps -aq | xargs -r docker stop
docker ps -aq | xargs -r docker rm -f

echo "Removing ALL images..."
docker images -aq | xargs -r docker rmi -f

echo "Removing ALL networks (except bridge/host/none)..."
docker network ls -q | while read netid; do
  netname=$(docker network inspect --format='{{.Name}}' "$netid")
  if [[ "$netname" != "bridge" && "$netname" != "host" && "$netname" != "none" ]]; then
    docker network rm "$netid"
  fi
done

echo "Removing ALL volumes EXCEPT: ${KEEP_VOLUMES[*]}"
for volume in $(docker volume ls -q); do
  skip=false
  for keep in "${KEEP_VOLUMES[@]}"; do
    if [[ "$volume" == "$keep" ]]; then
      skip=true
      break
    fi
  done
  if [ "$skip" = false ]; then
    docker volume rm "$volume"
  else
    echo "Preserving volume: $volume"
  fi
done

echo "Pruning Docker builder cache..."
docker builder prune -af

echo "Docker system clean-down complete!"
