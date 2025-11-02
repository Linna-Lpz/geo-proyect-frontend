/**
 * Servicio de Recomendaciones ML
 * Sistema avanzado con preferencias detalladas (-10 a +10)
 */

export interface PreferenciasTransporte {
  importancia_metro: number
  distancia_maxima_metro_m: number
  importancia_buses: number
  distancia_maxima_buses_m: number
}

export interface PreferenciasEducacion {
  importancia_colegios: number
  distancia_maxima_colegios_m: number
  importancia_universidades: number
  distancia_maxima_universidades_m: number
}

export interface PreferenciasSalud {
  importancia_consultorios: number
  distancia_maxima_consultorios_m: number
  importancia_hospitales: number
  distancia_maxima_hospitales_m: number
  importancia_farmacias: number
  distancia_maxima_farmacias_m: number
}

export interface PreferenciasServicios {
  importancia_supermercados: number
  distancia_maxima_supermercados_m: number
  importancia_malls: number
  distancia_maxima_malls_m: number
  importancia_restaurantes: number
  distancia_maxima_restaurantes_m: number
  importancia_gimnasios: number
  distancia_maxima_gimnasios_m: number
}

export interface PreferenciasAreasVerdes {
  importancia_parques: number
  distancia_maxima_parques_m: number
  importancia_plazas: number
  distancia_maxima_plazas_m: number
  importancia_ciclovias: number
}

export interface PreferenciasSeguridad {
  importancia_comisarias: number
  distancia_maxima_comisarias_m: number
  importancia_bomberos: number
  distancia_maxima_bomberos_m: number
  importancia_iluminacion: number
  importancia_vigilancia: number
}

export interface PreferenciasEdificio {
  // Gastos comunes
  gastos_comunes_max?: number
  importancia_gastos_bajos: number
  
  // Piso y altura
  importancia_piso_alto: number
  piso_minimo?: number
  piso_maximo?: number
  
  // Orientación
  importancia_orientacion: number
  orientaciones_preferidas?: string[]
  
  // Terraza
  necesita_terraza: boolean
  terraza_minima_m2?: number
  importancia_terraza: number
  
  // Tipo de departamento
  tipo_preferido?: string
  importancia_tipo: number
  
  // Privacidad
  departamentos_por_piso_max?: number
  importancia_privacidad: number
}

export interface PreferenciasDetalladasML {
  // Hard constraints
  precio_min?: number
  precio_max?: number
  superficie_min?: number
  superficie_max?: number
  dormitorios_min?: number
  dormitorios_max?: number
  banos_min?: number
  estacionamientos_min?: number
  
  // Ubicación
  comunas_preferidas?: string[]
  comunas_evitar?: string[]
  
  // Preferencias por categoría
  transporte?: PreferenciasTransporte
  educacion?: PreferenciasEducacion
  salud?: PreferenciasSalud
  servicios?: PreferenciasServicios
  areas_verdes?: PreferenciasAreasVerdes
  seguridad?: PreferenciasSeguridad
  edificio?: PreferenciasEdificio
  
  // Pesos globales
  peso_precio: number
  peso_ubicacion: number
  peso_tamano: number
  peso_transporte: number
  peso_educacion: number
  peso_salud: number
  peso_servicios: number
  peso_areas_verdes: number
  peso_edificio: number
}

export interface ScoreML {
  categoria: string
  score: number
  peso: number
  contribucion: number
  explicacion: string
  factores_positivos: string[]
  factores_negativos: string[]
}

export interface PropiedadRecomendadaML {
  id: number
  direccion: string
  comuna: string
  precio: number
  superficie_util: number
  dormitorios: number
  banos: number
  estacionamientos: number
  latitud: number
  longitud: number
  
  // Scoring
  score_total: number
  score_confianza: number
  scores_por_categoria: ScoreML[]
  
  // Explicación
  resumen_explicacion: string
  puntos_fuertes: string[]
  puntos_debiles: string[]
  
  // Distancias
  distancias: Record<string, number>
}

export interface RecomendacionesResponseML {
  total_encontradas: number
  total_analizadas: number
  recomendaciones: PropiedadRecomendadaML[]
  preferencias_aplicadas: any
  modelo_version: string
  timestamp: string
  sugerencias?: string[]
}

/**
 * Crea preferencias ML vacías con valores por defecto
 */
export const crearPreferenciasVacias = (): PreferenciasDetalladasML => ({
  peso_precio: 0.20,
  peso_ubicacion: 0.12,
  peso_tamano: 0.08,
  peso_transporte: 0.15,
  peso_educacion: 0.10,
  peso_salud: 0.10,
  peso_servicios: 0.08,
  peso_areas_verdes: 0.05,
  peso_edificio: 0.12
})

/**
 * Obtiene recomendaciones usando el sistema ML avanzado
 */
export const obtenerRecomendacionesML = async (
  preferencias: PreferenciasDetalladasML,
  limit: number = 10
): Promise<RecomendacionesResponseML> => {
  const response = await fetch(
    `http://localhost:8000/api/v1/recomendaciones-ml?limit=${limit}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencias)
    }
  )
  
  if (!response.ok) {
    throw new Error('Error obteniendo recomendaciones ML')
  }
  
  return await response.json()
}

/**
 * Obtiene label según valor de importancia
 */
export const getImportanciaLabel = (value: number): string => {
  if (value === 0) return 'Neutro'
  if (value <= -7) return `Evitar mucho (${value})`
  if (value < 0) return `Evitar (${value})`
  if (value <= 5) return `Importante (+${value})`
  return `Muy Importante (+${value})`
}

/**
 * Obtiene clase de color según valor de importancia
 */
export const getImportanciaColor = (value: number): string => {
  if (value === 0) return 'gray'
  if (value <= -7) return 'red'
  if (value < 0) return 'orange'
  if (value <= 5) return 'blue'
  return 'green'
}
