-- =============================================================================
-- SCRIPT D'INITIALISATION POSTGRESQL - DROPIT
-- =============================================================================
-- Ce script est exécuté automatiquement au premier démarrage de PostgreSQL
-- Il configure les extensions et optimisations nécessaires pour l'application

-- Création des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configuration des paramètres de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Rechargement de la configuration
SELECT pg_reload_conf();

-- Message de confirmation
\echo 'Base de données DropIt initialisée avec succès!';