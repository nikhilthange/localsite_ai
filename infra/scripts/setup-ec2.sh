#!/bin/bash
# ============================================
# LocalSite AI - AWS EC2 Bootstrap Script
# Run as EC2 User Data or SSH init
# ============================================
set -euo pipefail

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# -------------------------------------------
# Configuration
# -------------------------------------------
APP_USER="${APP_USER:-localsite}"
APP_DIR="${APP_DIR:-/home/$APP_USER/app}"
DOMAIN="${DOMAIN:-localsiteai.com}"
NODE_VERSION="${NODE_VERSION:-20}"
DOCKER_COMPOSE_VERSION="${DOCKER_COMPOSE_VERSION:-v2.29}"

# -------------------------------------------
# System Updates & Packages
# -------------------------------------------
log "Updating system packages..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq
sudo apt-get install -y -qq \
    apt-transport-https ca-certificates curl software-properties-common \
    git make gcc g++ build-essential nginx certbot python3-certbot-nginx \
    htop iotop iftop net-tools jq unzip \
    prometheus-node-exporter \
    fail2ban ufw

# -------------------------------------------
# Create App User
# -------------------------------------------
if ! id -u "$APP_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash -G docker "$APP_USER"
    log "Created user: $APP_USER"
fi

# -------------------------------------------
# Install Node.js
# -------------------------------------------
log "Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt-get install -y -qq nodejs
node --version && npm --version

# -------------------------------------------
# Install Docker
# -------------------------------------------
log "Installing Docker..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker "$APP_USER"
    sudo systemctl enable docker
    sudo systemctl start docker
fi
docker --version

# -------------------------------------------
# Install Docker Compose
# -------------------------------------------
log "Installing Docker Compose..."
if ! command -v docker-compose &>/dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi
docker-compose --version

# -------------------------------------------
# Configure Firewall (UFW)
# -------------------------------------------
log "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable
sudo ufw status verbose

# -------------------------------------------
# Configure Fail2Ban
# -------------------------------------------
log "Configuring Fail2Ban..."
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22

[nginx-http-auth]
enabled = true

[nginx-botsearch]
enabled = true
EOF
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# -------------------------------------------
# Optimize Kernel Parameters
# -------------------------------------------
log "Optimizing kernel parameters..."
sudo tee -a /etc/sysctl.conf > /dev/null <<EOF
# LocalSite AI Production Optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 5
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
vm.swappiness = 10
vm.dirty_ratio = 80
vm.dirty_background_ratio = 5
EOF
sudo sysctl -p

# -------------------------------------------
# Setup Swap
# -------------------------------------------
if [ "$(swapon --show | wc -l)" -eq 0 ]; then
    log "Setting up swap file..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# -------------------------------------------
# Clone / Update Application
# -------------------------------------------
if [ -d "$APP_DIR" ]; then
    log "Updating application..."
    cd "$APP_DIR"
    git pull origin main
else
    log "Cloning application..."
    sudo mkdir -p "$APP_DIR"
    sudo chown "$APP_USER:$APP_USER" "$APP_DIR"
    su - "$APP_USER" -c "git clone https://github.com/anomalyco/saas-website.git $APP_DIR"
fi

# -------------------------------------------
# Setup Environment
# -------------------------------------------
if [ ! -f "$APP_DIR/.env" ]; then
    warn "Creating .env from template. EDIT THIS FILE with real secrets!"
    cp "$APP_DIR/infra/.env.example" "$APP_DIR/.env"
fi

# -------------------------------------------
# Setup Docker Compose
# -------------------------------------------
log "Building and starting Docker services..."
cd "$APP_DIR"
sudo -u "$APP_USER" docker-compose -f infra/docker/docker-compose.yml pull
sudo -u "$APP_USER" docker-compose -f infra/docker/docker-compose.yml up -d --build --remove-orphans

# -------------------------------------------
# Setup SSL (initial)
# -------------------------------------------
log "Setting up SSL certificates..."
bash "$APP_DIR/infra/scripts/setup-ssl.sh" --domain "$DOMAIN" --email "admin@$DOMAIN"

# -------------------------------------------
# Setup Backup Cron
# -------------------------------------------
log "Setting up backup cron jobs..."
sudo tee /etc/cron.d/localsite-backup > /dev/null <<CRON
# DB backup at 2am daily
0 2 * * * $APP_USER bash $APP_DIR/infra/scripts/backup.sh --type full >> /var/log/localsite-backup.log 2>&1
# Health check every 5 minutes
*/5 * * * * $APP_USER bash $APP_DIR/infra/scripts/healthcheck.sh >> /var/log/localsite-health.log 2>&1
CRON
sudo chmod 644 /etc/cron.d/localsite-backup

# -------------------------------------------
# Setup Monitoring
# -------------------------------------------
log "Starting monitoring stack..."
sudo -u "$APP_USER" docker-compose -f infra/docker/docker-compose.monitoring.yml up -d --build

# -------------------------------------------
# Final
# -------------------------------------------
log "==================================="
log "EC2 Setup Complete!"
log "  App:     https://$DOMAIN"
log "  API:     https://api.$DOMAIN"
log "  Grafana: http://$(curl -s http://checkip.amazonaws.com):3000"
log "==================================="
log "Next steps:"
log "  1. Edit $APP_DIR/.env with real secrets"
log "  2. Run: docker-compose -f infra/docker/docker-compose.yml restart"
log "  3. Verify health: curl https://api.$DOMAIN/health"
