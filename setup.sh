#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

DATABASE_READY=0

# -----------------------------
# Helper functions
# -----------------------------
log() {
  local level="$1"; shift
  printf '[%s] %s\n' "$level" "$*"
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

ensure_command() {
  local cmd="$1"
  local help_msg="$2"
  if ! command_exists "$cmd"; then
    log ERROR "Missing required command: $cmd"
    log ERROR "$help_msg"
    exit 1
  fi
}

run_npm_install() {
  local directory="$1"
  if [ ! -d "$directory" ]; then
    return
  fi
  if [ ! -f "$directory/package.json" ]; then
    return
  fi
  log INFO "Installing npm dependencies in $directory"
  (cd "$directory" && npm install)
}

create_file_if_missing() {
  local target="$1"
  local contents="$2"
  if [ -f "$target" ]; then
    log INFO "Skipping $target (already exists)"
    return
  fi
  log INFO "Creating $target"
  mkdir -p "$(dirname "$target")"
  printf '%s\n' "$contents" >"$target"
}

wait_for_mysql() {
  local compose_cmd="$1"
  local service_name="$2"
  local root_password="$3"
  local attempts=30
  local delay=2

  log INFO "Waiting for MySQL service ($service_name) to become healthy..."
  for ((i = 1; i <= attempts; i++)); do
    if $compose_cmd exec -T "$service_name" mysqladmin ping -h 127.0.0.1 -uroot "-p${root_password}" --silent >/dev/null 2>&1; then
      log INFO "MySQL is ready"
      return 0
    fi
    sleep "$delay"
  done
  log ERROR "Timed out waiting for MySQL to become available"
  return 1
}

# -----------------------------
# Pre-flight checks
# -----------------------------
ensure_command node "Install Node.js (https://nodejs.org/) and rerun this script."
ensure_command npm "Install npm (https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and rerun this script."

NODE_VERSION="$(node --version | sed 's/^v//')"
REQUIRED_NODE_MAJOR=20
NODE_MAJOR="${NODE_VERSION%%.*}"
if [ "${NODE_MAJOR:-0}" -lt "$REQUIRED_NODE_MAJOR" ]; then
  log ERROR "Node.js v$NODE_VERSION detected. Please upgrade to Node.js v$REQUIRED_NODE_MAJOR or newer."
  exit 1
fi

# -----------------------------
# Install dependencies
# -----------------------------
run_npm_install "$PROJECT_ROOT"
run_npm_install "$PROJECT_ROOT/backend"
run_npm_install "$PROJECT_ROOT/frontend"

# -----------------------------
# Environment configuration
# -----------------------------
DB_NAME="${DB_NAME:-erp_node}"
DB_USER="${DB_USER:-erp_node}"
DB_PASSWORD="${DB_PASSWORD:-erp_node_password}"
DB_PORT="${DB_PORT:-3307}"
DB_HOST="${DB_HOST:-127.0.0.1}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-erp_node_root_password}"
MYSQL_TZ="${MYSQL_TZ:-UTC}"

BACKEND_ENV_CONTENT=$(cat <<EOF2
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_PORT=${DB_PORT}
DB_HOST=${DB_HOST}
PORT=8888
EOF2
)
create_file_if_missing "$PROJECT_ROOT/backend/.env.local" "$BACKEND_ENV_CONTENT"

FRONTEND_ENV_CONTENT=$(cat <<EOF2
VITE_FILE_BASE_URL="http://localhost:8888/"
VITE_BACKEND_SERVER="http://localhost:8888/"
PROD=false
EOF2
)
create_file_if_missing "$PROJECT_ROOT/frontend/.env.local" "$FRONTEND_ENV_CONTENT"

# -----------------------------
# Database (MySQL via Docker)
# -----------------------------
COMPOSE_CMD=""
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command_exists docker-compose; then
  COMPOSE_CMD="docker-compose"
else
  log WARN "Docker Compose is not available. Skipping database container startup."
fi

if [ -n "$COMPOSE_CMD" ]; then
  export MYSQL_DATABASE="$DB_NAME"
  export MYSQL_USER="$DB_USER"
  export MYSQL_PASSWORD="$DB_PASSWORD"
  export MYSQL_ROOT_PASSWORD
  export MYSQL_PORT="$DB_PORT"
  export MYSQL_TZ

  log INFO "Starting MySQL container using docker-compose"
  $COMPOSE_CMD up -d mysql
  wait_for_mysql "$COMPOSE_CMD" mysql "$MYSQL_ROOT_PASSWORD"
  DATABASE_READY=1
else
  log WARN "Please ensure a MySQL instance is running and accessible at ${DB_HOST}:${DB_PORT}."
fi

# -----------------------------
# Backend application setup (seed data)
# -----------------------------
if [ -z "${DATABASE_READY:-}" ]; then
  DATABASE_READY=0
fi

if [ -f "$PROJECT_ROOT/backend/package.json" ] && [ "$DATABASE_READY" -eq 1 ]; then
  log INFO "Running backend setup script"
  (cd "$PROJECT_ROOT/backend" && npm run setup)
elif [ -f "$PROJECT_ROOT/backend/package.json" ]; then
  log WARN "Skipped backend data seed because no database connection was provisioned."
  log WARN "Once your database is accessible, run 'cd backend && npm run setup' to seed demo data."
fi

log INFO "Setup complete. You can now run 'npm run dev' to start the project."
