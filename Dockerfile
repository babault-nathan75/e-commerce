# --- ÉTAPE 1 : INSTALLATION DES DÉPENDANCES ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copie des fichiers de configuration
COPY package.json package-lock.json* ./
# Installation propre (inclut les devDependencies pour le build)
RUN npm ci --legacy-peer-deps

# --- ÉTAPE 2 : CONSTRUCTION (BUILD) ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Désactiver la télémétrie Next.js pendant le build
ENV NEXT_TELEMETRY_DISABLED 1

# Construction de l'application
RUN npm run build

# --- ÉTAPE 3 : EXÉCUTION (RUNNER) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie sélective des fichiers nécessaires (Optimisation Standalone)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# Commande de lancement (nécessite output: 'standalone' dans next.config.js)
CMD ["node", "server.js"]