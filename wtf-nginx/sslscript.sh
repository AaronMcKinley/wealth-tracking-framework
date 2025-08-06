#!/bin/bash

set -e

EMAIL="wtf@wealth-tracking-framework.com"
CERT_DOMAINS="-d wealth-tracking-framework.com -d www.wealth-tracking-framework.com -d jenkins.wealth-tracking-framework.com"
CERTBOT_CONF="/opt/wealth-tracking-framework/wtf-nginx/nginx-certbot.conf"
CERTBOT_WEBROOT_VOL="certbot-webroot"
CERTBOT_ETC_VOL="certbot-etc"

docker volume inspect $CERTBOT_WEBROOT_VOL >/dev/null 2>&1 || docker volume create $CERTBOT_WEBROOT_VOL
docker volume inspect $CERTBOT_ETC_VOL >/dev/null 2>&1 || docker volume create $CERTBOT_ETC_VOL

docker run --rm -d \
  --name temp-nginx-cert \
  -p 80:80 \
  -v $CERTBOT_WEBROOT_VOL:/var/www/certbot \
  -v $CERTBOT_CONF:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine

echo "Waiting 2 seconds for nginx to start..."
sleep 2

docker run --rm \
  -v $CERTBOT_ETC_VOL:/etc/letsencrypt \
  -v $CERTBOT_WEBROOT_VOL:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot \
    $CERT_DOMAINS \
    --email $EMAIL --agree-tos --no-eff-email

docker stop temp-nginx-cert

echo "Done! Your certificates should be in the $CERTBOT_ETC_VOL docker volume."
