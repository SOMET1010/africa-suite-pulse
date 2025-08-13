#!/bin/bash

# AfricaSuite Local Development Setup
# This script sets up a complete local development environment using Docker Compose

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_docker() {
    log_info "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker not found. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose not found. Please install Docker Compose."
        exit 1
    fi
    
    log_info "Docker and Docker Compose are available ✓"
}

# Create environment file
create_env_file() {
    log_info "Creating environment configuration..."
    
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
# AfricaSuite Local Development Environment

# Database
POSTGRES_DB=africasuite
POSTGRES_USER=africasuite
POSTGRES_PASSWORD=africasuite123

# Redis (no password for local dev)
REDIS_PASSWORD=

# MinIO (S3-compatible storage)
MINIO_ROOT_USER=africasuite
MINIO_ROOT_PASSWORD=africasuite123

# Monitoring
GRAFANA_PASSWORD=admin123

# Application
NODE_ENV=development
DEPLOYMENT_MODE=selfhosted

# Supabase (for hybrid mode)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key-here
EOF
        log_info "Environment file created: .env.local"
    else
        log_warn "Environment file .env.local already exists"
    fi
}

# Create monitoring configuration
create_monitoring_config() {
    log_info "Setting up monitoring configuration..."
    
    # Create docker directory if it doesn't exist
    mkdir -p docker/grafana/provisioning/dashboards
    mkdir -p docker/grafana/provisioning/datasources
    
    # Prometheus configuration
    cat > docker/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'africasuite'
    static_configs:
      - targets: ['africasuite:80']
    metrics_path: '/metrics'
    scrape_interval: 30s
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s
EOF

    # Grafana datasource
    cat > docker/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

    # Grafana dashboard provisioning
    cat > docker/grafana/provisioning/dashboards/dashboard.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

    log_info "Monitoring configuration created ✓"
}

# Start services
start_services() {
    log_info "Starting AfricaSuite local environment..."
    
    # Build and start services
    docker-compose --env-file .env.local up --build -d
    
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    check_service_health
}

# Check service health
check_service_health() {
    log_info "Checking service health..."
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U africasuite -d africasuite > /dev/null 2>&1; then
        log_info "PostgreSQL is ready ✓"
    else
        log_warn "PostgreSQL is not ready yet"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_info "Redis is ready ✓"
    else
        log_warn "Redis is not ready yet"
    fi
    
    # Check AfricaSuite application
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_info "AfricaSuite application is ready ✓"
    else
        log_warn "AfricaSuite application is starting..."
    fi
}

# Show service URLs
show_urls() {
    log_info "🎉 AfricaSuite local environment is ready!"
    echo ""
    echo "📱 Application URLs:"
    echo "   • AfricaSuite: http://localhost:3000"
    echo "   • Admin Login: admin@africasuite.com / admin123"
    echo ""
    echo "🔧 Development Tools:"
    echo "   • Grafana: http://localhost:3001 (admin/admin123)"
    echo "   • Prometheus: http://localhost:9090"
    echo "   • MinIO Console: http://localhost:9001 (africasuite/africasuite123)"
    echo ""
    echo "🗄️  Database Connections:"
    echo "   • PostgreSQL: localhost:5432 (africasuite/africasuite123)"
    echo "   • Redis: localhost:6379"
    echo ""
    echo "📋 Useful Commands:"
    echo "   • View logs: docker-compose logs -f"
    echo "   • Stop services: docker-compose down"
    echo "   • Reset data: docker-compose down -v"
    echo ""
}

# Main execution
main() {
    log_info "Setting up AfricaSuite local development environment..."
    
    check_docker
    create_env_file
    create_monitoring_config
    start_services
    show_urls
    
    log_info "Setup completed successfully! 🚀"
}

# Cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Setup failed!"
        log_info "Checking service logs..."
        docker-compose logs --tail=20
    fi
}

trap cleanup EXIT

# Run setup
main "$@"