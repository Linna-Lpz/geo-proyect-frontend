<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
    <div class="container mx-auto p-4 lg:p-6">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            🏠 Predicción de Satisfacción Residencial
          </h1>
          <p class="text-gray-600">
            Predice qué tan satisfecho estarás con una propiedad usando nuestro modelo de IA
          </p>
          <div class="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <span class="mr-2">🤖</span>
            Modelo LightGBM | R² = 0.87 | 42 características
          </div>
        </div>

        <!-- Formulario de entrada -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span class="mr-2">📝</span> Datos de la Propiedad
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Superficie -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Superficie útil (m²)
              </label>
              <input
                v-model.number="form.superficie_util"
                type="number"
                min="1"
                max="1000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: 85"
              />
            </div>

            <!-- Dormitorios -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Dormitorios
              </label>
              <input
                v-model.number="form.dormitorios"
                type="number"
                min="1"
                max="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: 3"
              />
            </div>

            <!-- Baños -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Baños
              </label>
              <input
                v-model.number="form.banos"
                type="number"
                min="1"
                max="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: 2"
              />
            </div>

            <!-- Precio UF -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Precio (UF)
              </label>
              <input
                v-model.number="form.precio_uf"
                type="number"
                min="1"
                max="100000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: 5000"
              />
            </div>

            <!-- Comuna -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Comuna
              </label>
              <select
                v-model="form.comuna"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Santiago">Santiago</option>
                <option value="Ñuñoa">Ñuñoa</option>
                <option value="La Reina">La Reina</option>
                <option value="Estación Central">Estación Central</option>
              </select>
            </div>

            <!-- Tipo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Propiedad
              </label>
              <select
                v-model="form.tipo_propiedad"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
              </select>
            </div>
          </div>

          <!-- Distancias opcionales -->
          <details class="mt-4">
            <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              ⚙️ Opciones avanzadas (distancias)
            </summary>
            <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  Dist. Transporte (m)
                </label>
                <input
                  v-model.number="form.dist_transporte_min_m"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="Ej: 500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  Dist. Áreas Verdes (m)
                </label>
                <input
                  v-model.number="form.dist_areas_verdes_m"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="Ej: 300"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  Dist. Comercio (m)
                </label>
                <input
                  v-model.number="form.dist_comercio_m"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="Ej: 400"
                />
              </div>
            </div>
          </details>

          <!-- Botón de predicción -->
          <div class="mt-6">
            <button
              @click="predecir"
              :disabled="!formValido || cargando"
              class="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <span v-if="cargando" class="animate-spin mr-2">⏳</span>
              <span v-else class="mr-2">🔮</span>
              {{ cargando ? 'Analizando...' : 'Predecir Satisfacción' }}
            </button>
          </div>
        </div>

        <!-- Resultado -->
        <Transition name="fade">
          <div v-if="resultado" class="bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Header del resultado -->
            <div 
              :class="[
                'p-6 text-center',
                resultado.satisfaccion >= 8 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                resultado.satisfaccion >= 6 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                resultado.satisfaccion >= 4 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                'bg-gradient-to-r from-red-500 to-rose-600'
              ]"
            >
              <div class="text-6xl mb-2">{{ resultado.emoji }}</div>
              <div class="text-5xl font-bold text-white mb-2">
                {{ resultado.satisfaccion.toFixed(1) }}
              </div>
              <div class="text-white/80 text-lg">
                de 10 puntos
              </div>
              <div class="mt-2 inline-block px-4 py-1 bg-white/20 rounded-full text-white font-medium">
                {{ resultado.nivel }}
              </div>
            </div>

            <!-- Detalles -->
            <div class="p-6">
              <p class="text-gray-600 text-center mb-6">
                {{ resultado.descripcion }}
              </p>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-2xl font-bold text-gray-800">
                    {{ resultado.detalles.precio_m2_uf.toFixed(1) }}
                  </div>
                  <div class="text-xs text-gray-500">UF/m²</div>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-2xl font-bold text-gray-800">
                    {{ resultado.detalles.m2_por_dormitorio.toFixed(1) }}
                  </div>
                  <div class="text-xs text-gray-500">m²/dormitorio</div>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-2xl font-bold text-gray-800">
                    {{ resultado.detalles.total_habitaciones }}
                  </div>
                  <div class="text-xs text-gray-500">Habitaciones</div>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-2xl font-bold text-gray-800">
                    {{ (resultado.confianza * 100).toFixed(0) }}%
                  </div>
                  <div class="text-xs text-gray-500">Confianza</div>
                </div>
              </div>

              <!-- Info del modelo -->
              <div class="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <span class="font-medium">ℹ️ Modelo:</span> 
                LightGBM con {{ resultado.features_usadas }} características | 
                R² = {{ (resultado.confianza * 100).toFixed(1) }}%
              </div>
            </div>
          </div>
        </Transition>

        <!-- Error -->
        <Transition name="fade">
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div class="flex items-center text-red-800">
              <span class="text-xl mr-2">❌</span>
              <span>{{ error }}</span>
            </div>
          </div>
        </Transition>

        <!-- Guía de interpretación -->
        <div class="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            📊 Guía de Interpretación
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div class="text-3xl mb-1">🌟</div>
              <div class="font-medium text-green-800">Excelente</div>
              <div class="text-sm text-green-600">8 - 10</div>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div class="text-3xl mb-1">✅</div>
              <div class="font-medium text-blue-800">Bueno</div>
              <div class="text-sm text-blue-600">6 - 8</div>
            </div>
            <div class="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div class="text-3xl mb-1">⚠️</div>
              <div class="font-medium text-amber-800">Regular</div>
              <div class="text-sm text-amber-600">4 - 6</div>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div class="text-3xl mb-1">❌</div>
              <div class="font-medium text-red-800">Bajo</div>
              <div class="text-sm text-red-600">0 - 4</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  satisfaccionService, 
  type SatisfaccionRequest, 
  type SatisfaccionResponse 
} from '~/services/satisfaccionService'

// Estado del formulario
const form = ref<SatisfaccionRequest>({
  superficie_util: 85,
  dormitorios: 3,
  banos: 2,
  precio_uf: 5000,
  comuna: 'Santiago',
  tipo_propiedad: 'departamento',
  dist_transporte_min_m: undefined,
  dist_areas_verdes_m: undefined,
  dist_comercio_m: undefined,
})

// Estado de UI
const cargando = ref(false)
const resultado = ref<SatisfaccionResponse | null>(null)
const error = ref<string | null>(null)

// Validación del formulario
const formValido = computed(() => {
  return (
    form.value.superficie_util > 0 &&
    form.value.dormitorios >= 1 &&
    form.value.banos >= 1 &&
    form.value.precio_uf > 0
  )
})

// Función de predicción
async function predecir() {
  if (!formValido.value) return
  
  cargando.value = true
  error.value = null
  resultado.value = null
  
  try {
    // Limpiar campos opcionales vacíos
    const request: SatisfaccionRequest = {
      superficie_util: form.value.superficie_util,
      dormitorios: form.value.dormitorios,
      banos: form.value.banos,
      precio_uf: form.value.precio_uf,
      comuna: form.value.comuna,
      tipo_propiedad: form.value.tipo_propiedad,
    }
    
    if (form.value.dist_transporte_min_m) {
      request.dist_transporte_min_m = form.value.dist_transporte_min_m
    }
    if (form.value.dist_areas_verdes_m) {
      request.dist_areas_verdes_m = form.value.dist_areas_verdes_m
    }
    if (form.value.dist_comercio_m) {
      request.dist_comercio_m = form.value.dist_comercio_m
    }
    
    resultado.value = await satisfaccionService.predecirSatisfaccion(request)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error desconocido'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
