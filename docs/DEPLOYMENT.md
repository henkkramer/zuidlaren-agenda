# Deployment — Zuidlaren Agenda

Production location:
/opt/apps/zuidlaren-agenda

Expected port:
3090

Manual deployment:

ssh kramer
cd /opt/apps/zuidlaren-agenda
git pull --ff-only
docker compose up -d --build
docker compose ps
docker compose logs --tail=100

Rollback idea:

git checkout v0.1.0
docker compose up -d --build
