#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -d ".git" ]; then
  echo "Git repo already exists."
  git status --short
  exit 0
fi

git init
git checkout -b main
git add .
git commit -m "Initial project structure for Zuidlaren Agenda"

git checkout -b dev

echo
echo "### Git initialised."
echo "Next:"
echo "1. Create an empty private GitHub repo named: zuidlaren-agenda"
echo "2. Run:"
echo "   git remote add origin git@github.com:YOUR_GITHUB_USER/zuidlaren-agenda.git"
echo "   git push -u origin main"
echo "   git push -u origin dev"
