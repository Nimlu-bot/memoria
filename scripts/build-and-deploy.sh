#!/bin/bash

set -e

echo "🔨 Building front-end application..."
bun run --cwd apps/front build

echo "📦 Copying front-end build to back-end public folder..."
rm -rf apps/back/public/browser
cp -r apps/front/dist/memoria/browser apps/back/public/browser

echo "🔨 Building back-end application..."
bun run --cwd apps/back build

echo "🚀 Starting back-end server..."
bun run --cwd apps/back start
