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
  metodo_usado: string;
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
}

export const predictionService = new PredictionService();
export default predictionService;
