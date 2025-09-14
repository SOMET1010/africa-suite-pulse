#!/bin/sh

# Entrypoint script for dynamic configuration
set -e

echo "Starting AfricaSuite container..."
echo "Deployment mode: ${DEPLOYMENT_MODE:-cloud}"
echo "Node environment: ${NODE_ENV:-production}"

# Configure nginx based on deployment mode
if [ "${DEPLOYMENT_MODE}" = "selfhosted" ]; then
    echo "Configuring for self-hosted deployment..."
    
    # Replace API endpoints for self-hosted mode
    if [ -n "${POSTGRES_HOST}" ]; then
        echo "Using custom PostgreSQL host: ${POSTGRES_HOST}"
        # Additional self-hosted configuration here
    fi
fi

# Start nginx
exec "$@"