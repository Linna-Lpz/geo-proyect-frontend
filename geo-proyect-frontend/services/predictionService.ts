/**
 * Servicio para interactuar con la API de predicción de precios inmobiliarios
 */

interface PrediccionRequest {
  superficie: number;
  dormitorios: number;
  banos: number;
  comuna: string;
  dist_metro?: number;
  dist_supermercado?: number;
  dist_area_verde?: number;
  dist_colegio?: number;
  dist_hospital?: number;
  dist_mall?: number;
}

interface PrediccionResponse {
  precio_predicho: number;
  precio_log: number;
  precio_min: number;
  precio_max: number;
  precio_m2: number;
  modelo_r2: number;
  modelo_version: string;
  timestamp: string;
  inputs: PrediccionRequest;
}

interface Comuna {
  nombre: string;
  total_propiedades: number;
  precio_promedio: number | null;
  precio_m2_promedio: number | null;
}

interface HealthCheck {
  status: string;
  version: string;
  database: string;
  modelo: string;
  timestamp: string;
}

export class PredictionService {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL;
  }

  /**
   * Verifica el estado del servidor
   */
  async healthCheck(): Promise<HealthCheck> {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) {
      throw new Error(`Error en health check: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Obtiene la lista de comunas disponibles
   */
  async getComunas(): Promise<Comuna[]> {
    const response = await fetch(`${this.baseURL}/comunas`);
    if (!response.ok) {
      throw new Error(`Error obteniendo comunas: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Realiza una predicción de precio
   */
  async predecirPrecio(data: PrediccionRequest): Promise<PrediccionResponse> {
    const response = await fetch(`${this.baseURL}/prediccion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error en predicción: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Obtiene el historial de predicciones
   */
  async getPredicciones(skip: number = 0, limit: number = 10): Promise<PrediccionResponse[]> {
    const response = await fetch(`${this.baseURL}/predicciones?skip=${skip}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error obteniendo predicciones: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Formatea el precio en CLP
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Formatea el precio por m²
   */
  formatPricePerM2(price: number): string {
    return `${this.formatPrice(price)}/m²`;
  }
}

// Exportar instancia singleton
export const predictionService = new PredictionService();

// Tipos exportados
export type {
  PrediccionRequest,
  PrediccionResponse,
  Comuna,
  HealthCheck,
};
