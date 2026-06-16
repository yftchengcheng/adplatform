#!/bin/bash
set -Eeuo pipefail

CMS_PATH="/tmp/cms_extract/cms"
PORT="${DEPLOY_RUN_PORT:-5000}"

cd "${CMS_PATH}"

echo "Installing CMS dependencies..."
pnpm install --ignore-scripts 2>&1 | tail -5

echo "Starting CMS Dashboard dev server on port ${PORT}..."
cd "${CMS_PATH}/dashboard"
npx vite --host 0.0.0.0 --port "${PORT}" --strictPort
