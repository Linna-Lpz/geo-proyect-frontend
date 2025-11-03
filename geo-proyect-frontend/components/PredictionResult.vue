<template>
  <div v-if="prediction" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
    <!-- Título -->
    <div class="text-center mb-6">
  <h3 class="text-2xl font-bold text-gray-800 mb-2"><i class="pi pi-money-bill mr-2"></i>Precio Estimado</h3>
      <p class="text-gray-600">Predicción basada en Machine Learning (R²={{ (prediction.modelo_r2 * 100).toFixed(1) }}%)</p>
    </div>

    <!-- Precio Principal -->
    <div class="bg-white rounded-lg p-6 mb-6 text-center shadow-md">
      <div class="text-5xl font-bold text-blue-600 mb-2">
        {{ formatPrice(prediction.precio_predicho) }}
      </div>
      <div class="text-gray-600 text-lg">
        {{ formatPricePerM2(prediction.precio_m2) }}
      </div>
    </div>

    <!-- Rango de Precios -->
    <div class="bg-white rounded-lg p-6 mb-6 shadow-md">
  <h4 class="text-sm font-semibold text-gray-700 mb-3"><i class="pi pi-chart-line mr-2"></i>Intervalo de Confianza (95%)</h4>
      <div class="flex items-center justify-between mb-2">
        <div class="text-center flex-1">
          <div class="text-sm text-gray-600 mb-1">Mínimo</div>
          <div class="text-xl font-bold text-green-600">
            {{ formatPrice(prediction.precio_min) }}
          </div>
        </div>
        <div class="px-4 text-gray-400">→</div>
        <div class="text-center flex-1">
          <div class="text-sm text-gray-600 mb-1">Máximo</div>
          <div class="text-xl font-bold text-red-600">
            {{ formatPrice(prediction.precio_max) }}
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
    <div class="text-2xl mb-1"><i class="pi pi-arrows-h"></i></div>
          <div class="text-sm text-gray-600">Superficie</div>
          <div class="font-semibold text-gray-800">{{ prediction.inputs.superficie }} m²</div>
        </div>
        <div class="text-center">
          <div class="text-2xl mb-1"><i class="pi pi-user"></i></div>
          <div class="text-sm text-gray-600">Dormitorios</div>
          <div class="font-semibold text-gray-800">{{ prediction.inputs.dormitorios }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl mb-1"><i class="pi pi-shower"></i></div>
          <div class="text-sm text-gray-600">Baños</div>
          <div class="font-semibold text-gray-800">{{ prediction.inputs.banos }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl mb-1"><i class="pi pi-map-marker"></i></div>
          <div class="text-sm text-gray-600">Comuna</div>
          <div class="font-semibold text-gray-800">{{ prediction.inputs.comuna }}</div>
        </div>
      </div>
    </div>

    <!-- Distancias (si existen) -->
    <div v-if="hasDistances" class="bg-white rounded-lg p-6 mb-6 shadow-md">
  <h4 class="text-sm font-semibold text-gray-700 mb-4"><i class="pi pi-ruler mr-1"></i>Distancias Consideradas</h4>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div v-if="prediction.inputs.dist_metro" class="flex items-center">
          <i class="pi pi-train text-blue-500 mr-2"></i>
          <span class="text-sm">Metro: <strong>{{ prediction.inputs.dist_metro }} km</strong></span>
        </div>
        <div v-if="prediction.inputs.dist_area_verde" class="flex items-center">
          <i class="pi pi-tree text-green-500 mr-2"></i>
          <span class="text-sm">Parque: <strong>{{ prediction.inputs.dist_area_verde }} km</strong></span>
        </div>
        <div v-if="prediction.inputs.dist_hospital" class="flex items-center">
          <i class="pi pi-hospital text-red-500 mr-2"></i>
          <span class="text-sm">Hospital: <strong>{{ prediction.inputs.dist_hospital }} km</strong></span>
        </div>
        <div v-if="prediction.inputs.dist_colegio" class="flex items-center">
          <i class="pi pi-book text-yellow-500 mr-2"></i>
          <span class="text-sm">Colegio: <strong>{{ prediction.inputs.dist_colegio }} km</strong></span>
        </div>
        <div v-if="prediction.inputs.dist_supermercado" class="flex items-center">
          <i class="pi pi-shopping-cart text-purple-500 mr-2"></i>
          <span class="text-sm">Supermercado: <strong>{{ prediction.inputs.dist_supermercado }} km</strong></span>
        </div>
        <div v-if="prediction.inputs.dist_mall" class="flex items-center">
          <i class="pi pi-building text-pink-500 mr-2"></i>
          <span class="text-sm">Mall: <strong>{{ prediction.inputs.dist_mall }} km</strong></span>
        </div>
      </div>
    </div>

    <!-- Metadata -->
    <div class="text-center text-xs text-gray-500">
      <div>Modelo: {{ prediction.modelo_version }}</div>
      <div>Timestamp: {{ formatTimestamp(prediction.timestamp) }}</div>
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
import { computed } from 'vue';
import { predictionService, type PrediccionResponse } from '~/services/predictionService';

const props = defineProps<{
  prediction: PrediccionResponse | null;
}>();

defineEmits<{
  (e: 'reset'): void;
}>();

const hasDistances = computed(() => {
  if (!props.prediction?.inputs) return false;
  return !!(
    props.prediction.inputs.dist_metro ||
    props.prediction.inputs.dist_area_verde ||
    props.prediction.inputs.dist_hospital ||
    props.prediction.inputs.dist_colegio ||
    props.prediction.inputs.dist_supermercado ||
    props.prediction.inputs.dist_mall
  );
});

const formatPrice = (price: number) => {
  return predictionService.formatPrice(price);
};

const formatPricePerM2 = (price: number) => {
  return predictionService.formatPricePerM2(price);
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
