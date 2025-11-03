<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">
              🏠 Recomendaciones Inteligentes ML
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Encuentra tu propiedad ideal con inteligencia artificial
            </p>
          </div>
          <NuxtLink
            to="/"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            ← Volver al inicio
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="container mx-auto p-4 lg:p-6">
      <!-- Layout: 2 columnas en desktop, 1 en mobile -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Columna Izquierda: Chatbot -->
        <div class="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
          <div class="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
              <h2 class="text-xl font-bold flex items-center gap-2">
                <span>💬</span>
                <span>Asistente de Búsqueda</span>
              </h2>
              <p class="text-sm text-blue-100 mt-1">
                Configura tus preferencias detalladamente
              </p>
            </div>
            
            <ChatBotML
              @preferencias-completas="handlePreferenciasCompletas"
              class="flex-1"
            />
          </div>
        </div>

        <!-- Columna Derecha: Resultados -->
        <div class="space-y-6">
          <!-- Estado: Sin buscar -->
          <div
            v-if="!buscandoPropiedades && recomendaciones.length === 0"
            class="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <div class="text-6xl mb-4">🏠</div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">
              ¿Listo para encontrar tu hogar ideal?
            </h3>
            <p class="text-gray-600">
              Completa la configuración en el asistente de la izquierda
              y te mostraremos las mejores opciones personalizadas para ti.
            </p>
            <div class="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div class="p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl mb-2">✅</div>
                <div class="font-medium">Define lo que QUIERES</div>
                <div class="text-gray-600 text-xs mt-1">Valores positivos (+1 a +10)</div>
              </div>
              <div class="p-4 bg-red-50 rounded-lg">
                <div class="text-2xl mb-2">❌</div>
                <div class="font-medium">Define lo que EVITAS</div>
                <div class="text-gray-600 text-xs mt-1">Valores negativos (-1 a -10)</div>
              </div>
            </div>
          </div>

          <!-- Estado: Buscando -->
          <div
            v-if="buscandoPropiedades"
            class="bg-white rounded-xl shadow-lg p-12"
          >
            <div class="flex flex-col items-center justify-center">
              <div class="relative w-20 h-20 mb-6">
                <div class="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">
                🔍 Analizando propiedades...
              </h3>
              <p class="text-gray-600 text-center">
                Nuestro modelo de inteligencia artificial está evaluando
                todas las propiedades según tus preferencias.
              </p>
              <div class="mt-6 flex gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>

          <!-- Estado: Resultados -->
          <div v-if="!buscandoPropiedades && recomendaciones.length > 0">
            <!-- Header de resultados -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-bold text-gray-800">
                    ✨ {{ recomendaciones.length }} Propiedades Encontradas
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Ordenadas por mejor coincidencia con tus preferencias
                  </p>
                </div>
                <button
                  @click="nuevaBusqueda"
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🔄 Nueva Búsqueda
                </button>
              </div>

              <!-- Metadata del modelo -->
              <div
                v-if="metadataML"
                class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
              >
                <div class="flex items-start gap-2">
                  <span class="text-blue-600">ℹ️</span>
                  <div class="flex-1 text-xs text-gray-700">
                    <strong>Modelo:</strong> {{ metadataML.modelo_version }} •
                    <strong>Procesado:</strong> {{ metadataML.total_propiedades_evaluadas }} propiedades •
                    <strong>Tiempo:</strong> {{ metadataML.tiempo_procesamiento_ms }}ms
                  </div>
                </div>
              </div>
            </div>

            <!-- Lista de propiedades -->
            <TransitionGroup name="list" tag="div" class="space-y-6">
              <PropiedadCardML
                v-for="(propiedad, index) in recomendaciones"
                :key="propiedad.id"
                :propiedad="propiedad"
                @ver-mapa="verPropiedadEnMapa"
                @feedback="handleFeedback"
                :style="{ '--delay': `${index * 50}ms` }"
                class="animate-fade-in"
              />
            </TransitionGroup>

            <!-- Paginación -->
            <div v-if="todasLasRecomendaciones.length > propiedadesPorPagina" class="pt-6">
              <div class="bg-white rounded-lg border-2 border-gray-200 p-4">
                <div class="flex items-center justify-between">
                  <!-- Info de paginación -->
                  <div class="text-sm text-gray-600">
                    Mostrando {{ (paginaActual - 1) * propiedadesPorPagina + 1 }} - 
                    {{ Math.min(paginaActual * propiedadesPorPagina, todasLasRecomendaciones.length) }} 
                    de {{ todasLasRecomendaciones.length }} propiedades
                  </div>
                  
                  <!-- Controles de paginación -->
                  <div class="flex items-center gap-2">
                    <!-- Botón Anterior -->
                    <button
                      @click="cambiarPagina(paginaActual - 1)"
                      :disabled="paginaActual === 1"
                      :class="[
                        'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                        paginaActual === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      ]"
                    >
                      ← Anterior
                    </button>

                    <!-- Números de página -->
                    <div class="flex items-center gap-1">
                      <template v-for="pagina in obtenerPaginasVisibles()" :key="pagina">
                        <button
                          v-if="typeof pagina === 'number'"
                          @click="cambiarPagina(pagina)"
                          :class="[
                            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                            pagina === paginaActual
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          ]"
                        >
                          {{ pagina }}
                        </button>
                        <span v-else class="text-gray-500 px-2">...</span>
                      </template>
                    </div>

                    <!-- Botón Siguiente -->
                    <button
                      @click="cambiarPagina(paginaActual + 1)"
                      :disabled="paginaActual === totalPaginas"
                      :class="[
                        'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                        paginaActual === totalPaginas
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      ]"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mapa (si hay propiedades seleccionadas) -->
          <div
            v-if="propiedadSeleccionada"
            class="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold">🗺️ Ubicación</h3>
                <p class="text-sm text-purple-100">{{ propiedadSeleccionada.direccion }}</p>
              </div>
              <button
                @click="propiedadSeleccionada = null"
                class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
              >
                Cerrar
              </button>
            </div>
            
            <div class="h-96">
              <Map
                v-if="propiedadesParaMapa.length > 0"
                :propiedades="propiedadesParaMapa"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <Teleport to="body">
      <div
        v-if="showToast"
        class="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-slide-up"
      >
        {{ toastMessage }}
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type {
  PreferenciasDetalladasML,
  PropiedadRecomendadaML
} from '~/services/recommendationMLService'
import { obtenerRecomendacionesML } from '~/services/recommendationMLService'

const todasLasRecomendaciones = ref<PropiedadRecomendadaML[]>([])
const paginaActual = ref(1)
const propiedadesPorPagina = 25
const metadataML = ref<any>(null)
const buscandoPropiedades = ref(false)
const propiedadSeleccionada = ref<PropiedadRecomendadaML | null>(null)
const showToast = ref(false)
const toastMessage = ref('')

// Computed: propiedades paginadas
const recomendaciones = computed(() => {
  const inicio = (paginaActual.value - 1) * propiedadesPorPagina;
  const fin = inicio + propiedadesPorPagina;
  return todasLasRecomendaciones.value.slice(inicio, fin);
});

// Computed: total de páginas
const totalPaginas = computed(() => {
  return Math.ceil(todasLasRecomendaciones.value.length / propiedadesPorPagina);
});

const propiedadesParaMapa = computed(() => {
  if (!propiedadSeleccionada.value) return []
  return [propiedadSeleccionada.value]
})

const handlePreferenciasCompletas = async (preferencias: PreferenciasDetalladasML) => {
  buscandoPropiedades.value = true
  paginaActual.value = 1
  todasLasRecomendaciones.value = []
  
  try {
    // Solicitar TODAS las propiedades
    const response = await obtenerRecomendacionesML(preferencias, 9999)
    
    // Simular delay para mostrar loading
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    todasLasRecomendaciones.value = response.recomendaciones
    metadataML.value = {
      modelo_version: response.modelo_version,
      total_propiedades_evaluadas: response.total_analizadas,
      tiempo_procesamiento_ms: 150 // Placeholder
    }
    
    mostrarToast(`✅ ${response.recomendaciones.length} propiedades encontradas`)
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error)
    mostrarToast('❌ Error al buscar propiedades')
  } finally {
    buscandoPropiedades.value = false
  }
}

const cambiarPagina = (pagina: number) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const obtenerPaginasVisibles = (): (number | string)[] => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  const paginas: (number | string)[] = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      paginas.push(i);
    }
  } else {
    paginas.push(1);
    
    if (actual > 3) {
      paginas.push('...');
    }
    
    const inicio = Math.max(2, actual - 1);
    const fin = Math.min(total - 1, actual + 1);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    if (actual < total - 2) {
      paginas.push('...');
    }
    
    paginas.push(total);
  }
  
  return paginas;
};

const verPropiedadEnMapa = (propiedad: PropiedadRecomendadaML) => {
  propiedadSeleccionada.value = propiedad
  
  // Scroll suave al mapa
  nextTick(() => {
    const mapElement = document.querySelector('.h-96')
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

const handleFeedback = (data: { propiedad: PropiedadRecomendadaML; tipo: string }) => {
  const { propiedad, tipo } = data
  
  if (tipo === 'me_gusta') {
    mostrarToast(`👍 Guardado: ${propiedad.direccion}`)
  } else {
    mostrarToast(`👎 Descartado: ${propiedad.direccion}`)
  }
  
  // TODO: Enviar feedback al backend para mejorar el modelo
}

const nuevaBusqueda = () => {
  recomendaciones.value = []
  metadataML.value = null
  propiedadSeleccionada.value = null
}

const mostrarToast = (mensaje: string) => {
  toastMessage.value = mensaje
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-bounce {
  animation: bounce 0.6s infinite;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: var(--delay, 0ms);
  opacity: 0;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

/* Transitions para lista */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
