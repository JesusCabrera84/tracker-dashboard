# Usar imagen base de Node.js
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci --ignore-scripts

# Copiar el código fuente
COPY . .

# Permitir inyectar el flag de bypass en tiempo de build (para Vite)
ARG VITE_BYPASS_AUTH=false
ENV VITE_BYPASS_AUTH=$VITE_BYPASS_AUTH

# Construir la aplicación
RUN npm run build

# Instalar solo dependencias de producción para la etapa final
RUN npm ci --only=production --ignore-scripts

# Etapa de producción
FROM node:20-alpine AS runner

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Establecer directorio de trabajo
WORKDIR /app

# Cambiar propietario del directorio
RUN chown sveltekit:nodejs /app
USER sveltekit

# Copiar archivos necesarios desde el builder
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./package.json
COPY --from=builder --chown=sveltekit:nodejs /app/static ./static

# Exponer puerto
EXPOSE 3340

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3340
ENV HOST=0.0.0.0
ARG VITE_BYPASS_AUTH=false
ENV VITE_BYPASS_AUTH=$VITE_BYPASS_AUTH

# Comando de inicio
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build"]
