# Self-Hosted Backend Deployment

## Purpose
Deploy the FastAPI backend on a Linux host with a self-hosted GitHub Actions runner, `systemd`, and `nginx`.

## Files in this repository
- `deploy/systemd/evisa-backend.service`
- `deploy/nginx/backend.evisa.kartik-gupta.site.conf`
- `deploy/env/backend.env.example`
- `.github/workflows/deploy-self-hosted.yml`
- `deploy/scripts/deploy_backend.sh`

## Assumptions
- Your GitHub Actions runner is already registered on the target Linux machine with labels:
  - `self-hosted`
  - `Linux`
  - `X64`
- The runner user can:
  - run `sudo rsync ...`
  - run `sudo systemctl ...`
  - run `sudo install ...`
  - run `sudo nginx -t`
- DNS for `backend.evisa.kartik-gupta.site` already points to this server.
- TLS certificates for `backend.evisa.kartik-gupta.site` exist under:
  - `/etc/letsencrypt/live/backend.evisa.kartik-gupta.site/fullchain.pem`
  - `/etc/letsencrypt/live/backend.evisa.kartik-gupta.site/privkey.pem`

## 1. Create deployment user and folders
```bash
sudo useradd --system --create-home --shell /bin/bash evisa || true
sudo mkdir -p /srv/evisa /etc/evisa
sudo chown -R evisa:www-data /srv/evisa
```

## 2. Bootstrap the repository on the server once
```bash
sudo git clone <your-repo-url> /srv/evisa/VM-Hackathon
sudo chown -R evisa:www-data /srv/evisa/VM-Hackathon
```

## 3. Create the backend environment file
```bash
sudo cp /srv/evisa/VM-Hackathon/deploy/env/backend.env.example /etc/evisa/backend.env
sudo nano /etc/evisa/backend.env
```

Recommended values:
- `BACKEND_PUBLIC_URL=https://backend.evisa.kartik-gupta.site`
- `AUTO_CREATE_TABLES=false`
- `PAYMENTS_ENABLED=false`

## 4. Install the systemd service
```bash
sudo cp /srv/evisa/VM-Hackathon/deploy/systemd/evisa-backend.service /etc/systemd/system/evisa-backend.service
sudo systemctl daemon-reload
sudo systemctl enable evisa-backend
```

## 5. Install the nginx site
```bash
sudo cp /srv/evisa/VM-Hackathon/deploy/nginx/backend.evisa.kartik-gupta.site.conf /etc/nginx/sites-available/backend.evisa.kartik-gupta.site.conf
sudo ln -sfn /etc/nginx/sites-available/backend.evisa.kartik-gupta.site.conf /etc/nginx/sites-enabled/backend.evisa.kartik-gupta.site.conf
sudo nginx -t
sudo systemctl restart nginx
```

## 6. What the workflow does
On every push to `main`, the self-hosted runner will:
1. check out the latest repo
2. sync it into `/srv/evisa/VM-Hackathon`
3. set ownership to `evisa:www-data`
4. create or reuse `/srv/evisa/VM-Hackathon/.venv`
5. install backend Python dependencies as the `evisa` user
6. run `alembic upgrade head`
7. reinstall the `systemd` unit and `nginx` site config from the repo
8. validate nginx config
9. restart:
   - `evisa-backend`
   - `nginx`

## 7. Start the backend once
```bash
sudo systemctl start evisa-backend
sudo systemctl status evisa-backend
```

## 8. Helpful verification commands
```bash
sudo systemctl status evisa-backend
sudo journalctl -u evisa-backend -n 100 --no-pager
sudo nginx -t
curl -I https://backend.evisa.kartik-gupta.site/docs
```

## Notes
- The workflow is intentionally backend-focused. It does not deploy a standalone frontend service.
- The deploy script expects `sudo` access on the self-hosted runner machine.
- If you want the frontend deployed on the same runner next, we can add a second `systemd` service or a static build + nginx site in a follow-up pass.
