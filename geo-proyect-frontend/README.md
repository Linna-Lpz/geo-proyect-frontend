# 🏠 Frontend Recomendador Inmobiliario

Sistema de recomendación de propiedades con chatbot dinámico basado en preferencias del usuario.

## 🎯 Características Principales

- ✅ **Chatbot Conversacional Dinámico** con flujo controlado por usuario
- ✅ **Multi-select de preferencias** (el usuario elige qué responder)
- ✅ **4 preguntas obligatorias**: Presupuesto, Dormitorios, Tipo (Casa/Depto), Ubicación
- ✅ **6 temas opcionales**: Transporte, Educación, Salud, Áreas Verdes, Edificio, Ambiente
- ✅ **Preferencias negativas** (ej: "prefiero LEJOS del metro")
- ✅ Integración con backend FastAPI + PostgreSQL/PostGIS
- ✅ Mapa interactivo con Leaflet
- ✅ TypeScript + Vue 3 Composition API + Nuxt

## 📝 Documentación

Ver [IMPLEMENTACION_CHATBOT_DINAMICO.md](../IMPLEMENTACION_CHATBOT_DINAMICO.md) para:
- Arquitectura completa del chatbot
- Flujo de conversación detallado
- Casos de uso y ejemplos de payloads
- Guía de testing

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
