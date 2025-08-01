# =============================================================================
# DOCKERFILE - API NESTJS DROPIT (Version optimisée)
# =============================================================================
# Inspiré des meilleures pratiques pour monorepos

# -----------------------------------------------------------------------------
# STAGE 1: Base avec pnpm
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Version fixe pour éviter les conflits de lockfile
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
WORKDIR /app

# -----------------------------------------------------------------------------
# STAGE 2: Builder - Installation et build
# -----------------------------------------------------------------------------
FROM base AS builder

# Installation des outils système nécessaires
RUN apk add --no-cache python3 make g++

# pnpm fetch nécessite seulement le lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch --ignore-scripts

# Copier le code source après fetch
COPY . .
RUN pnpm install -r --offline --prefer-offline --ignore-scripts

# Build des packages dans le bon ordre (pnpm gère les dépendances)
RUN pnpm --filter "@dropit/schemas" build
RUN pnpm --filter "@dropit/contract" build  
RUN pnpm --filter "@dropit/permissions" build

# Build de l'API
RUN pnpm --filter api build

# Créer un dossier de déploiement avec seulement les deps nécessaires
RUN pnpm deploy --prod --filter="./apps/api" /app/deploy

# Copier manuellement le dossier dist car pnpm deploy ne l'inclut pas toujours
RUN cp -r /app/apps/api/dist /app/deploy/dist

# -----------------------------------------------------------------------------
# STAGE 3: Production - Image finale ultra-légère
# -----------------------------------------------------------------------------
FROM base AS runner

# Installation de dumb-init pour gestion des signaux
RUN apk add --no-cache dumb-init

# Création utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

# Copier les fichiers de production depuis le stage deploy
COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/deploy/dist ./dist
COPY --from=builder /app/deploy/package.json ./package.json

# Copier les packages buildés (nécessaires pour les imports workspace)
COPY --from=builder /app/packages/schemas/dist ./node_modules/@dropit/schemas/dist
COPY --from=builder /app/packages/contract/dist ./node_modules/@dropit/contract/dist  
COPY --from=builder /app/packages/permissions/dist ./node_modules/@dropit/permissions/dist

# Configuration des permissions
RUN chown -R nestjs:nodejs /app
USER nestjs

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposition du port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Point d'entrée avec dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "dist/main.js"]