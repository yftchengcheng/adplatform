#!/bin/bash
set -Eeuo pipefail

PORT="${DEPLOY_RUN_PORT:-5000}"
CMS_PATH="/tmp/cms_extract/cms"

# Ensure MySQL is running
if ! mysqladmin -u root --skip-password ping &>/dev/null; then
  echo "Starting MySQL..."
  service mysql start || mysqld_safe --skip-grant-tables &
  sleep 3
fi

# Ensure Redis is running
if ! redis-cli ping &>/dev/null; then
  echo "Starting Redis..."
  redis-server --daemonize yes
  sleep 1
fi

# Ensure backend is running on port 8002
if ! curl -s -o /dev/null http://127.0.0.1:8002/api/debug 2>/dev/null; then
  echo "Starting CMS backend..."
  cd "${CMS_PATH}/python"
  (nohup uv run python serve.py > /tmp/cms-backend.log 2>&1 &)
  echo "Waiting for backend to start..."
  for i in $(seq 1 30); do
    if curl -s -o /dev/null http://127.0.0.1:8002/api/debug 2>/dev/null; then
      echo "Backend started!"
      break
    fi
    sleep 2
  done
fi

# Start the proxy server
echo "Starting CMS proxy server on port ${PORT}..."
export DEPLOY_RUN_PORT="${PORT}"
exec node /tmp/cms-server.js
