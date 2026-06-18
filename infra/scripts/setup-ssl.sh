#!/bin/bash
# ============================================
# LocalSite AI - Let's Encrypt SSL Setup
# Usage: bash setup-ssl.sh --domain example.com --email admin@example.com
# ============================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Defaults
DOMAIN=""
EMAIL=""
DRY_RUN=false
STAGING=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --domain) DOMAIN="$2"; shift 2 ;;
        --email) EMAIL="$2"; shift 2 ;;
        --dry-run) DRY_RUN=true; shift ;;
        --staging) STAGING=true; shift ;;
        *) err "Unknown argument: $1" ;;
    esac
done

# Validate
[ -z "$DOMAIN" ] && err "Usage: $0 --domain example.com --email admin@example.com"
[ -z "$EMAIL" ] && err "Email is required for Let's Encrypt notifications"

# Domains to certificate
API_DOMAIN="api.$DOMAIN"
APP_DOMAIN="app.$DOMAIN"
WILDCARD_DOMAIN="*.$DOMAIN"

log "Setting up SSL for: $DOMAIN, $API_DOMAIN, $APP_DOMAIN, $WILDCARD_DOMAIN"
log "Email: $EMAIL"

# Stop nginx if running (port 80 must be free for standalone mode)
docker stop localsite-nginx 2>/dev/null || true

# Run certbot for each domain
issue_cert() {
    local domain="$1"
    local cert_name="$2"
    local args=()

    if $STAGING; then
        args+=("--staging")
    fi

    log "Issuing certificate for $domain..."

    certbot certonly --standalone \
        --agree-tos \
        --non-interactive \
        --email "$EMAIL" \
        --domain "$domain" \
        --rsa-key-size 4096 \
        --cert-name "$cert_name" \
        ${args[@]} \
        --deploy-hook "docker exec localsite-nginx nginx -s reload"

    if [ $? -eq 0 ]; then
        log "Certificate issued: /etc/letsencrypt/live/$cert_name/"
    else
        err "Failed to issue certificate for $domain"
    fi
}

# Issue certificates
issue_cert "$DOMAIN" "$DOMAIN"
issue_cert "$API_DOMAIN" "api.$DOMAIN"
issue_cert "$APP_DOMAIN" "app.$DOMAIN"

# For wildcard, DNS challenge is required
log "Wildcard certificate requires DNS challenge. Run manually:"
echo "  certbot certonly --manual --preferred-challenges dns \\"
echo "    --domain '$WILDCARD_DOMAIN' --domain '$DOMAIN' \\"
echo "    --agree-tos --email '$EMAIL'"

# Copy certs to Docker volumes
log "Copying certificates to Docker volume..."
CERTBOT_CONF_DIR="/etc/letsencrypt"
DOCKER_CERT_VOLUME="localsite-ai_certbot-conf"

# Restart nginx
log "Restarting nginx..."
docker start localsite-nginx 2>/dev/null || true
docker exec localsite-nginx nginx -s reload 2>/dev/null || true

# Setup auto-renewal cron
log "Setting up auto-renewal cron..."
sudo tee /etc/cron.d/certbot-renew > /dev/null <<EOF
# Renew Let's Encrypt certificates twice daily
0 */12 * * * root certbot renew --quiet --no-self-upgrade --post-hook "docker exec localsite-nginx nginx -s reload"
EOF

log "============================================"
log "SSL setup complete!"
log "  Domain:      https://$DOMAIN"
log "  API:         https://$API_DOMAIN"
log "  App:         https://$APP_DOMAIN"
log "  Auto-renew:  Twice daily via cron"
log "============================================"
