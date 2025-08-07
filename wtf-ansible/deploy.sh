#!/bin/bash
set -e

if [ -z "$ANSIBLE_VAULT_PASSWORD" ]; then
  echo "ANSIBLE_VAULT_PASSWORD is not set."
  exit 1
fi

echo "$ANSIBLE_VAULT_PASSWORD" > /tmp/.vault_pass.txt

ansible-playbook /app/start-on-server.yml \
  --inventory /app/inventory \
  --vault-password-file /tmp/.vault_pass.txt

rm -f /tmp/.vault_pass.txt
