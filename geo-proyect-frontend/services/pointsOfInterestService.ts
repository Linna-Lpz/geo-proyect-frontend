const API_BASE_URL = 'http://localhost:8000/api/v1'

export interface PointOfInterest {
  id: number
  tipo: string // 'metro', 'colegio', 'centro_medico', 'supermercado', etc.
  nombre: string
  latitud: number
  longitud: number
  distancia?: number // distancia en metros desde la propiedad
}

export interface PointsOfInterestResponse {
  metros: PointOfInterest[]
  colegios: PointOfInterest[]
  centros_medicos: PointOfInterest[]
  supermercados: PointOfInterest[]
  parques: PointOfInterest[]
  farmacias: PointOfInterest[]
  comisarias: PointOfInterest[]
  bomberos: PointOfInterest[]
}

/**
 * Obtiene los puntos de interés cercanos a una coordenada
 * @param latitud Latitud de la propiedad
 * @param longitud Longitud de la propiedad
 * @param radio Radio de búsqueda en metros (default: 1000m = 1km)
 */
export const obtenerPuntosDeInteresCercanos = async (
  latitud: number,
  longitud: number,
  radio: number = 1000
): Promise<PointsOfInterestResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/puntos-interes/cercanos?latitud=${latitud}&longitud=${longitud}&radio=${radio}`
    )
    
    if (!response.ok) {
      throw new Error('Error al obtener puntos de interés')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error obteniendo puntos de interés:', error)
    // Retornar estructura vacía en caso de error
    return {
      metros: [],
      colegios: [],
      centros_medicos: [],
      supermercados: [],
      parques: [],
      farmacias: [],
      comisarias: [],
      bomberos: []
    }
  }
}

/**
 * Obtiene todos los puntos de interés de un tipo específico
 * @param tipo Tipo de punto de interés
 */
export const obtenerPuntosPorTipo = async (
  tipo: 'metro' | 'colegio' | 'centro_medico' | 'supermercado' | 'parque' | 'farmacia' | 'comisaria' | 'bombero'
): Promise<PointOfInterest[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/puntos-interes/tipo/${tipo}`
    )
    
    if (!response.ok) {
      throw new Error(`Error al obtener puntos de tipo ${tipo}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error obteniendo puntos de tipo ${tipo}:`, error)
    return []
  }
}
