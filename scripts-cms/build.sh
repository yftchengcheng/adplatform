#!/bin/bash
set -Eeuo pipefail

CMS_PATH="/tmp/cms_extract/cms"

cd "${CMS_PATH}"

echo "Installing CMS dependencies..."
pnpm install --ignore-scripts 2>&1 | tail -5

echo "Building CMS Dashboard..."
cd "${CMS_PATH}/dashboard"
npx vite build

echo "Build completed successfully!"
