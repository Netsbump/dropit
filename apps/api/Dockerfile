# =============================================================================
# DOCKERFILE - API NESTJS DROPIT
# =============================================================================
# Image multi-stage pour optimiser la taille finale et la sécurité
# Base: Node.js 20 Alpine (légère et sécurisée)

# -----------------------------------------------------------------------------
# STAGE 1: Dependencies & Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Métadonnées
LABEL maintainer="DropIt Team"
LABEL description="DropIt API - NestJS Application"

# Installation des outils système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Configuration de pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration du monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copie des packages partagés (nécessaires pour la construction)
COPY packages/ ./packages/

# Copie du package.json de l'API
COPY apps/api/package.json ./apps/api/

# Installation des dépendances (avec cache pnpm optimisé)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# Copie du code source de l'API
COPY apps/api/ ./apps/api/

# Build des packages partagés d'abord
RUN pnpm --filter "@dropit/contract" build
RUN pnpm --filter "@dropit/schemas" build
RUN pnpm --filter "@dropit/permissions" build

# Build de l'API
RUN pnpm --filter api build

# -----------------------------------------------------------------------------
# STAGE 2: Production Runtime
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Installation des dépendances système runtime uniquement
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Configuration de pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copie des packages partagés buildés
COPY --from=builder /app/packages/ ./packages/

# Copie du package.json de l'API
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Installation des dépendances de production uniquement
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod=true

# Copie de l'application buildée
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/

# Configuration des permissions
RUN chown -R nestjs:nodejs /app
USER nestjs

# Configuration des variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposition du port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Point d'entrée avec dumb-init pour une gestion propre des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "apps/api/dist/main.js"]