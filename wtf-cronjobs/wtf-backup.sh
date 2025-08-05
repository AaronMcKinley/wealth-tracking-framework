#!/bin/bash
timestamp=$(date +%Y%m%d_%H%M)
jenkins_dir="/opt/backups/jenkins"
postgres_dir="/opt/backups/postgres"
mkdir -p "$jenkins_dir" "$postgres_dir"

echo "[BACKUP] Starting WTF backups at $timestamp..."

# Jenkins backup
docker run --rm \
  -v wealth-tracking-framework_jenkins_data:/data \
  -v "$jenkins_dir:/backup" \
  alpine \
  tar czf "/backup/jenkins_backup_$timestamp.tar.gz" -C /data .

echo "[JENKINS BACKUP] Saved: $jenkins_dir/jenkins_backup_$timestamp.tar.gz"

# Postgres backup
source /opt/wealth-tracking-framework/.env

docker exec wtf-postgres pg_dump -U "$PGUSER" -d "$PGDATABASE" > "$postgres_dir/postgres_backup_$timestamp.sql"

echo "[POSTGRES BACKUP] Saved: $postgres_dir/postgres_backup_$timestamp.sql"
