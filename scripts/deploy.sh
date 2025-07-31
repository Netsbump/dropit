#!/bin/bash
# =============================================================================
# SCRIPT DE DÉPLOIEMENT - DROPIT
# =============================================================================
# Script pour faciliter le déploiement sur Dokploy

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Vérification des prérequis
check_requirements() {
    log "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    if [ ! -f ".env.production" ]; then
        error "Fichier .env.production manquant"
        echo "Copiez .env.production.example vers .env.production et configurez les variables"
        exit 1
    fi
    
    success "Prérequis vérifiés"
}

# Construction des images
build_images() {
    log "Construction de l'image Docker API..."
    docker build -f apps/api/Dockerfile -t dropit-api:latest .
    success "Image API construite"
}

# Démarrage des services
start_services() {
    log "Démarrage des services..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
    success "Services démarrés"
}

# Vérification de l'état des services
check_health() {
    log "Vérification de l'état des services..."
    
    # Attendre que la base de données soit prête
    log "Attente de PostgreSQL..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose -f docker-compose.prod.yml exec -T database pg_isready -U dropit -d dropit &>/dev/null; then
            success "PostgreSQL est prêt"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        error "Timeout: PostgreSQL n'est pas prêt"
        exit 1
    fi
    
    # Attendre que l'API soit prête
    log "Attente de l'API..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/api/health &>/dev/null; then
            success "API est prête"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        error "Timeout: API n'est pas prête"
        exit 1
    fi
}

# Exécution des migrations
run_migrations() {
    log "Exécution des migrations de base de données..."
    docker-compose -f docker-compose.prod.yml exec api pnpm --filter api db:migration:up
    success "Migrations appliquées"
}

# Fonction principale
main() {
    log "Début du déploiement DropIt"
    
    case "${1:-deploy}" in
        "build")
            check_requirements
            build_images
            ;;
        "start")
            start_services
            check_health
            ;;
        "migrate")
            run_migrations
            ;;
        "deploy")
            check_requirements
            build_images
            start_services
            check_health
            run_migrations
            success "Déploiement terminé avec succès!"
            log "API disponible sur: http://localhost:3000"
            log "Logs: docker-compose -f docker-compose.prod.yml logs -f"
            ;;
        "stop")
            log "Arrêt des services..."
            docker-compose -f docker-compose.prod.yml down
            success "Services arrêtés"
            ;;
        "logs")
            docker-compose -f docker-compose.prod.yml logs -f "${2:-}"
            ;;
        *)
            echo "Usage: $0 {build|start|migrate|deploy|stop|logs [service]}"
            echo ""
            echo "Commandes disponibles:"
            echo "  build   - Construire les images Docker"
            echo "  start   - Démarrer les services"
            echo "  migrate - Exécuter les migrations DB"
            echo "  deploy  - Déploiement complet (défaut)"
            echo "  stop    - Arrêter les services"
            echo "  logs    - Afficher les logs"
            exit 1
            ;;
    esac
}

# Exécution
main "$@"