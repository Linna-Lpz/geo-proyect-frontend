/**
 * Composable para configuración de API
 * 
 * Proporciona las URLs de la API desde la configuración de runtime
 * para usar en desarrollo local y en producción/Docker
 */
export const useApiConfig = () => {
  const config = useRuntimeConfig()
  
  return {
    /**
     * URL base del frontend (para SSR)
     */
    apiBase: config.public.apiBase as string,
    
    /**
     * URL de la API de predicción (backend FastAPI)
     */
    predictionApiUrl: config.public.predictionApiUrl as string || 'http://localhost:8000/api/v1'
  }
}

/**
 * Helper para obtener la URL de predicción fuera de componentes Vue
 * Usar solo cuando useRuntimeConfig no esté disponible
 */
export const getPredictionApiUrl = (): string => {
  // En cliente, intentar obtener de window
  if (typeof window !== 'undefined' && (window as any).__NUXT__?.config?.public?.predictionApiUrl) {
    return (window as any).__NUXT__.config.public.predictionApiUrl
  }
  // Fallback para desarrollo local
  return 'http://localhost:8000/api/v1'
}
