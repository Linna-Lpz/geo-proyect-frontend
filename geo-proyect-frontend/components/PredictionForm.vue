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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Latitud *
          </label>
          <input
            v-model.number="formData.latitud"
            type="number"
            step="0.0001"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="-33.4489"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Longitud *
          </label>
          <input
            v-model.number="formData.longitud"
            type="number"
            step="0.0001"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="-70.6693"
          />
        </div>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Predecir Precio</span>
          <span v-else>Procesando...</span>
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
import { ref } from 'vue';
import { predictionService, type PrediccionRequest } from '~/services/predictionService';

const emit = defineEmits<{
  (e: 'prediction-success', data: any): void;
}>();

const formData = ref({
  superficie_util: 85,
  dormitorios: 3,
  banos: 2,
  estacionamientos: 0,
  bodegas: 0,
  latitud: -33.4489,
  longitud: -70.6693,
  usar_stacking: true
});

const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';

    const response = await predictionService.predecirPrecio(formData.value as PrediccionRequest);
    emit('prediction-success', response);

  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Error al procesar la predicción';
  } finally {
    loading.value = false;
  }
};
</script>
