/**
 * Servicio de Predicción de Satisfacción
 * 
 * Interfaz TypeScript para interactuar con el API de satisfacción
 * del backend que usa el modelo LightGBM (R²=0.8697)
 */

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type TipoPropiedad = 'departamento' | 'casa'
export type ComunaValida = 'Estación Central' | 'La Reina' | 'Ñuñoa' | 'Santiago'
export type NivelSatisfaccion = 'Excelente' | 'Bueno' | 'Regular' | 'Bajo'

/**
 * Request para predicción de satisfacción
 */
export interface SatisfaccionRequest {
  superficie_util: number
  dormitorios: number
  banos: number
  precio_uf: number
  comuna?: ComunaValida
  tipo_propiedad?: TipoPropiedad
  latitud?: number
  longitud?: number
  dist_transporte_min_m?: number
  dist_educacion_min_m?: number
  dist_salud_min_m?: number
  dist_areas_verdes_m?: number
  dist_comercio_m?: number
}

/**
 * Detalles de la predicción
 */
export interface SatisfaccionDetalles {
  precio_m2_uf: number
  m2_por_dormitorio: number
  ratio_bano_dorm: number
  total_habitaciones: number
  comuna: string
  tipo: string
}

/**
 * Respuesta de predicción de satisfacción
 */
export interface SatisfaccionResponse {
  satisfaccion: number        // 0-10
  nivel: NivelSatisfaccion
  emoji: string
  descripcion: string
  escala: string
  confianza: number           // R² del modelo
  features_usadas: number
  detalles: SatisfaccionDetalles
}

/**
 * Información del modelo de satisfacción
 */
export interface ModeloSatisfaccionInfo {
  modelo_tipo: string
  modelo_disponible: boolean
  num_features: number
  metricas: {
    r2_test: number | null
    rmse_test: number | null
    mae_test: number | null
  }
  comunas_validas: string[]
  tipos_validos: string[]
  version: string
}

/**
 * Propiedad en el ranking de comparación
 */
export interface PropiedadRanking {
  ranking: number
  id: number
  direccion: string
  satisfaccion: number
  nivel: string
  emoji: string
  precio_uf: number
  superficie: number
  dormitorios: number
  banos: number
  comuna: string
  tipo: string
}

/**
 * Respuesta de comparación de propiedades
 */
export interface ComparacionResponse {
  total_comparadas: number
  ranking: PropiedadRanking[]
  mejor_opcion: PropiedadRanking
  promedio_satisfaccion: number
}

// ============================================================================
// CLASE DEL SERVICIO
// ============================================================================

export class SatisfaccionService {
  private baseURL: string

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL
  }

  /**
   * Predice la satisfacción de una propiedad
   * @param data Datos de la propiedad
   * @returns Predicción de satisfacción con detalles
   */
  async predecirSatisfaccion(data: SatisfaccionRequest): Promise<SatisfaccionResponse> {
    const response = await fetch(`${this.baseURL}/predecir-satisfaccion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error en predicción: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Obtiene información del modelo de satisfacción
   * @returns Información del modelo (tipo, métricas, comunas válidas)
   */
  async getModeloInfo(): Promise<ModeloSatisfaccionInfo> {
    const response = await fetch(`${this.baseURL}/satisfaccion-info`)
    
    if (!response.ok) {
      throw new Error(`Error obteniendo info del modelo: ${response.statusText}`)
    }
    
    return await response.json()
  }

  /**
   * Compara múltiples propiedades y genera un ranking
   * @param propiedades Lista de propiedades a comparar (2-20)
   * @returns Ranking ordenado por satisfacción
   */
  async compararPropiedades(propiedades: SatisfaccionRequest[]): Promise<ComparacionResponse> {
    const response = await fetch(`${this.baseURL}/comparar-propiedades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ propiedades }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error en comparación: ${response.statusText}`)
    }

    return await response.json()
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Valor de la UF en CLP (actualizar periódicamente)
 */
const VALOR_UF_CLP = 38500

/**
 * Convierte UF a CLP
 */
export const ufToCLP = (uf: number): number => {
  return uf * VALOR_UF_CLP
}

/**
 * Formatea precio en UF con conversión a CLP
 */
export const formatearPrecio = (precioUF: number): string => {
  const precioCLP = ufToCLP(precioUF)
  const ufFormateado = precioUF.toLocaleString('es-CL', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })
  const clpFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precioCLP)
  
  return `${ufFormateado} UF (≈${clpFormateado})`
}

/**
 * Obtiene color según nivel de satisfacción
 */
export const getSatisfaccionColor = (satisfaccion: number): string => {
  if (satisfaccion >= 8) return '#22c55e'  // green-500
  if (satisfaccion >= 6) return '#3b82f6'  // blue-500
  if (satisfaccion >= 4) return '#f59e0b'  // amber-500
  return '#ef4444'  // red-500
}

/**
 * Obtiene clase de Tailwind según nivel de satisfacción
 */
export const getSatisfaccionClass = (satisfaccion: number): string => {
  if (satisfaccion >= 8) return 'text-green-600 bg-green-100'
  if (satisfaccion >= 6) return 'text-blue-600 bg-blue-100'
  if (satisfaccion >= 4) return 'text-amber-600 bg-amber-100'
  return 'text-red-600 bg-red-100'
}

/**
 * Obtiene descripción del nivel según satisfacción
 */
export const getNivelDescripcion = (nivel: NivelSatisfaccion): string => {
  const descripciones: Record<NivelSatisfaccion, string> = {
    'Excelente': 'Esta propiedad destaca por sus excepcionales características y ubicación',
    'Bueno': 'Esta propiedad ofrece buenas características para sus necesidades',
    'Regular': 'Esta propiedad tiene características promedio para la zona',
    'Bajo': 'Esta propiedad puede no cumplir con algunas expectativas básicas'
  }
  return descripciones[nivel]
}

/**
 * Comunas disponibles para predicción
 */
export const COMUNAS_DISPONIBLES: ComunaValida[] = [
  'Estación Central',
  'La Reina',
  'Ñuñoa',
  'Santiago'
]

/**
 * Tipos de propiedad disponibles
 */
export const TIPOS_DISPONIBLES: TipoPropiedad[] = [
  'departamento',
  'casa'
]

/**
 * Crea una instancia del servicio por defecto
 */
export const satisfaccionService = new SatisfaccionService()
export default satisfaccionService
