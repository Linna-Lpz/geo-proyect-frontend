export interface PrediccionRequest {
  superficie_util: number;
  dormitorios: number;
  banos: number;
  estacionamientos: number;
  bodegas: number;
  latitud: number;
  longitud: number;
  cant_max_habitantes?: number;
  usar_stacking?: boolean;
}

export interface PrediccionResponse {
  precio_m2_predicho: number;
  precio_total_estimado: number;
  confianza: number;
  metodo: string;
  cluster_asignado?: number;
  predicciones_base?: any;
  features_calculadas?: any;
  timestamp?: string;
}

export interface ModeloInfo {
  modelo_cargado: boolean;
  r2_score: number | null;
  metodo_disponible: string;
  mensaje: string;
}

export class PredictionService {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL;
  }

  async predecirPrecio(data: PrediccionRequest): Promise<PrediccionResponse> {
    const response = await fetch(`${this.baseURL}/predecir-precio`, {
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

  async getModeloInfo(): Promise<ModeloInfo> {
    const response = await fetch(`${this.baseURL}/modelo-info`);
    if (!response.ok) {
      throw new Error(`Error obteniendo info del modelo: ${response.statusText}`);
    }
    return await response.json();
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (response.ok) {
        return { status: 'healthy' };
      }
      return { status: 'unhealthy' };
    } catch {
      return { status: 'unreachable' };
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  formatPriceUF(priceUF: number): string {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceUF);
  }

  formatPricePerM2(price: number): string {
    return `${this.formatPrice(price)}/m²`;
  }

  async getUFValue(): Promise<number> {
    try {
      // API del Banco Central de Chile o servicio alternativo
      const response = await fetch('https://mindicador.cl/api/uf');
      if (response.ok) {
        const data = await response.json();
        return data.serie[0].valor;
      }
    } catch (error) {
      console.warn('No se pudo obtener valor UF actualizado, usando valor por defecto');
    }
    // Valor por defecto aproximado (actualizar manualmente si es necesario)
    return 37500; // UF aproximada en CLP
  }

  convertUFtoCLP(uf: number, valorUF: number): number {
    return uf * valorUF;
  }
}

export const predictionService = new PredictionService();
export default predictionService;
