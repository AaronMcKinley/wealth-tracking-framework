#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

log "Sleeping for 180 seconds (3 minutes) before starting deployment..."
sleep 180

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
