#!/bin/bash
set -e

echo "Restoring latest WTF backups..."

# Jenkins
jenkins_backup=$(ls -t /opt/backups/jenkins/jenkins_backup_*.tar.gz | head -n 1)
docker run --rm \
  -v wealth-tracking-framework_jenkins_data:/data \
  -v /opt/backups/jenkins:/backup \
  alpine \
  sh -c "rm -rf /data/* && tar xzf /backup/$(basename "$jenkins_backup") -C /data"
echo "Jenkins restore done."

# Postgres
source /opt/wealth-tracking-framework/.env
pg_backup=$(ls -t /opt/backups/postgres/postgres_backup_*.sql | head -n 1)

docker exec -i wtf-postgres psql -U "$PGUSER" -c "DROP DATABASE IF EXISTS \"$PGDATABASE\";"
docker exec -i wtf-postgres psql -U "$PGUSER" -c "CREATE DATABASE \"$PGDATABASE\";"
docker exec -i wtf-postgres psql -U "$PGUSER" -d "$PGDATABASE" < "$pg_backup"

echo "Postgres restore done."
echo "Restore complete."