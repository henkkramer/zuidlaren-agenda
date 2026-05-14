#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_dir="backups/${timestamp}"
mkdir -p "${backup_dir}"

echo "### Backing up PostgreSQL to ${backup_dir}/postgres.sql"
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-zuidlaren}" -d "${POSTGRES_DB:-zuidlaren_agenda}" > "${backup_dir}/postgres.sql"

echo "### Backing up uploaded media to ${backup_dir}/media-uploads.tar.gz"
docker compose run --rm --no-deps web tar -czf - -C /app/public uploads > "${backup_dir}/media-uploads.tar.gz"

echo "### Backup complete: ${backup_dir}"
