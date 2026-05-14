#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

backup_dir="${1:-}"

if [ -z "${backup_dir}" ] || [ ! -d "${backup_dir}" ]; then
  echo "Usage: scripts/restore-local.sh backups/YYYYMMDDTHHMMSSZ" >&2
  exit 1
fi

if [ ! -f "${backup_dir}/postgres.sql" ]; then
  echo "Missing ${backup_dir}/postgres.sql" >&2
  exit 1
fi

echo "### Restoring PostgreSQL from ${backup_dir}/postgres.sql"
docker compose exec -T postgres psql -U "${POSTGRES_USER:-zuidlaren}" -d "${POSTGRES_DB:-zuidlaren_agenda}" < "${backup_dir}/postgres.sql"

if [ -f "${backup_dir}/media-uploads.tar.gz" ]; then
  echo "### Restoring uploaded media from ${backup_dir}/media-uploads.tar.gz"
  docker compose run --rm --no-deps web tar -xzf - -C /app/public < "${backup_dir}/media-uploads.tar.gz"
fi

echo "### Restore complete"
