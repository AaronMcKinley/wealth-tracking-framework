#!/bin/bash
set -ex

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
  echo -e "${YELLOW}[DEPLOY]${NC} $1"
}
success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}
error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log "Starting deploy container..."

echo "[DEPLOY] Delaying for 30 seconds before starting deployment..."
python3 -c "import time; print('[DEPLOY] Waiting 30 seconds...'); time.sleep(30)"

log "Starting deployment..."

if [ -z "$ANSIBLE_VAULT_PASSWORD" ]; then
  error "ANSIBLE_VAULT_PASSWORD is not set. Exiting."
  exit 1
fi

log "Vault password found. Writing temporary vault password file..."
echo "$ANSIBLE_VAULT_PASSWORD" > /tmp/.vault_pass.txt

log "Running Ansible playbook..."
ansible-playbook /app/start-on-server.yml \
  --inventory /app/inventory \
  --vault-password-file /tmp/.vault_pass.txt

log "Cleaning up temporary vault password file..."
rm -f /tmp/.vault_pass.txt

success "Deployment completed successfully."
