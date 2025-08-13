# AfricaSuite Containerization Guide

Ce guide détaille la containerisation d'AfricaSuite avec Docker et Kubernetes pour les déploiements cloud et on-premise.

## 🚀 Quick Start

### Développement Local

```bash
# Setup complet avec Docker Compose
chmod +x scripts/local-setup.sh
./scripts/local-setup.sh

# Accès à l'application
open http://localhost:3000
```

### Déploiement Production

```bash
# Cloud (utilise Supabase et services externes)
./scripts/deploy.sh cloud production

# Self-hosted (PostgreSQL, MinIO, Redis inclus)
./scripts/deploy.sh selfhosted production
```

## 📁 Structure des Fichiers

```
├── Dockerfile                              # Image AfricaSuite optimisée
├── docker-compose.yml                      # Environnement dev complet
├── docker/
│   ├── nginx.conf                          # Configuration Nginx
│   ├── entrypoint.sh                       # Script de démarrage
│   └── init-scripts/
│       └── 01-init.sql                     # Init PostgreSQL
├── helm/africasuite/                       # Charts Kubernetes
│   ├── Chart.yaml
│   ├── values.yaml                         # Configuration par défaut
│   ├── values-cloud-production.yaml        # Config cloud
│   ├── values-selfhosted-production.yaml   # Config on-premise
│   └── templates/
└── scripts/
    ├── deploy.sh                           # Script de déploiement
    └── local-setup.sh                      # Setup développement
```

## 🐳 Docker

### Build Image

```bash
# Development
docker build \
  --build-arg NODE_ENV=development \
  --build-arg DEPLOYMENT_MODE=selfhosted \
  -t africasuite:dev .

# Production
docker build \
  --build-arg NODE_ENV=production \
  --build-arg DEPLOYMENT_MODE=cloud \
  --build-arg SUPABASE_URL=https://your-project.supabase.co \
  --build-arg SUPABASE_ANON_KEY=your-anon-key \
  -t africasuite:latest .
```

### Run Container

```bash
# Simple run
docker run -p 3000:80 africasuite:latest

# Avec variables d'environnement
docker run -p 3000:80 \
  -e DEPLOYMENT_MODE=selfhosted \
  -e POSTGRES_HOST=localhost \
  africasuite:latest
```

## 🏗️ Docker Compose

### Services Inclus

- **africasuite**: Application React/Vite
- **postgres**: Base de données PostgreSQL 15
- **redis**: Cache et sessions
- **minio**: Stockage S3-compatible
- **nats**: Message bus (préparation microservices)
- **prometheus**: Métriques
- **grafana**: Dashboards

### Variables d'Environnement

Créez `.env.local`:

```env
# Database
POSTGRES_DB=africasuite
POSTGRES_USER=africasuite
POSTGRES_PASSWORD=africasuite123

# MinIO
MINIO_ROOT_USER=africasuite
MINIO_ROOT_PASSWORD=africasuite123

# Monitoring
GRAFANA_PASSWORD=admin123

# App
NODE_ENV=development
DEPLOYMENT_MODE=selfhosted
```

### Commandes Utiles

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f africasuite

# Redémarrer un service
docker-compose restart africasuite

# Supprimer tout (avec volumes)
docker-compose down -v

# Reconstruire l'image
docker-compose build --no-cache africasuite
```

## ☸️ Kubernetes

### Modes de Déploiement

#### 1. Cloud (SaaS)
- Utilise Supabase pour la base de données
- Services externes (S3, Redis Cloud, etc.)
- Autoscaling agressif
- Multi-AZ

```bash
helm install africasuite ./helm/africasuite \
  --namespace africasuite-prod \
  --values helm/africasuite/values-cloud-production.yaml \
  --set global.deploymentMode=cloud
```

#### 2. Self-Hosted (On-Premise)
- PostgreSQL inclus
- MinIO pour le stockage
- Redis local
- Monitoring complet

```bash
helm install africasuite ./helm/africasuite \
  --namespace africasuite-prod \
  --values helm/africasuite/values-selfhosted-production.yaml \
  --set global.deploymentMode=selfhosted
```

### Configuration des Secrets

```bash
# Créer les secrets pour le mode cloud
kubectl create secret generic supabase-credentials \
  --from-literal=url="https://your-project.supabase.co" \
  --from-literal=anon-key="your-anon-key" \
  -n africasuite-prod

# Secrets PostgreSQL pour self-hosted
kubectl create secret generic postgresql-credentials \
  --from-literal=password="your-secure-password" \
  -n africasuite-prod
```

### Monitoring

#### Prometheus Metrics
- Application health: `/health`
- Custom metrics: `/metrics`
- Database metrics via exporters

#### Grafana Dashboards
- Application performance
- Infrastructure metrics
- Business KPIs (réservations, revenus)

### High Availability

#### Cloud Deployment
- Multi-AZ deployment
- 5-50 replicas autoscaling
- Load balancer avec health checks
- Blue/Green deployments

#### Self-Hosted Deployment
- 3 replicas minimum
- Pod disruption budgets
- Node affinity rules
- Persistent volumes avec backup

## 🔒 Sécurité

### Image Security
- Multi-stage build (réduction surface d'attaque)
- Non-root user (UID 1000)
- Read-only root filesystem
- Dropped capabilities

### Network Security
- Network policies activées
- TLS/SSL forcé
- Rate limiting
- Security headers

### Secrets Management
- Kubernetes secrets
- Rotation automatique
- Least privilege access

## 📊 Monitoring et Observabilité

### Health Checks
```bash
# Application health
curl http://localhost:3000/health

# Container health
docker inspect --format='{{.State.Health.Status}}' container_id
```

### Logs
```bash
# Application logs
kubectl logs -f deployment/africasuite -n africasuite-prod

# Structured logs avec correlation IDs
kubectl logs -f deployment/africasuite -n africasuite-prod | jq
```

### Metrics
- CPU/Memory utilization
- Request latency
- Error rates
- Business metrics (bookings, revenue)

## 🔄 CI/CD Integration

### Build Pipeline
```yaml
# .github/workflows/build.yml
- name: Build Docker Image
  run: |
    docker build \
      --build-arg NODE_ENV=production \
      --build-arg DEPLOYMENT_MODE=cloud \
      -t africasuite:${{ github.sha }} .
```

### Deployment Pipeline
```yaml
# Déploiement automatique
- name: Deploy to Kubernetes
  run: |
    helm upgrade africasuite ./helm/africasuite \
      --set africasuite.image.tag=${{ github.sha }} \
      --namespace africasuite-prod
```

## 🚀 Mise en Production

### Checklist Pre-Production

- [ ] Secrets configurés et rotés
- [ ] Monitoring et alerting opérationnels
- [ ] Backup/Restore testé
- [ ] Load testing effectué
- [ ] Security scan passé
- [ ] Documentation mise à jour

### Checklist Post-Production

- [ ] Health checks validés
- [ ] Metrics remontées
- [ ] Logs accessibles
- [ ] Alerts configurées
- [ ] Équipe formée

### Rollback Procedure

```bash
# Rollback Helm
helm rollback africasuite --namespace africasuite-prod

# Rollback Docker Compose
docker-compose down
docker-compose up -d --force-recreate
```

## 📞 Support

### Debugging

```bash
# Container debug
docker exec -it container_name /bin/sh

# Kubernetes debug
kubectl debug pod/africasuite-xxx -n africasuite-prod

# Database debug
kubectl exec -it postgres-0 -n africasuite-prod -- psql -U africasuite
```

### Common Issues

1. **Application won't start**
   - Vérifier les variables d'environnement
   - Contrôler les logs de démarrage
   - Valider la connectivité réseau

2. **Database connection failed**
   - Vérifier les credentials
   - Tester la connectivité réseau
   - Valider les security groups

3. **Performance issues**
   - Augmenter les resources requests/limits
   - Activer l'autoscaling
   - Optimiser les requêtes DB

Pour plus d'aide : support@africasuite.com