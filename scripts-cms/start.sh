#!/bin/bash
set -Eeuo pipefail

CMS_PATH="/tmp/cms_extract/cms"
PORT="${DEPLOY_RUN_PORT:-5000}"

cd "${CMS_PATH}/dashboard"

echo "Starting CMS Dashboard static server on port ${PORT}..."
npx serve dist -s -l "${PORT}"
