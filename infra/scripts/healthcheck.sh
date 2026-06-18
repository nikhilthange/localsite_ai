#!/bin/bash
# ============================================
# LocalSite AI - Health Check Script
# Runs every 5 minutes via cron
# Reports to Slack on failure
# ============================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; }

DOMAIN="${DOMAIN:-localsiteai.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
DOCKER_COMPOSE_DIR="${DOCKER_COMPOSE_DIR:-/home/localsite/app/infra/docker}"

send_slack_alert() {
    local message="$1"
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 *LocalSite AI Health Alert*\\n$message\"}" \
            "$SLACK_WEBHOOK" > /dev/null 2>&1
    fi
}

FAILURES=0

# ---- API Health ----
check_api() {
    local url="https://api.$DOMAIN/api/health"
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
        log "API health: OK (200)"
    else
        err "API health: FAILED ($status)"
        send_slack_alert "API health check failed for $url (HTTP $status)"
        FAILURES=$((FAILURES + 1))
    fi
}

# ---- App Frontend ----
check_app() {
    local url="https://app.$DOMAIN"
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    if [ "$status" = "200" ] || [ "$status" = "301" ] || [ "$status" = "302" ]; then
        log "App health: OK ($status)"
    else
        err "App health: FAILED ($status)"
        send_slack_alert "App frontend health check failed for $url (HTTP $status)"
        FAILURES=$((FAILURES + 1))
    fi
}

# ---- Docker Containers ----
check_containers() {
    local compose_dir="$DOCKER_COMPOSE_DIR"
    if [ -d "$compose_dir" ]; then
        local unhealthy
        unhealthy=$(cd "$compose_dir" && docker compose ps --format "{{.Name}}\t{{.Status}}" 2>/dev/null | grep -v "Up" || true)
        if [ -n "$unhealthy" ]; then
            err "Unhealthy containers:"
            echo "$unhealthy" | while read -r line; do
                err "  $line"
            done
            send_slack_alert "Unhealthy Docker containers detected:\n\`\`\`\n$unhealthy\n\`\`\`"
            FAILURES=$((FAILURES + 1))
        else
            log "All containers: Up"
        fi
    fi
}

# ---- Disk Usage ----
check_disk() {
    local usage
    usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$usage" -gt 90 ]; then
        err "Disk usage: ${usage}% (CRITICAL)"
        send_slack_alert "Disk usage is critical at ${usage}% on $(hostname)"
        FAILURES=$((FAILURES + 1))
    elif [ "$usage" -gt 80 ]; then
        warn "Disk usage: ${usage}% (WARNING)"
    else
        log "Disk usage: ${usage}%"
    fi
}

# ---- Main ----
log "Running health checks for $DOMAIN..."

check_api
check_app
check_containers
check_disk

if [ $FAILURES -eq 0 ]; then
    log "All health checks passed"
else
    err "$FAILURES health check(s) failed"
fi

exit $FAILURES
