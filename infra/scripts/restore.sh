#!/bin/bash
# ============================================
# LocalSite AI - Restore from Backup
# Usage: bash restore.sh <backup-file.tar.gz>
# ============================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

RESTORE_FILE="${1:-}"
MONGO_CONTAINER="${MONGO_CONTAINER:-localsite-mongodb}"
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-}"
MONGO_DB="${MONGO_DB:-localsite_ai}"
MONGO_URI="${MONGO_URI:-mongodb://$MONGO_USER:$MONGO_PASSWORD@localhost:27017/$MONGO_DB?authSource=admin}"
RESTORE_DIR="/tmp/localsite-restore-$(date +%s)"

# Validate
[ -z "$RESTORE_FILE" ] && err "Usage: $0 <backup-file.tar.gz>"
[ ! -f "$RESTORE_FILE" ] && err "Backup file not found: $RESTORE_FILE"

log "Starting restore from: $RESTORE_FILE"

# Extract
mkdir -p "$RESTORE_DIR"
tar xzf "$RESTORE_FILE" -C "$RESTORE_DIR"

# Find extracted directory
EXTRACTED_DIR=$(find "$RESTORE_DIR" -maxdepth 1 -type d | tail -1)
[ -z "$EXTRACTED_DIR" ] && err "No backup data found in archive"

log "Extracted to: $EXTRACTED_DIR"

# Confirmation
echo ""
echo -e "${YELLOW}⚠ WARNING: This will overwrite the current database!${NC}"
read -p "Are you sure you want to continue? (type 'RESTORE'): " CONFIRM
if [ "$CONFIRM" != "RESTORE" ]; then
    log "Restore cancelled"
    rm -rf "$RESTORE_DIR"
    exit 0
fi

# Restore MongoDB
if [ -d "$EXTRACTED_DIR/mongodb" ]; then
    log "Restoring MongoDB..."
    MONGODUMP_DIR=$(find "$EXTRACTED_DIR/mongodb" -maxdepth 1 -type d | tail -1)

    if [ -n "$MONGODUMP_DIR" ] && [ -d "$MONGODUMP_DIR" ]; then
        if command -v mongorestore &>/dev/null; then
            mongorestore \
                --uri="$MONGO_URI" \
                --dir="$MONGODUMP_DIR" \
                --drop \
                --gzip
        else
            docker exec -i "$MONGO_CONTAINER" mongorestore \
                --uri="$MONGO_URI" \
                --drop \
                --gzip \
                --archive < "$EXTRACTED_DIR/mongodb/dump.archive"
        fi
        log "MongoDB restore complete"
    fi
fi

# Restore files
if [ -d "$EXTRACTED_DIR/files" ]; then
    log "Restoring application files..."
    docker cp "$EXTRACTED_DIR/files/uploads/." localsite-backend:/app/uploads/ 2>/dev/null || true
    log "Files restored"
fi

# Cleanup
rm -rf "$RESTORE_DIR"
log "========================================"
log "Restore completed from: $RESTORE_FILE"
log "Restarting services..."
docker restart localsite-backend localsite-worker || true
log "========================================"
