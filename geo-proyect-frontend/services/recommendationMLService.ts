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
 * Transforma preferencias del frontend al formato del backend
 */
const transformarPreferenciasParaBackend = (preferencias: PreferenciasDetalladasML) => {
  return {
    // Campos obligatorios
    tipo_propiedad: "Casa", // Por ahora hardcodeado, en BD solo hay Casas
    presupuesto: preferencias.precio_max || 200000000,
    dormitorios: preferencias.dormitorios_min || 2,
    banos: preferencias.banos_min || 1,
    
    // Pesos opcionales (-10 a +10)
    peso_transporte: preferencias.peso_transporte || 0,
    peso_educacion: preferencias.peso_educacion || 0,
    peso_salud: preferencias.peso_salud || 0,
    peso_recreacion: preferencias.peso_areas_verdes || 0,
    peso_servicios: preferencias.peso_servicios || 0,
    peso_seguridad: 0, // No está en frontend, default 0
    peso_areas_verdes: preferencias.peso_areas_verdes || 0,
    peso_ruido: 0, // No está en frontend, default 0
    peso_calidad_aire: 0, // No está en frontend, default 0
    peso_cultura: 0 // No está en frontend, default 0
  }
}

/**
 * Obtiene recomendaciones usando el sistema ML avanzado
 */
export const obtenerRecomendacionesML = async (
  preferencias: PreferenciasDetalladasML,
  limit: number = 10
): Promise<RecomendacionesResponseML> => {
  // Transformar preferencias al formato del backend
  const preferenciasBackend = transformarPreferenciasParaBackend(preferencias)
  
  const response = await fetch(
    `http://localhost:8000/api/v1/recomendaciones-ml`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenciasBackend)
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error del backend:', errorText)
    throw new Error('Error obteniendo recomendaciones ML')
  }
  
  const data = await response.json()
  
  // Adaptar respuesta del backend al formato esperado por el frontend
  return {
    total_encontradas: data.length,
    total_analizadas: data.length,
    recomendaciones: data.map((prop: any, index: number) => ({
      id: prop.id,
      direccion: `${prop.comuna_nombre}, Propiedad #${prop.id}`,
      comuna: prop.comuna_nombre,
      precio: prop.precio,
      superficie_util: prop.superficie_construida,
      dormitorios: prop.dormitorios,
      banos: prop.banos,
      estacionamientos: 1,
      latitud: 0,
      longitud: 0,
      score_total: prop.score,
      score_confianza: 0.85,
      scores_por_categoria: [],
      resumen_explicacion: `Propiedad con score de ${prop.score}/100`,
      puntos_fuertes: ['Buena ubicación', 'Precio competitivo'],
      puntos_debiles: [],
      distancias: {
        metro: prop.distancia_metro,
        colegio: prop.distancia_colegio,
        hospital: prop.distancia_hospital,
        parque: prop.distancia_parque
      }
    })),
    preferencias_aplicadas: preferenciasBackend,
    modelo_version: 'v1.0',
    timestamp: new Date().toISOString(),
    sugerencias: []
  }
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
