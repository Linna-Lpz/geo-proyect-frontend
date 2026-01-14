/**
 * Servicio de Dashboard
 * 
 * Proporciona datos agregados y estadísticas para el dashboard
 * de visualización del proyecto de análisis inmobiliario
 */

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface EstadisticasGenerales {
  total_propiedades: number
  total_comunas: number
  sistema: string
}

export interface ComunaStats {
  nombre: string
  total_casas: number
  total_departamentos: number
  precio_promedio: number
  precio_min: number
  precio_max: number
  superficie_promedio: number
  dormitorios_promedio: number
}

export interface DistribucionPrecios {
  rangos: string[]
  cantidades: number[]
  porcentajes: number[]
}

export interface DistribucionTipos {
  tipos: string[]
  cantidades: number[]
}

export interface DatosGeoJSON {
  type: string
  features: GeoJSONFeature[]
}

export interface GeoJSONFeature {
  type: string
  properties: {
    comuna: string
    tipo_propiedad: string
    precio: string
    moneda: string
    dormitorios: string
    banos: string
    metros_utiles: string
    titulo: string
    ubicacion: string
    [key: string]: any
  }
  geometry: {
    type: string
    coordinates: number[]
  }
}

export interface PropiedadParsed {
  id: number
  comuna: string
  tipo: string
  precio_uf: number
  precio_clp: number
  dormitorios: number
  banos: number
  superficie: number
  latitud: number
  longitud: number
  titulo: string
  ubicacion: string
}

export interface DashboardData {
  estadisticas: EstadisticasGenerales
  propiedades: PropiedadParsed[]
  comunasStats: ComunaStats[]
  distribucionPrecios: DistribucionPrecios
  distribucionTipos: DistribucionTipos
  modeloInfo: {
    r2_precio: number
    r2_satisfaccion: number
    features_precio: number
    features_satisfaccion: number
  }
}

// ============================================================================
// CONSTANTES
// ============================================================================

const API_BASE_URL = 'http://localhost:8000/api/v1'
const VALOR_UF_CLP = 38500 // Valor aproximado UF

// Mapeo de archivos GeoJSON por comuna y tipo
const GEOJSON_FILES = {
  casas: [
    '/datos/casas_nunoa.geojson',
    '/datos/casas_la_reina.geojson',
    '/datos/casas_Santiago.geojson',
    '/datos/casas_estacon_central.geojson'
  ],
  departamentos: [
    '/datos/departamentos_nunoa.geojson',
    '/datos/departamentos_la_reina.geojson',
    '/datos/departamentos_Santiago.geojson',
    '/datos/departamentos_estacion_central.geojson'
  ]
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Parsea el precio desde string a número
 */
function parsearPrecio(precio: string, moneda: string): { uf: number; clp: number } {
  const valorNumerico = parseFloat(precio.replace(/[^\d.]/g, '')) || 0
  
  if (moneda === 'CLF' || moneda === 'UF') {
    return {
      uf: valorNumerico,
      clp: valorNumerico * VALOR_UF_CLP
    }
  } else if (moneda === 'CLP') {
    return {
      uf: valorNumerico / VALOR_UF_CLP,
      clp: valorNumerico
    }
  }
  
  return { uf: 0, clp: 0 }
}

/**
 * Parsea dormitorios desde string a número
 */
function parsearDormitorios(dormitorios: string): number {
  const match = dormitorios?.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

/**
 * Parsea baños desde string a número
 */
function parsearBanos(banos: string): number {
  const match = banos?.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

/**
 * Parsea superficie desde string a número
 */
function parsearSuperficie(metros: string): number {
  const match = metros?.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

// ============================================================================
// CLASE DEL SERVICIO
// ============================================================================

export class DashboardService {
  private propiedadesCache: PropiedadParsed[] = []
  
  /**
   * Obtiene estadísticas generales del sistema
   */
  async getEstadisticasGenerales(): Promise<EstadisticasGenerales> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/general`)
      if (!response.ok) throw new Error('Error obteniendo estadísticas')
      return await response.json()
    } catch (error) {
      console.error('Error en getEstadisticasGenerales:', error)
      // Retornar datos por defecto si falla
      return {
        total_propiedades: this.propiedadesCache.length,
        total_comunas: 4,
        sistema: 'Dashboard Local'
      }
    }
  }

  /**
   * Carga y parsea los archivos GeoJSON locales
   */
  async cargarPropiedadesGeoJSON(): Promise<PropiedadParsed[]> {
    if (this.propiedadesCache.length > 0) {
      return this.propiedadesCache
    }

    const propiedades: PropiedadParsed[] = []
    let idCounter = 1

    // Cargar casas
    for (const file of GEOJSON_FILES.casas) {
      try {
        const response = await fetch(file)
        if (response.ok) {
          const data: DatosGeoJSON = await response.json()
          for (const feature of data.features) {
            const precio = parsearPrecio(feature.properties.precio, feature.properties.moneda)
            propiedades.push({
              id: idCounter++,
              comuna: feature.properties.comuna || 'Sin comuna',
              tipo: 'Casa',
              precio_uf: precio.uf,
              precio_clp: precio.clp,
              dormitorios: parsearDormitorios(feature.properties.dormitorios),
              banos: parsearBanos(feature.properties.banos),
              superficie: parsearSuperficie(feature.properties.metros_utiles),
              latitud: feature.geometry.coordinates[1],
              longitud: feature.geometry.coordinates[0],
              titulo: feature.properties.titulo || '',
              ubicacion: feature.properties.ubicacion || ''
            })
          }
        }
      } catch (error) {
        console.warn(`No se pudo cargar ${file}:`, error)
      }
    }

    // Cargar departamentos
    for (const file of GEOJSON_FILES.departamentos) {
      try {
        const response = await fetch(file)
        if (response.ok) {
          const data: DatosGeoJSON = await response.json()
          for (const feature of data.features) {
            const precio = parsearPrecio(feature.properties.precio, feature.properties.moneda)
            propiedades.push({
              id: idCounter++,
              comuna: feature.properties.comuna || 'Sin comuna',
              tipo: 'Departamento',
              precio_uf: precio.uf,
              precio_clp: precio.clp,
              dormitorios: parsearDormitorios(feature.properties.dormitorios),
              banos: parsearBanos(feature.properties.banos),
              superficie: parsearSuperficie(feature.properties.metros_utiles),
              latitud: feature.geometry.coordinates[1],
              longitud: feature.geometry.coordinates[0],
              titulo: feature.properties.titulo || '',
              ubicacion: feature.properties.ubicacion || ''
            })
          }
        }
      } catch (error) {
        console.warn(`No se pudo cargar ${file}:`, error)
      }
    }

    this.propiedadesCache = propiedades
    return propiedades
  }

  /**
   * Calcula estadísticas por comuna
   */
  calcularEstadisticasComunas(propiedades: PropiedadParsed[]): ComunaStats[] {
    const comunasMap = new Map<string, PropiedadParsed[]>()
    
    for (const prop of propiedades) {
      const comunaKey = prop.comuna
      if (!comunasMap.has(comunaKey)) {
        comunasMap.set(comunaKey, [])
      }
      comunasMap.get(comunaKey)!.push(prop)
    }

    const stats: ComunaStats[] = []
    
    for (const [nombre, props] of comunasMap) {
      const casas = props.filter(p => p.tipo === 'Casa')
      const departamentos = props.filter(p => p.tipo === 'Departamento')
      const precios = props.map(p => p.precio_uf).filter(p => p > 0)
      const superficies = props.map(p => p.superficie).filter(s => s > 0)
      const dormitorios = props.map(p => p.dormitorios).filter(d => d > 0)

      stats.push({
        nombre,
        total_casas: casas.length,
        total_departamentos: departamentos.length,
        precio_promedio: precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0,
        precio_min: precios.length > 0 ? Math.min(...precios) : 0,
        precio_max: precios.length > 0 ? Math.max(...precios) : 0,
        superficie_promedio: superficies.length > 0 ? superficies.reduce((a, b) => a + b, 0) / superficies.length : 0,
        dormitorios_promedio: dormitorios.length > 0 ? dormitorios.reduce((a, b) => a + b, 0) / dormitorios.length : 0
      })
    }

    return stats.sort((a, b) => (b.total_casas + b.total_departamentos) - (a.total_casas + a.total_departamentos))
  }

  /**
   * Calcula distribución de precios por rangos
   */
  calcularDistribucionPrecios(propiedades: PropiedadParsed[]): DistribucionPrecios {
    const rangos = [
      { label: '0-2,500 UF', min: 0, max: 2500 },
      { label: '2,500-5,000 UF', min: 2500, max: 5000 },
      { label: '5,000-7,500 UF', min: 5000, max: 7500 },
      { label: '7,500-10,000 UF', min: 7500, max: 10000 },
      { label: '10,000-15,000 UF', min: 10000, max: 15000 },
      { label: '15,000-20,000 UF', min: 15000, max: 20000 },
      { label: '20,000+ UF', min: 20000, max: Infinity }
    ]

    const cantidades: number[] = []
    const total = propiedades.filter(p => p.precio_uf > 0).length

    for (const rango of rangos) {
      const count = propiedades.filter(
        p => p.precio_uf >= rango.min && p.precio_uf < rango.max
      ).length
      cantidades.push(count)
    }

    const porcentajes = cantidades.map(c => total > 0 ? (c / total) * 100 : 0)

    return {
      rangos: rangos.map(r => r.label),
      cantidades,
      porcentajes
    }
  }

  /**
   * Calcula distribución por tipo de propiedad
   */
  calcularDistribucionTipos(propiedades: PropiedadParsed[]): DistribucionTipos {
    const tipos = ['Casa', 'Departamento']
    const cantidades = tipos.map(tipo => 
      propiedades.filter(p => p.tipo === tipo).length
    )

    return { tipos, cantidades }
  }

  /**
   * Obtiene información de los modelos ML
   */
  async getModeloInfo(): Promise<{ r2_precio: number; r2_satisfaccion: number; features_precio: number; features_satisfaccion: number }> {
    try {
      const [precioResponse, satisfaccionResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/modelo-info`).catch(() => null),
        fetch(`${API_BASE_URL}/satisfaccion-info`).catch(() => null)
      ])

      let r2_precio = 0.489  // Valor por defecto del stacking
      let r2_satisfaccion = 0.8697  // Valor por defecto del LightGBM
      let features_precio = 16
      let features_satisfaccion = 42

      if (precioResponse?.ok) {
        const data = await precioResponse.json()
        r2_precio = data.metricas?.stacking?.r2 || 0.489
      }

      if (satisfaccionResponse?.ok) {
        const data = await satisfaccionResponse.json()
        r2_satisfaccion = data.metricas?.r2_test || 0.8697
        features_satisfaccion = data.num_features || 42
      }

      return { r2_precio, r2_satisfaccion, features_precio, features_satisfaccion }
    } catch (error) {
      console.error('Error obteniendo info de modelos:', error)
      return {
        r2_precio: 0.489,
        r2_satisfaccion: 0.8697,
        features_precio: 16,
        features_satisfaccion: 42
      }
    }
  }

  /**
   * Obtiene todos los datos del dashboard
   */
  async getDashboardData(): Promise<DashboardData> {
    // Cargar propiedades desde GeoJSON locales
    const propiedades = await this.cargarPropiedadesGeoJSON()
    
    // Calcular estadísticas
    const comunasStats = this.calcularEstadisticasComunas(propiedades)
    const distribucionPrecios = this.calcularDistribucionPrecios(propiedades)
    const distribucionTipos = this.calcularDistribucionTipos(propiedades)
    
    // Obtener info de modelos y estadísticas generales
    const [modeloInfo, estadisticas] = await Promise.all([
      this.getModeloInfo(),
      this.getEstadisticasGenerales()
    ])

    // Actualizar estadísticas con datos reales
    estadisticas.total_propiedades = propiedades.length
    estadisticas.total_comunas = comunasStats.length

    return {
      estadisticas,
      propiedades,
      comunasStats,
      distribucionPrecios,
      distribucionTipos,
      modeloInfo
    }
  }

  /**
   * Filtra propiedades según criterios
   */
  filtrarPropiedades(
    propiedades: PropiedadParsed[],
    filtros: {
      comuna?: string
      tipo?: string
      precioMin?: number
      precioMax?: number
      dormitoriosMin?: number
      superficieMin?: number
    }
  ): PropiedadParsed[] {
    return propiedades.filter(prop => {
      if (filtros.comuna && filtros.comuna !== 'Todas' && prop.comuna !== filtros.comuna) return false
      if (filtros.tipo && filtros.tipo !== 'Todos' && prop.tipo !== filtros.tipo) return false
      if (filtros.precioMin && prop.precio_uf < filtros.precioMin) return false
      if (filtros.precioMax && prop.precio_uf > filtros.precioMax) return false
      if (filtros.dormitoriosMin && prop.dormitorios < filtros.dormitoriosMin) return false
      if (filtros.superficieMin && prop.superficie < filtros.superficieMin) return false
      return true
    })
  }
}

// ============================================================================
// UTILIDADES DE FORMATO
// ============================================================================

/**
 * Formatea número como moneda CLP
 */
export const formatCLP = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Formatea número como UF
 */
export const formatUF = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' UF'
}

/**
 * Formatea porcentaje
 */
export const formatPercent = (value: number): string => {
  return value.toFixed(1) + '%'
}

// Exportar instancia singleton
export const dashboardService = new DashboardService()
export default dashboardService
