# Dockerfile para Frontend Nuxt 3
# Stage 1: Build
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copiar package files para producción
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar build desde stage anterior
COPY --from=builder /app/.nuxt ./.nuxt
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/nuxt.config.ts ./nuxt.config.ts
COPY --from=builder /app/public ./public

# Exponer el puerto que usará la aplicación
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production \
    NUXT_HOST=0.0.0.0 \
    NUXT_PORT=3000

# Comando para iniciar la aplicación
CMD ["node", ".output/server/index.mjs"]