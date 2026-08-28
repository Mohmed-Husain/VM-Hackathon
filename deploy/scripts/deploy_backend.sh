#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/evisa/VM-Hackathon}"
SERVICE_NAME="${SERVICE_NAME:-evisa-backend}"
DEPLOY_USER="${DEPLOY_USER:-evisa}"
DEPLOY_GROUP="${DEPLOY_GROUP:-www-data}"
RUNNER_WORKSPACE="${GITHUB_WORKSPACE:-$(pwd)}"

sudo mkdir -p "${APP_DIR}"
sudo rsync -a --delete \
  --exclude ".git" \
  --exclude ".github" \
  --exclude "frontend/node_modules" \
  --exclude "frontend/.next" \
  --exclude "backend/__pycache__" \
  --exclude "backend/app/__pycache__" \
  --exclude ".venv" \
  "${RUNNER_WORKSPACE}/" "${APP_DIR}/"
sudo chown -R "${DEPLOY_USER}:${DEPLOY_GROUP}" "${APP_DIR}"

cd "${APP_DIR}"

if [ ! -d ".venv" ]; then
  sudo -u "${DEPLOY_USER}" python3 -m venv .venv
fi

sudo -u "${DEPLOY_USER}" .venv/bin/pip install --upgrade pip
sudo -u "${DEPLOY_USER}" .venv/bin/pip install -r backend/requirements.txt

cd backend
sudo -u "${DEPLOY_USER}" ../.venv/bin/python -m alembic upgrade head
cd ..

sudo install -D -m 0644 deploy/systemd/evisa-backend.service /etc/systemd/system/evisa-backend.service
sudo install -D -m 0644 deploy/nginx/backend.evisa.kartik-gupta.site.conf /etc/nginx/sites-available/backend.evisa.kartik-gupta.site.conf
sudo mkdir -p /etc/nginx/sites-enabled /etc/evisa
sudo ln -sfn /etc/nginx/sites-available/backend.evisa.kartik-gupta.site.conf /etc/nginx/sites-enabled/backend.evisa.kartik-gupta.site.conf

if [ ! -f /etc/evisa/backend.env ]; then
  echo "Missing /etc/evisa/backend.env. Copy deploy/env/backend.env.example and fill in real values." >&2
  exit 1
fi

sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"
sudo systemctl restart nginx
