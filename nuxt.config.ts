// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  css: [
    '~/assets/css/main.css',
    'leaflet/dist/leaflet.css'
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || "http://localhost:3000",
      predictionApiUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1",
    } as {
      apiBase: string;
      predictionApiUrl: string;
    }
  },
  compatibilityDate: '2025-05-15',
  postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
  },
  components: true,
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  vite: {
    optimizeDeps: {
      include: ['leaflet']
    }
  }
})