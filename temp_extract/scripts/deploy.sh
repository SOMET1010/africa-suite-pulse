#!/bin/bash

# AfricaSuite Deployment Script
# Usage: ./scripts/deploy.sh [cloud|selfhosted] [environment]

set -e

DEPLOYMENT_MODE=${1:-cloud}
ENVIRONMENT=${2:-production}
NAMESPACE="africasuite-${ENVIRONMENT}"

echo "🚀 Deploying AfricaSuite in ${DEPLOYMENT_MODE} mode to ${ENVIRONMENT}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check requirements
check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Please install kubectl."
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        log_error "helm not found. Please install Helm."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "docker not found. Please install Docker."
        exit 1
    fi
    
    log_info "All requirements satisfied ✓"
}

# Build and push Docker image
build_and_push() {
    log_info "Building AfricaSuite Docker image..."
    
    # Read version from package.json
    VERSION=$(grep '"version"' package.json | cut -d '"' -f 4)
    IMAGE_TAG="africasuite/africasuite:${VERSION}"
    
    # Build image
    docker build \
        --build-arg NODE_ENV=${ENVIRONMENT} \
        --build-arg DEPLOYMENT_MODE=${DEPLOYMENT_MODE} \
        -t ${IMAGE_TAG} \
        -t africasuite/africasuite:latest \
        .
    
    # Push to registry (if not local development)
    if [ "${ENVIRONMENT}" != "development" ]; then
        log_info "Pushing image to registry..."
        docker push ${IMAGE_TAG}
        docker push africasuite/africasuite:latest
    fi
    
    log_info "Docker image built and pushed ✓"
    echo "IMAGE_TAG=${IMAGE_TAG}" > .deploy.env
}

# Create namespace
create_namespace() {
    log_info "Creating namespace ${NAMESPACE}..."
    
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Label namespace
    kubectl label namespace ${NAMESPACE} \
        app.kubernetes.io/name=africasuite \
        app.kubernetes.io/environment=${ENVIRONMENT} \
        --overwrite
    
    log_info "Namespace created ✓"
}

# Deploy with Helm
deploy_helm() {
    log_info "Deploying with Helm..."
    
    # Prepare values file based on deployment mode
    VALUES_FILE="helm/africasuite/values-${DEPLOYMENT_MODE}-${ENVIRONMENT}.yaml"
    
    if [ ! -f "${VALUES_FILE}" ]; then
        log_warn "Values file ${VALUES_FILE} not found, using default values.yaml"
        VALUES_FILE="helm/africasuite/values.yaml"
    fi
    
    # Deploy
    helm upgrade --install africasuite \
        ./helm/africasuite \
        --namespace ${NAMESPACE} \
        --values ${VALUES_FILE} \
        --set global.deploymentMode=${DEPLOYMENT_MODE} \
        --set global.environment=${ENVIRONMENT} \
        --set africasuite.image.tag=${VERSION:-latest} \
        --wait \
        --timeout=10m
    
    log_info "Helm deployment completed ✓"
}

# Configure self-hosted specific components
configure_selfhosted() {
    if [ "${DEPLOYMENT_MODE}" = "selfhosted" ]; then
        log_info "Configuring self-hosted components..."
        
        # Enable PostgreSQL, MinIO, etc.
        helm upgrade africasuite \
            ./helm/africasuite \
            --namespace ${NAMESPACE} \
            --reuse-values \
            --set postgresql.enabled=true \
            --set minio.enabled=true \
            --set global.deploymentMode=selfhosted \
            --wait
        
        log_info "Self-hosted configuration applied ✓"
    fi
}

# Post-deployment checks
post_deployment_checks() {
    log_info "Running post-deployment checks..."
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod \
        -l app.kubernetes.io/name=africasuite \
        -n ${NAMESPACE} \
        --timeout=300s
    
    # Check service status
    kubectl get pods,svc,ingress -n ${NAMESPACE}
    
    # Get application URL
    if [ "${DEPLOYMENT_MODE}" = "cloud" ]; then
        INGRESS_URL=$(kubectl get ingress africasuite -n ${NAMESPACE} -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "localhost")
        log_info "Application available at: https://${INGRESS_URL}"
    else
        SERVICE_IP=$(kubectl get svc africasuite -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "localhost")
        log_info "Application available at: http://${SERVICE_IP}"
    fi
    
    log_info "Post-deployment checks completed ✓"
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Deployment failed!"
        log_info "Checking pod logs..."
        kubectl logs -l app.kubernetes.io/name=africasuite -n ${NAMESPACE} --tail=50 || true
    fi
}

# Main execution
main() {
    trap cleanup EXIT
    
    log_info "Starting AfricaSuite deployment..."
    log_info "Mode: ${DEPLOYMENT_MODE}"
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Namespace: ${NAMESPACE}"
    
    check_requirements
    build_and_push
    create_namespace
    deploy_helm
    configure_selfhosted
    post_deployment_checks
    
    log_info "🎉 AfricaSuite deployment completed successfully!"
}

# Run main function
main "$@"