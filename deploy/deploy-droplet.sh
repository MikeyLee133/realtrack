#!/usr/bin/env bash
# Build the app and sync it to the Droplet's web root. Edit the three vars
# below, then run:  ./deploy/deploy-droplet.sh
set -euo pipefail

DROPLET_USER="root"                 # the SSH user on your droplet
DROPLET_HOST="143.198.149.134"      # your droplet IP (or realtrack.mikeylee.io once DNS is live)
REMOTE_DIR="/var/www/realtrack"     # must match `root` in the nginx config

cd "$(dirname "$0")/.."
echo "Building…"
npm run build

echo "Uploading dist/ → ${DROPLET_USER}@${DROPLET_HOST}:${REMOTE_DIR}"
rsync -avz --delete dist/ "${DROPLET_USER}@${DROPLET_HOST}:${REMOTE_DIR}/"

echo "Done. https://realtrack.mikeylee.io"
