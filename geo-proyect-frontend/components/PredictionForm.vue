<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Predecir Precio de Propiedad</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Características Básicas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Superficie (m²) *
          </label>
          <input
            v-model.number="formData.superficie"
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

      <!-- Comuna -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Comuna *
        </label>
        <select
          v-model="formData.comuna"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="" disabled>Seleccionar comuna</option>
          <option v-for="comuna in comunas" :key="comuna.nombre" :value="comuna.nombre">
            {{ comuna.nombre }}
          </option>
        </select>
      </div>

      <!-- Distancias (Opcionales) -->
      <div class="border-t pt-4">
        <button
          type="button"
          @click="showDistances = !showDistances"
          class="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-3"
        >
          <svg 
            class="w-5 h-5 mr-2 transition-transform" 
            :class="{ 'rotate-90': showDistances }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          Distancias (Opcional)
        </button>

        <div v-if="showDistances" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Metro/Transporte (km)
            </label>
            <input
              v-model.number="formData.dist_metro"
              type="number"
              min="0"
              max="20"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.5"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Áreas Verdes (km)
            </label>
            <input
              v-model.number="formData.dist_area_verde"
              type="number"
              min="0"
              max="20"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.8"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Hospital (km)
            </label>
            <input
              v-model.number="formData.dist_hospital"
              type="number"
              min="0"
              max="20"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1.2"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Colegio (km)
            </label>
            <input
              v-model.number="formData.dist_colegio"
              type="number"
              min="0"
              max="20"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.6"
            />
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="!loading"><i class="pi pi-search mr-2"></i>Predecir Precio</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Calculando...
          </span>
        </button>

        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { predictionService, type PrediccionRequest, type Comuna } from '~/services/predictionService';

const emit = defineEmits<{
  (e: 'prediction', value: any): void;
}>();

const loading = ref(false);
const showDistances = ref(false);
const comunas = ref<Comuna[]>([]);

const formData = ref<PrediccionRequest>({
  superficie: 85,
  dormitorios: 2,
  banos: 2,
  comuna: '',
  dist_metro: undefined,
  dist_supermercado: undefined,
  dist_area_verde: undefined,
  dist_colegio: undefined,
  dist_hospital: undefined,
  dist_mall: undefined,
});

onMounted(async () => {
  try {
    comunas.value = await predictionService.getComunas();
  } catch (error) {
    console.error('Error cargando comunas:', error);
  }
});

const handleSubmit = async () => {
  loading.value = true;
  
  try {
    const result = await predictionService.predecirPrecio(formData.value);
    emit('prediction', result);
  } catch (error: any) {
    console.error('Error en predicción:', error);
    alert(`Error: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    superficie: 85,
    dormitorios: 2,
    banos: 2,
    comuna: '',
    dist_metro: undefined,
    dist_supermercado: undefined,
    dist_area_verde: undefined,
    dist_colegio: undefined,
    dist_hospital: undefined,
    dist_mall: undefined,
  };
  showDistances.value = false;
};
</script>
