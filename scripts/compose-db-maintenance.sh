#!/usr/bin/env sh
set -eu

command="${1:-all}"
database_url="${DOCKER_DATABASE_URL:-postgresql://zuidlaren:zuidlaren@postgres:5432/zuidlaren_agenda?schema=public}"

run_in_maintenance_container() {
  docker compose run --rm --no-deps \
    -v "$PWD:/src:ro" \
    -e NODE_ENV=development \
    -e DATABASE_URL="$database_url" \
    --entrypoint sh web -lc "$1"
}

setup_workspace='
set -eu
mkdir -p /tmp/maintenance
cp -R /src/prisma /src/lib /tmp/maintenance/
if [ -d /src/scripts ]; then cp -R /src/scripts /tmp/maintenance/; fi
cp /src/package.json /src/package-lock.json /src/prisma.config.ts /tmp/maintenance/
cd /tmp/maintenance
npm ci --include=dev
npx prisma generate
'

case "$command" in
  seed)
    run_in_maintenance_container "$setup_workspace
npx prisma db push --schema prisma/schema.prisma
npx tsx prisma/seed.ts"
    ;;
  admin)
    run_in_maintenance_container "$setup_workspace
npx tsx scripts/ensure-admin.ts"
    ;;
  all)
    run_in_maintenance_container "$setup_workspace
npx prisma db push --schema prisma/schema.prisma
npx tsx prisma/seed.ts
npx tsx scripts/ensure-admin.ts"
    ;;
  *)
    echo "Usage: scripts/compose-db-maintenance.sh [seed|admin|all]" >&2
    exit 2
    ;;
esac
