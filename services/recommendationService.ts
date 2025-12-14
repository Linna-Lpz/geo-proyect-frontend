/**
 * Servicio de Recomendaciones de Propiedades
 * Cliente para el endpoint de recomendaciones del backend
 */

export interface PreferenciasUsuario {
  // Presupuesto
  precio_min?: number;
  precio_max?: number;
  
  // Características físicas
  superficie_min?: number;
  superficie_max?: number;
  dormitorios_min?: number;
  dormitorios_max?: number;
  banos_min?: number;
  
  // Ubicación
  comunas_preferidas?: string[];
  
  // Prioridades (0-10)
  prioridad_precio: number;
  prioridad_ubicacion: number;
  prioridad_transporte: number;
  prioridad_educacion: number;
  prioridad_salud: number;
  prioridad_areas_verdes: number;
  prioridad_tamano: number;
  
  // Características a EVITAR (nuevo)
  evitar_colegios?: boolean;
  evitar_hospitales?: boolean;
  evitar_metro?: boolean;
  evitar_areas_verdes?: boolean;
  
  // Requisitos específicos
  requiere_estacionamiento: boolean;
  tipo_departamento?: string;
  // Nuevo: tipo de inmueble preferido (Casa, Departamento, etc.)
  tipo_inmueble_preferido?: string;
  // Nuevo: comuna seleccionada por el usuario (single-select)
  comuna_seleccionada?: string;
  // Nuevo: ruido ambiente preferido
  ruido_ambiente?: 'bajo' | 'medio' | 'alto';
  // Nuevo: preferencias urbanas (cercanía a comercio/transporte/parques, tranquilidad)
  preferencias_urbanas?: {
    cerca_comercio?: boolean;
    cerca_transporte?: boolean;
    cerca_areas_verdes?: boolean;
    tranquilo?: boolean;
    prioridad?: Record<string, number> | null;
  };
  piso_maximo?: number;
}

export interface ScoreDetallado {
  precio: number;
  ubicacion: number;
  tamano: number;
  transporte: number;
  educacion: number;
  salud: number;
  areas_verdes: number;
}

export interface PropiedadRecomendada {
  id: number;
  direccion: string;
  comuna: string;
  precio: number; // Precio en UF
  superficie_util: number | null;
  dormitorios: number;
  banos: number;
  estacionamientos: number | null;
  latitud: number;
  longitud: number;
  score_total: number;
  scores_detallados: ScoreDetallado;
  explicacion: string[];
  dist_metro_m: number | null;
  dist_educacion_min_m: number | null;
  dist_salud_min_m: number | null;
  dist_areas_verdes_m: number | null;
}

export interface RecomendacionesResponse {
  total_encontradas: number;
  total_analizadas: number;
  preferencias_aplicadas: Record<string, any>;
  recomendaciones: PropiedadRecomendada[];
}

class RecommendationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:8000/api/v1';
  }

  /**
   * Obtiene recomendaciones de propiedades basadas en preferencias
   */
  async obtenerRecomendaciones(
    preferencias: PreferenciasUsuario,
    limit: number = 10
  ): Promise<RecomendacionesResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/recomendaciones?limit=${limit}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferencias),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al obtener recomendaciones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerRecomendaciones:', error);
      throw error;
    }
  }

  /**
   * Valor de la UF en CLP (actualizar periódicamente)
   * Fuente: Banco Central de Chile
   */
  private readonly VALOR_UF_CLP = 37500;

  /**
   * Convierte UF a CLP
   */
  ufToCLP(uf: number): number {
    return uf * this.VALOR_UF_CLP;
  }

  /**
   * Formatea precio en UF con conversión a CLP
   */
  formatearPrecio(precioUF: number): string {
    const precioCLP = this.ufToCLP(precioUF);
    const ufFormateado = precioUF.toLocaleString('es-CL', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
    const clpFormateado = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(precioCLP);
    
    return `${ufFormateado} UF (≈${clpFormateado})`;
  }

  /**
   * Formatea solo UF
   */
  formatearPrecioUF(precioUF: number): string {
    return `${precioUF.toLocaleString('es-CL', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })} UF`;
  }

  /**
   * Formatea solo CLP
   */
  formatearPrecioCLP(precioUF: number): string {
    const precioCLP = this.ufToCLP(precioUF);
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(precioCLP);
  }

  /**
   * Formatea distancia (metros a texto legible)
   */
  formatearDistancia(metros: number | null): string {
    if (metros === null) return 'N/A';
    if (metros < 1000) {
      return `${Math.round(metros)}m`;
    }
    return `${(metros / 1000).toFixed(1)}km`;
  }

  /**
   * Obtiene color según score (para visualización)
   */
  getColorScore(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  }

  /**
   * Obtiene emoji según categoría de score
   */
  getEmojiScore(score: number): string {
    if (score >= 80) return 'trophy';
    if (score >= 60) return 'star';
    if (score >= 40) return 'thumbs';
    return 'idea';
  }
}

export const recommendationService = new RecommendationService();
