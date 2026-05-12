# Architecture — Zuidlaren Agenda

Development:
Local development on Ubuntu laptop.

Production:
Docker Compose deployment on the production server.

Production folder:
/opt/apps/zuidlaren-agenda

CPU policy:
Production container should be pinned to CPU cores 0-1.

Docker Compose setting:
cpuset: "0-1"

Data:
Persistent data should be mounted as:
./data:/data

Secrets:
Use .env locally and on production.
Never commit .env.
