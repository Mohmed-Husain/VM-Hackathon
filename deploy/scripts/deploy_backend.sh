#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/VM-Hackathon}"
BRANCH="${BRANCH:-main}"
SERVICE_NAME="${SERVICE_NAME:-evisa-backend}"
PIP_CACHE_DIR="${PIP_CACHE_DIR:-/home/ubuntu/.cache/pip}"
REQUIREMENTS_FILE="backend/requirements.txt"
REQUIREMENTS_HASH_FILE=".venv/.backend-requirements.sha256"
VENV_CREATED=0

mkdir -p "${PIP_CACHE_DIR}"

cd "${APP_DIR}"
git config --global --add safe.directory "${APP_DIR}" || true
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

if [ ! -f ".env" ]; then
  echo "Missing ${APP_DIR}/.env. Create the server environment file before deploying." >&2
  exit 1
fi

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  VENV_CREATED=1
fi

if [ "${VENV_CREATED}" -eq 1 ]; then
  PIP_CACHE_DIR="${PIP_CACHE_DIR}" .venv/bin/python -m pip install --upgrade pip wheel
fi

CURRENT_REQUIREMENTS_HASH="$(sha256sum "${REQUIREMENTS_FILE}" | awk '{print $1}')"
PREVIOUS_REQUIREMENTS_HASH=""

if [ -f "${REQUIREMENTS_HASH_FILE}" ]; then
  PREVIOUS_REQUIREMENTS_HASH="$(cat "${REQUIREMENTS_HASH_FILE}")"
fi

if [ "${CURRENT_REQUIREMENTS_HASH}" != "${PREVIOUS_REQUIREMENTS_HASH}" ]; then
  PIP_CACHE_DIR="${PIP_CACHE_DIR}" .venv/bin/python -m pip install \
    --upgrade-strategy only-if-needed \
    -r "${REQUIREMENTS_FILE}"
  mkdir -p "$(dirname "${REQUIREMENTS_HASH_FILE}")"
  printf '%s' "${CURRENT_REQUIREMENTS_HASH}" > "${REQUIREMENTS_HASH_FILE}"
else
  echo "backend/requirements.txt unchanged, skipping pip install."
fi

cd backend
"${APP_DIR}/.venv/bin/python" -m alembic upgrade head
cd ..

sudo install -D -m 0644 deploy/systemd/evisa-backend.service /etc/systemd/system/evisa-backend.service
sudo install -D -m 0644 deploy/nginx/backend.evisa.kartik-gupta.site.conf /etc/nginx/sites-available/backend.evisa.kartik-gupta.site.conf
sudo mkdir -p /etc/nginx/sites-enabled
sudo ln -sfn /etc/nginx/sites-available/backend.evisa.kartik-gupta.site.conf /etc/nginx/sites-enabled/backend.evisa.kartik-gupta.site.conf

sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"
sudo systemctl restart nginx
