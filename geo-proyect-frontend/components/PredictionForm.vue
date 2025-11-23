<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Predecir Precio de Propiedad</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Superficie (m²) *
          </label>
          <input
            v-model.number="formData.superficie_util"
            type="number"
            min="20"
            max="500"
            step="1"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="85"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Dormitorios *
          </label>
          <select
            v-model.number="formData.dormitorios"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" disabled>Seleccionar</option>
            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Baños *
          </label>
          <select
            v-model.number="formData.banos"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" disabled>Seleccionar</option>
            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <!-- Mapa interactivo para seleccionar ubicación -->
      <MapLocationPicker 
        v-model="coordinates"
        @update:modelValue="updateCoordinates"
      />

      <!-- Inputs manuales opcionales (colapsables) -->
      <details class="group">
        <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2">
          <i class="pi pi-pencil text-xs"></i>
          O ingresar coordenadas manualmente
          <i class="pi pi-chevron-down text-xs transition-transform group-open:rotate-180"></i>
        </summary>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label for="manual-latitud" class="block text-sm font-medium text-gray-700 mb-2">
              Latitud
            </label>
            <input
              id="manual-latitud"
              v-model.number="coordinates.latitud"
              type="text"
              inputmode="decimal"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="-33.4489"
            />
          </div>

          <div>
            <label for="manual-longitud" class="block text-sm font-medium text-gray-700 mb-2">
              Longitud
            </label>
            <input
              id="manual-longitud"
              v-model.number="coordinates.longitud"
              type="text"
              inputmode="decimal"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="-70.6693"
            />
          </div>
        </div>
      </details>

      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
        >
          <span v-if="!loading"><i class="pi pi-chart-line mr-2"></i>Predecir Precio</span>
          <span v-else><i class="pi pi-spin pi-spinner mr-2"></i>Procesando...</span>
        </button>
      </div>

      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
      >
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { predictionService, type PrediccionRequest } from '~/services/predictionService';

const emit = defineEmits<{
  (e: 'prediction', data: any): void;
}>();

const formData = ref({
  superficie_util: 85,
  dormitorios: 3,
  banos: 2,
  estacionamientos: 0,
  bodegas: 0,
  usar_stacking: true
});

const coordinates = ref({
  latitud: -33.4489,
  longitud: -70.6693
});

const loading = ref(false);
const error = ref('');

const updateCoordinates = (newCoords: { latitud: number; longitud: number }) => {
  coordinates.value = newCoords;
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';

    // Validar coordenadas
    if (!coordinates.value.latitud || !coordinates.value.longitud) {
      error.value = 'Por favor, selecciona una ubicación en el mapa o ingresa las coordenadas manualmente';
      return;
    }

    // Combinar formData con coordinates
    const requestData: PrediccionRequest = {
      ...formData.value,
      latitud: coordinates.value.latitud,
      longitud: coordinates.value.longitud
    };

    const response = await predictionService.predecirPrecio(requestData);
    
    // Agregar timestamp si no viene de la API
    const predictionData = {
      ...response,
      timestamp: response.timestamp || new Date().toISOString(),
      inputs: requestData
    };
    
    emit('prediction', predictionData);

  } catch (err: any) {
    error.value = err.message || 'Error al procesar la predicción';
    console.error('Error en predicción:', err);
  } finally {
    loading.value = false;
  }
};
</script>
