<template>
  <div v-if="prediction" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
    <!-- Título -->
    <div class="text-center mb-6">
      <h3 class="text-2xl font-bold text-gray-800 mb-2"><i class="pi pi-money-bill mr-2"></i>Precio Estimado</h3>
      <p class="text-gray-600">Predicción basada en Machine Learning</p>
      <div class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm" :class="getConfidenceClass(prediction.confianza)">
        <span class="mr-1">Confianza:</span>
        <strong>{{ (prediction.confianza * 100).toFixed(0) }}%</strong>
        <span class="ml-2 text-xs">({{ prediction.metodo }})</span>
      </div>
    </div>

    <!-- Precio Principal -->
    <div class="bg-white rounded-lg p-6 mb-6 text-center shadow-md">
      <div class="text-5xl font-bold text-blue-600 mb-2">
        {{ formatPriceUF(prediction.precio_total_estimado) }}
      </div>
      <div class="text-sm text-gray-400 mb-3">
        {{ formatPriceCLP(prediction.precio_total_estimado) }}
      </div>
      <div class="text-gray-600 text-lg">
        {{ formatPricePerM2UF(prediction.precio_m2_predicho) }}
      </div>
      <div class="text-xs text-gray-400">
        {{ formatPricePerM2CLP(prediction.precio_m2_predicho) }}
      </div>
    </div>

    <!-- Rango de Precios -->
    <div class="bg-white rounded-lg p-6 mb-6 shadow-md">
      <h4 class="text-sm font-semibold text-gray-700 mb-3"><i class="pi pi-chart-line mr-2"></i>Rango Estimado (±15%)</h4>
      <div class="flex items-center justify-between mb-2">
        <div class="text-center flex-1">
          <div class="text-sm text-gray-600 mb-1">Mínimo</div>
          <div class="text-xl font-bold text-green-600">
            {{ formatPriceUF(precioMin) }}
          </div>
          <div class="text-xs text-gray-400 mt-1">
            {{ formatPriceCLP(precioMin) }}
          </div>
        </div>
        <div class="px-4 text-gray-400">→</div>
        <div class="text-center flex-1">
          <div class="text-sm text-gray-600 mb-1">Máximo</div>
          <div class="text-xl font-bold text-red-600">
            {{ formatPriceUF(precioMax) }}
          </div>
          <div class="text-xs text-gray-400 mt-1">
            {{ formatPriceCLP(precioMax) }}
          </div>
        </div>
      </div>
      
      <!-- Barra visual -->
      <div class="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-green-500 via-blue-500 to-red-500"
          style="width: 100%"
        ></div>
      </div>
    </div>

    <!-- Detalles de la Propiedad -->
    <div class="bg-white rounded-lg p-6 mb-6 shadow-md">
      <h4 class="text-sm font-semibold text-gray-700 mb-4"><i class="pi pi-home mr-2"></i>Características de la Propiedad</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl mb-1 text-blue-600"><i class="pi pi-arrows-h"></i></div>
          <div class="text-sm text-gray-600">Superficie</div>
          <div class="font-semibold text-gray-800">{{ prediction.inputs?.superficie_util || 'N/A' }} m²</div>
        </div>
        <div class="text-center">
          <div class="text-2xl mb-1 text-blue-600"><i class="pi pi-users"></i></div>
          <div class="text-sm text-gray-600">Dormitorios</div>
          <div class="font-semibold text-gray-800">{{ prediction.inputs?.dormitorios || 'N/A' }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl mb-1 text-blue-600"><i class="pi pi-home"></i></div>
          <div class="text-sm text-gray-600">Baños</div>
          <div class="font-semibold text-gray-800">{{ prediction.inputs?.banos || 'N/A' }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl mb-1 text-blue-600"><i class="pi pi-car"></i></div>
          <div class="text-sm text-gray-600">Estacionamientos</div>
          <div class="font-semibold text-gray-800">{{ prediction.inputs?.estacionamientos || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- Features Calculadas -->
    <div v-if="prediction.features_calculadas" class="bg-white rounded-lg p-6 mb-6 shadow-md">
      <h4 class="text-sm font-semibold text-gray-700 mb-4"><i class="pi pi-calculator mr-2"></i>Variables Calculadas</h4>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div v-if="prediction.features_calculadas.m2_por_habitante">
          <span class="text-gray-600">m² por habitante:</span>
          <strong class="ml-1">{{ prediction.features_calculadas.m2_por_habitante.toFixed(2) }}</strong>
        </div>
        <div v-if="prediction.features_calculadas.total_habitaciones">
          <span class="text-gray-600">Total habitaciones:</span>
          <strong class="ml-1">{{ prediction.features_calculadas.total_habitaciones }}</strong>
        </div>
        <div v-if="prediction.features_calculadas.ratio_bano_dorm">
          <span class="text-gray-600">Ratio baño/dorm:</span>
          <strong class="ml-1">{{ prediction.features_calculadas.ratio_bano_dorm.toFixed(2) }}</strong>
        </div>
      </div>
    </div>

    <!-- Metadata -->
    <div class="text-center text-xs text-gray-500">
      <div v-if="prediction.cluster_asignado !== undefined">Cluster: {{ prediction.cluster_asignado }}</div>
      <div>{{ formatTimestamp(prediction.timestamp) }}</div>
      <div class="mt-1 text-gray-400">Valor UF: {{ predictionService.formatPrice(valorUF) }} (actualizado hoy)</div>
    </div>

    <!-- Botón Nueva Predicción -->
    <div class="mt-6 text-center">
      <button
        @click="$emit('reset')"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
  <i class="pi pi-refresh mr-2"></i> Nueva Predicción
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { predictionService, type PrediccionResponse } from '~/services/predictionService';

const props = defineProps<{
  prediction: PrediccionResponse | null;
}>();

defineEmits<{
  (e: 'reset'): void;
}>();

const valorUF = ref<number>(37500);

onMounted(async () => {
  valorUF.value = await predictionService.getUFValue();
});

const precioMin = computed(() => {
  if (!props.prediction) return 0;
  return props.prediction.precio_total_estimado * 0.85; // -15%
});

const precioMax = computed(() => {
  if (!props.prediction) return 0;
  return props.prediction.precio_total_estimado * 1.15; // +15%
});

const getConfidenceClass = (confianza: number) => {
  if (confianza >= 0.7) return 'bg-green-100 text-green-800';
  if (confianza >= 0.4) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const formatPriceUF = (priceUF: number) => {
  return `${predictionService.formatPriceUF(priceUF)} UF`;
};

const formatPriceCLP = (priceUF: number) => {
  const clp = predictionService.convertUFtoCLP(priceUF, valorUF.value);
  return `${predictionService.formatPrice(clp)} CLP`;
};

const formatPricePerM2UF = (priceUF: number) => {
  return `${predictionService.formatPriceUF(priceUF)} UF/m²`;
};

const formatPricePerM2CLP = (priceUF: number) => {
  const clp = predictionService.convertUFtoCLP(priceUF, valorUF.value);
  return `${predictionService.formatPricePerM2(clp)} CLP`;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
