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
  - run `git pull` inside `/home/ubuntu/VM-Hackathon`
  - run `sudo systemctl ...`
  - run `sudo install ...`
  - run `sudo nginx -t`
- DNS for `backend.evisa.kartik-gupta.site` already points to this server.
- TLS certificates for `backend.evisa.kartik-gupta.site` exist under:
  - `/etc/letsencrypt/live/backend.evisa.kartik-gupta.site/fullchain.pem`
  - `/etc/letsencrypt/live/backend.evisa.kartik-gupta.site/privkey.pem`

## 1. Server layout
```bash
cd /home/ubuntu
ls
# VM-Hackathon  actions-runner
```

The deployment workflow assumes:
- live repository: `/home/ubuntu/VM-Hackathon`
- self-hosted runner: `/home/ubuntu/actions-runner`
- backend venv: `/home/ubuntu/VM-Hackathon/.venv`

## 2. Bootstrap the repository on the server once
```bash
cd /home/ubuntu
git clone <your-repo-url> VM-Hackathon
```

## 3. Create the backend environment file
```bash
cp /home/ubuntu/VM-Hackathon/.env.example /home/ubuntu/VM-Hackathon/.env
vim /home/ubuntu/VM-Hackathon/.env
```

Recommended values:
- `BACKEND_PUBLIC_URL=https://backend.evisa.kartik-gupta.site`
- `AUTO_CREATE_TABLES=false`
- `PAYMENTS_ENABLED=false`

## 4. Install the systemd service
```bash
sudo cp /home/ubuntu/VM-Hackathon/deploy/systemd/evisa-backend.service /etc/systemd/system/evisa-backend.service
sudo systemctl daemon-reload
sudo systemctl enable evisa-backend
```

## 5. Install the nginx site
```bash
sudo cp /home/ubuntu/VM-Hackathon/deploy/nginx/backend.evisa.kartik-gupta.site.conf /etc/nginx/sites-available/backend.evisa.kartik-gupta.site.conf
sudo ln -sfn /etc/nginx/sites-available/backend.evisa.kartik-gupta.site.conf /etc/nginx/sites-enabled/backend.evisa.kartik-gupta.site.conf
sudo nginx -t
sudo systemctl restart nginx
```

## 6. What the workflow does
On every push to `main`, the self-hosted runner will:
1. check out the latest repo
2. move into `/home/ubuntu/VM-Hackathon`
3. run `git fetch` and `git pull --ff-only origin main`
4. create or reuse `/home/ubuntu/VM-Hackathon/.venv`
5. install backend Python dependencies only when `backend/requirements.txt` changed
6. reuse the local pip cache under `/home/ubuntu/.cache/pip`
7. run `alembic upgrade head`
8. reinstall the `systemd` unit and `nginx` site config from the repo
9. validate nginx config
10. restart:
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
- `pip install -r backend/requirements.txt` is skipped when the requirements file hash has not changed.
- If you want the frontend deployed on the same runner next, we can add a second `systemd` service or a static build + nginx site in a follow-up pass.
