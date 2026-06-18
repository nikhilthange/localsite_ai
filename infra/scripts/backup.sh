#!/bin/bash
# ============================================
# LocalSite AI - Backup Strategy
# Supports: MongoDB dump, file system, S3 sync
# Usage: bash backup.sh [--type full|db|files]
# ============================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# -------------------------------------------
# Configuration
# -------------------------------------------
BACKUP_TYPE="${1:-full}"
BACKUP_DIR="${BACKUP_DIR:-/backups/localsite-ai}"
S3_BUCKET="${S3_BUCKET:-s3://localsite-ai-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
MONGO_CONTAINER="${MONGO_CONTAINER:-localsite-mongodb}"
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-}"
MONGO_DB="${MONGO_DB:-localsite_ai}"
DOCKER_COMPOSE_DIR="${DOCKER_COMPOSE_DIR:-/home/localsite/app/infra/docker}"

# -------------------------------------------
# Prerequisites
# -------------------------------------------
mkdir -p "$BACKUP_DIR"
command -v aws >/dev/null 2>&1 || pip3 install awscli --quiet
command -v mongosh >/dev/null 2>&1 || warn "mongosh not found, using docker exec"

log "Starting backup: type=$BACKUP_TYPE timestamp=$TIMESTAMP"
log "Backup path: $BACKUP_PATH"

# -------------------------------------------
# Backup MongoDB
# -------------------------------------------
backup_mongodb() {
    local dump_path="$BACKUP_PATH/mongodb"
    mkdir -p "$dump_path"

    log "Dumping MongoDB database: $MONGO_DB"

    if command -v mongosh &>/dev/null; then
        mongodump \
            --uri="mongodb://$MONGO_USER:$MONGO_PASSWORD@localhost:27017/$MONGO_DB?authSource=admin" \
            --out="$dump_path" \
            --gzip
    else
        docker exec "$MONGO_CONTAINER" mongodump \
            --username="$MONGO_USER" \
            --password="$MONGO_PASSWORD" \
            --authenticationDatabase=admin \
            --db="$MONGO_DB" \
            --gzip \
            --archive > "$dump_path/dump.archive"
    fi

    local size=$(du -sh "$dump_path" | cut -f1)
    log "MongoDB backup complete: $size"
}

# -------------------------------------------
# Backup Files (Uploads, Configs)
# -------------------------------------------
backup_files() {
    local files_path="$BACKUP_PATH/files"
    mkdir -p "$files_path"

    log "Backing up application files..."

    # Backend uploads
    if docker container inspect localsite-backend &>/dev/null; then
        docker cp localsite-backend:/app/uploads "$files_path/uploads" 2>/dev/null || true
    fi

    # Docker volumes
    docker run --rm -v localsite-ai_mongodb-data:/data -v "$files_path:/backup" alpine \
        tar czf /backup/mongodb-volume.tar.gz -C /data . 2>/dev/null || true

    docker run --rm -v localsite-ai_redis-data:/data -v "$files_path:/backup" alpine \
        tar czf /backup/redis-volume.tar.gz -C /data . 2>/dev/null || true

    # Docker compose configs
    cp -r "$DOCKER_COMPOSE_DIR/../nginx" "$files_path/nginx" 2>/dev/null || true

    log "Files backup complete"
}

# -------------------------------------------
# Compress Backup
# -------------------------------------------
compress_backup() {
    log "Compressing backup..."
    cd "$BACKUP_DIR"
    tar czf "${TIMESTAMP}.tar.gz" "$TIMESTAMP"
    rm -rf "$TIMESTAMP"

    local size=$(du -h "${TIMESTAMP}.tar.gz" | cut -f1)
    log "Compressed backup: $size"
}

# -------------------------------------------
# Upload to S3
# -------------------------------------------
upload_to_s3() {
    local backup_file="$BACKUP_DIR/${TIMESTAMP}.tar.gz"

    if [ ! -f "$backup_file" ]; then
        warn "Backup file not found, skipping S3 upload"
        return
    fi

    log "Uploading to S3: $S3_BUCKET"
    aws s3 cp "$backup_file" "$S3_BUCKET/$TIMESTAMP.tar.gz" --storage-class STANDARD_IA

    if [ $? -eq 0 ]; then
        log "Upload complete"
        # Clean up local backup after successful upload
        rm -f "$backup_file"
    else
        warn "S3 upload failed, backup kept locally at $backup_file"
    fi
}

# -------------------------------------------
# Cleanup Old Backups
# -------------------------------------------
cleanup_old() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."

    # Local cleanup
    find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

    # S3 cleanup
    aws s3 ls "$S3_BUCKET/" | while read -r line; do
        local date=$(echo "$line" | awk '{print $1}')
        local key=$(echo "$line" | awk '{print $4}')
        if [[ "$date" < $(date -d "-$RETENTION_DAYS days" +%Y-%m-%d) ]]; then
            aws s3 rm "$S3_BUCKET/$key"
            log "Deleted old backup: $key"
        fi
    done
}

# -------------------------------------------
# Execute
# -------------------------------------------
case "$BACKUP_TYPE" in
    full)
        backup_mongodb
        backup_files
        compress_backup
        upload_to_s3
        cleanup_old
        ;;
    db)
        backup_mongodb
        compress_backup
        upload_to_s3
        ;;
    files)
        backup_files
        compress_backup
        upload_to_s3
        ;;
    *)
        err "Usage: $0 [--type full|db|files]"
        ;;
esac

log "Backup completed successfully!"
