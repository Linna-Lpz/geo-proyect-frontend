<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
    <div class="container mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          <i class="pi pi-home mr-2 text-blue-700"></i>Predictor de Precios Inmobiliarios
        </h1>
        <p class="text-gray-600 text-lg">
          Estimación inteligente basada en Machine Learning
        </p>
        <div class="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
          <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          {{ serverStatus }}
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="max-w-6xl mx-auto">
        <div v-if="!currentPrediction" class="mb-8">
          <PredictionForm @prediction="handlePrediction" />
        </div>

        <div v-else>
          <PredictionResult 
            :prediction="currentPrediction" 
            @reset="resetPrediction"
          />
        </div>

        <!-- Historial de Predicciones -->
        <div v-if="predictionHistory.length > 0" class="mt-12">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
              <i class="pi pi-history mr-2"></i>Historial de Predicciones
            </h3>
            <div class="space-y-3">
              <div
                v-for="(pred, index) in predictionHistory"
                :key="index"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                @click="currentPrediction = pred"
              >
                <div class="flex items-center space-x-4">
                  <div class="text-2xl text-blue-600"><i class="pi pi-home"></i></div>
                  <div>
                    <div class="font-semibold text-gray-800">
                      {{ pred.inputs?.superficie_util || 'N/A' }}m² • {{ pred.inputs?.dormitorios || 0 }}D/{{ pred.inputs?.banos || 0 }}B
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ formatTimestamp(pred.timestamp) }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-blue-600">
                    {{ formatPrice(pred.precio_total_estimado) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatPricePerM2(pred.precio_m2_predicho) }}/m²
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del Modelo -->
        <div class="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4"><i class="pi pi-info-circle mr-2"></i>Acerca del Modelo</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div class="text-blue-700 font-semibold mb-1">Algoritmo</div>
              <div class="text-gray-700">Random Forest Optimizado</div>
            </div>
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div class="text-green-700 font-semibold mb-1">Precisión (R²)</div>
              <div class="text-gray-700">91.4% (0.914)</div>
            </div>
            <div class="bg-gray-100 border border-gray-300 p-4 rounded-lg">
              <div class="text-gray-700 font-semibold mb-1">Features</div>
              <div class="text-gray-700">16 variables predictoras</div>
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-600">
            <p><strong>Comunas soportadas:</strong> Estación Central, Santiago, Ñuñoa, La Reina</p>
            <p class="mt-2"><strong>Variables consideradas:</strong> Superficie, dormitorios, baños, ubicación (lat/lon), características calculadas</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { predictionService, type PrediccionResponse } from '~/services/predictionService';

definePageMeta({
  title: 'Predictor de Precios ML'
});

const currentPrediction = ref<PrediccionResponse | null>(null);
const predictionHistory = ref<PrediccionResponse[]>([]);
const serverStatus = ref('Verificando servidor...');

onMounted(async () => {
  try {
    const health = await predictionService.healthCheck();
    if (health.status === 'healthy') {
      serverStatus.value = 'Servidor conectado';
    } else {
      serverStatus.value = 'Servidor con problemas';
    }
  } catch (error) {
    serverStatus.value = 'Servidor desconectado';
    console.error('Error conectando al servidor:', error);
  }
});

const handlePrediction = (prediction: PrediccionResponse) => {
  currentPrediction.value = prediction;
  predictionHistory.value.unshift(prediction);
  
  // Limitar historial a 10 predicciones
  if (predictionHistory.value.length > 10) {
    predictionHistory.value = predictionHistory.value.slice(0, 10);
  }
};

const resetPrediction = () => {
  currentPrediction.value = null;
};

const formatPrice = (price: number) => {
  return predictionService.formatPrice(price);
};

const formatPricePerM2 = (price: number) => {
  return predictionService.formatPricePerM2(price);
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('es-CL', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
