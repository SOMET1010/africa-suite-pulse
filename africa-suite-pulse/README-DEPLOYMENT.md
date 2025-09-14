# AfricaSuite Deployment Guide

## 🚀 Options de Déploiement

AfricaSuite supporte deux modes de déploiement :
- **Cloud** : Hébergement centralisé avec synchronisation temps réel
- **On-Premise** : Installation locale avec contrôle total des données

---

## ☁️ Déploiement Cloud

### Architecture Cloud
```
Internet → LoadBalancer → K8s Cluster → AfricaSuite Pods
                                    → PostgreSQL
                                    → Redis
                                    → MinIO
```

### 1. Prérequis Cloud
- Cluster Kubernetes (AKS, EKS, GKE, ou on-premise)
- Helm 3.x
- Accès privilégié au cluster

### 2. Installation via Helm
```bash
# Ajouter le repository AfricaSuite
helm repo add africasuite https://charts.africasuite.com
helm repo update

# Installation production cloud
helm install africasuite africasuite/africasuite \
  -f helm/africasuite/values-cloud-production.yaml \
  --namespace africasuite \
  --create-namespace
```

### 3. Configuration Cloud
```yaml
# values-cloud-production.yaml
global:
  deploymentMode: cloud
  environment: production

africasuite:
  replicaCount: 3
  image:
    repository: africasuite/africasuite
    tag: "latest"
  
  ingress:
    enabled: true
    hosts:
      - host: votre-hotel.africasuite.com
        paths: ["/"]
    tls:
      - secretName: africasuite-tls
        hosts: ["votre-hotel.africasuite.com"]

postgresql:
  enabled: false  # Utilise service cloud managé

redis:
  enabled: true
  auth:
    enabled: true
  persistence:
    enabled: true

monitoring:
  enabled: true
  prometheus:
    enabled: false  # Utilise monitoring cloud
```

---

## 🏢 Déploiement On-Premise

### Architecture On-Premise
```
LAN → Nginx → AfricaSuite → PostgreSQL
                         → Redis
                         → MinIO
```

### 1. Prérequis On-Premise
- Docker Engine 20.x+
- Docker Compose 2.x+
- Minimum 4 CPU, 8GB RAM, 100GB SSD
- Réseau local avec DNS interne (optionnel)

### 2. Installation Docker Compose
```bash
# Cloner la configuration
git clone https://github.com/africasuite/deployment.git
cd deployment/on-premise

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrage des services
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Configuration On-Premise
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  africasuite:
    image: africasuite/africasuite:latest
    environment:
      DEPLOYMENT_MODE: selfhosted
      POSTGRES_HOST: postgres
      REDIS_HOST: redis
      MINIO_HOST: minio
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./data/uploads:/app/uploads
      - ./ssl:/etc/ssl/private
    depends_on:
      - postgres
      - redis
      - minio

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: africasuite
      POSTGRES_USER: africasuite
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
      
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 🔧 Configuration Multi-Site

### Synchronisation Cloud ↔ On-Premise
```yaml
# Configuration hybride
africasuite:
  multiSite:
    enabled: true
    mode: "hybrid"  # cloud, on-premise, hybrid
    
    # Site principal (Cloud)
    primary:
      url: "https://central.africasuite.com"
      apiKey: "${CENTRAL_API_KEY}"
    
    # Sites secondaires (On-Premise)
    secondary:
      - name: "hotel-abidjan"
        url: "https://local.hotel-abidjan.ci"
        syncInterval: "5m"
        conflictResolution: "cloud-wins"
      
      - name: "hotel-accra"
        url: "https://local.hotel-accra.gh"
        syncInterval: "15m"
        conflictResolution: "manual"

  # Synchronisation sélective
  syncModules:
    reservations: true
    guests: true
    billing: true
    pos_transactions: true
    inventory: false  # Local uniquement
    reports: true
```

---

## 📊 Monitoring & Observabilité

### Métriques Clés
```yaml
monitoring:
  metrics:
    # Performance
    - response_time_ms
    - throughput_rps
    - error_rate_percent
    
    # Business
    - active_reservations
    - daily_revenue
    - occupancy_rate
    - pos_transactions_count
    
    # Infrastructure
    - cpu_usage_percent
    - memory_usage_percent
    - disk_usage_percent
    - database_connections

  alerts:
    - name: "High Error Rate"
      condition: "error_rate > 5%"
      notification: ["email", "slack", "sms"]
    
    - name: "Low Occupancy"
      condition: "occupancy_rate < 30%"
      notification: ["email"]
      schedule: "business_hours"
```

### Logs Centralisés
```yaml
logging:
  enabled: true
  level: "info"  # debug, info, warn, error
  
  # Destinations
  outputs:
    - type: "file"
      path: "/var/log/africasuite"
      rotation: "daily"
      retention: "30d"
    
    - type: "syslog"
      host: "log-server.local"
      port: 514
    
    - type: "elasticsearch"
      hosts: ["elastic.monitoring.local:9200"]
      index: "africasuite-logs"

  # Filtres données sensibles
  privacy:
    mask_fields: ["password", "pin", "card_number"]
    exclude_paths: ["/health", "/metrics"]
```

---

## 🔒 Sécurité & Backup

### Chiffrement
```yaml
security:
  tls:
    enabled: true
    certificate: "/etc/ssl/private/africasuite.crt"
    private_key: "/etc/ssl/private/africasuite.key"
    
  database:
    encryption_at_rest: true
    ssl_mode: "require"
    
  sessions:
    secure_cookies: true
    same_site: "strict"
    timeout: "8h"

  audit:
    enabled: true
    log_all_actions: true
    retention: "7y"  # Conformité légale
```

### Sauvegarde Automatique
```bash
#!/bin/bash
# Script de backup automatique

# Backup base de données
docker exec postgres pg_dump -U africasuite africasuite | \
  gzip > "/backups/db-$(date +%Y%m%d-%H%M%S).sql.gz"

# Backup fichiers
tar -czf "/backups/files-$(date +%Y%m%d-%H%M%S).tar.gz" \
  ./data/uploads ./ssl

# Nettoyage (garder 30 jours)
find /backups -name "*.gz" -mtime +30 -delete

# Synchronisation cloud (optionnel)
if [ "$BACKUP_TO_CLOUD" = "true" ]; then
  rclone sync /backups remote:africasuite-backups/$(hostname)
fi
```

---

## 🚀 Mise en Production

### Checklist Pré-Production
- [ ] Tests de charge réalisés
- [ ] Backup/Restore testé
- [ ] Monitoring configuré
- [ ] SSL/TLS activé
- [ ] Audit logs activés
- [ ] Formation équipe réalisée
- [ ] Plan de maintenance défini
- [ ] Contacts support configurés

### Migration Données
```bash
# Export depuis ancien système
./scripts/export-legacy-data.sh --source-type=opera --output=export.json

# Import dans AfricaSuite
./scripts/import-data.sh --input=export.json --validate --dry-run
./scripts/import-data.sh --input=export.json --execute
```

### Tests de Validation
```bash
# Tests fonctionnels automatisés
npm run test:e2e:production

# Tests de charge
k6 run --vus 50 --duration 30s tests/load/booking-flow.js

# Tests de sécurité
npm run security:scan
```

---

## 📞 Support & Maintenance

### Contacts Support
- **Support L1** : support@africasuite.com (Response 4h)
- **Support L2** : urgent@africasuite.com (Response 1h)
- **Urgences** : +225 XX XX XX XX XX (24/7)

### Maintenance Planifiée
- **Mises à jour mineures** : Automatiques (rolling deployment)
- **Mises à jour majeures** : Planifiées (fenêtre de maintenance)
- **Backup verification** : Hebdomadaire
- **Security updates** : Sous 24h

### SLA Garantie
- **Uptime** : 99.9% (Cloud) / 99.5% (On-Premise avec support)
- **Response Time** : < 200ms (API) / < 2s (Interface)
- **Support Response** : < 4h (Standard) / < 1h (Urgent)
- **Résolution P1** : < 4h / P2: < 24h / P3: < 72h

---

**🏆 AfricaSuite - Ready for Production**