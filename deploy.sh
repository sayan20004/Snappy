#!/bin/bash

# Snappy Todo - Production Deployment Script
# Usage: ./deploy.sh [version]

set -e

VERSION=${1:-latest}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-ghcr.io/sayan20004}

echo "🚀 Starting Snappy Todo Deployment (Version: $VERSION)"
echo "=================================================="

# Step 1: Build images
echo ""
echo "📦 Building Docker images..."
docker build -t $DOCKER_REGISTRY/snappy-backend:$VERSION ./backend
docker build -t $DOCKER_REGISTRY/snappy-frontend:$VERSION ./frontend

# Step 2: Tag as latest
if [ "$VERSION" != "latest" ]; then
  echo ""
  echo "🏷️  Tagging as latest..."
  docker tag $DOCKER_REGISTRY/snappy-backend:$VERSION $DOCKER_REGISTRY/snappy-backend:latest
  docker tag $DOCKER_REGISTRY/snappy-frontend:$VERSION $DOCKER_REGISTRY/snappy-frontend:latest
fi

# Step 3: Push to registry (optional)
read -p "Push to Docker registry? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "📤 Pushing images to registry..."
  docker push $DOCKER_REGISTRY/snappy-backend:$VERSION
  docker push $DOCKER_REGISTRY/snappy-frontend:$VERSION
  if [ "$VERSION" != "latest" ]; then
    docker push $DOCKER_REGISTRY/snappy-backend:latest
    docker push $DOCKER_REGISTRY/snappy-frontend:latest
  fi
fi

# Step 4: Deploy with docker-compose
echo ""
echo "🎯 Deploying to production..."
export VERSION=$VERSION
export DOCKER_REGISTRY=$DOCKER_REGISTRY
docker-compose -f docker-compose.prod.yml up -d

# Step 5: Health check
echo ""
echo "🏥 Running health checks..."
sleep 10

if curl -f http://localhost:5001/health > /dev/null 2>&1; then
  echo "✅ Backend: Healthy"
else
  echo "❌ Backend: Unhealthy"
  exit 1
fi

if curl -f http://localhost/health > /dev/null 2>&1; then
  echo "✅ Frontend: Healthy"
else
  echo "❌ Frontend: Unhealthy"
  exit 1
fi

echo ""
echo "=================================================="
echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://localhost"
echo "🔌 Backend: http://localhost:5001"
echo "=================================================="
