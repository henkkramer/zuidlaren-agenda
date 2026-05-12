#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "### Creating local .env from .env.example"
  cp .env.example .env
fi

echo "### Starting local Docker development for Zuidlaren Agenda"
docker compose up --build
