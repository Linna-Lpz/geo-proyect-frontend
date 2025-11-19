<template>
  <div class="min-h-screen">
    <div class="w-full p-4">
      <!-- Layout: 2 columnas en desktop, 1 en mobile -->
      <div class="grid grid-cols-2 gap-6 ml-6 mr-6">
        
        <!-- Columna Izquierda: Chatbot -->
        <div class="relative lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
          <div class="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
              <h2 class="text-xl font-bold flex items-center gap-2">
                <i class="pi pi-comments mr-2"></i>
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

        <!-- Columna Derecha: Resultados + Mapa -->
        <div class="relative lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] flex flex-col">
          <div v-if="!buscandoPropiedades && todasLasRecomendaciones.length > 0" class="space-y-6 flex-1 flex flex-col">
            <div class="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-gray-800 flex items-center">
                  <i class="pi pi-map-marker mr-2"></i>{{ todasLasRecomendaciones.length }} Propiedades en el Mapa
                </h3>
              </div>
              <button
                @click="nuevaBusqueda"
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <i class="pi pi-refresh mr-2"></i> Nueva Búsqueda
              </button>
            </div>

            <!-- Tarjeta de información de propiedad (fija, siempre presente) -->
            <div class="bg-white rounded-xl shadow-lg p-6 relative">
              <button
                v-if="propiedadSeleccionada"
                @click="propiedadSeleccionada = null"
                class="absolute top-4 right-4 mb-8 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>

              <div v-if="propiedadSeleccionada" class="space-y-4">
                <!-- Encabezado -->
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <div>
                      <p class="text-gray-900"><strong>Dirección:</strong> {{ propiedadSeleccionada.direccion }}</p>
                      <p class="text-gray-900 mt-1"><strong>Comuna:</strong> {{ propiedadSeleccionada.comuna }}</p>
                      <p class="mt-1"><strong>Precio estimado:</strong> {{ formatearPrecio(propiedadSeleccionada.precio) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Atributos -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <i class="pi pi-home text-gray-500"></i>
                    <div>
                      <div class="text-xs text-gray-500">Dormitorios</div>
                      <div class="font-semibold text-gray-800">{{ propiedadSeleccionada.dormitorios }}</div>
                    </div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <i class="pi pi-stop text-gray-500"></i>
                    <div>
                      <div class="text-xs text-gray-500">Baños</div>
                      <div class="font-semibold text-gray-800">{{ propiedadSeleccionada.banos }}</div>
                    </div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <i class="pi pi-arrows-h text-gray-500"></i>
                    <div>
                      <div class="text-xs text-gray-500">Superficie útil</div>
                      <div class="font-semibold text-gray-800">{{ propiedadSeleccionada.superficie_util }} m²</div>
                    </div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3 flex items-center gap-2" v-if="propiedadSeleccionada.score_total">
                    <i :class="[getScoreIcon(propiedadSeleccionada.score_total), getScoreColor(propiedadSeleccionada.score_total)]"></i>
                    <div>
                      <div class="text-xs text-gray-500">Compatibilidad</div>
                      <div :class="['font-semibold', getScoreColor(propiedadSeleccionada.score_total)]">{{ propiedadSeleccionada.score_total.toFixed(1) }}/100</div>
                    </div>
                  </div>
                </div>
                <!-- Detalles adicionales -->
                <div>
                  <button
                    class="text-sm hover:underline flex justify-end"
                    @click="verMasDetalles"
                  >
                    Ver más detalles
                  </button>
                </div>
              </div>

              <div v-else class="text-center text-gray-600">
                <i class="pi pi-info-circle text-4xl mb-3"></i>
                <p>Haz clic en un marcador del mapa para ver los detalles de la propiedad.</p>
              </div>
            </div>

            <!-- Mapa -->
            <div class="relative bg-white rounded-xl shadow-lg overflow-visible flex-1 min-h-[320px]">
              <div class="h-full">
                <Map
                  class="h-full w-full"
                  :propiedades="propiedadesMapa"
                  :selected-property="propiedadSeleccionadaParaMapa"
                  @property-selected="onPropertySelected"
                />
              </div>
            </div>
          </div>

          <div v-else-if="buscandoPropiedades" class="bg-white rounded-xl shadow-lg p-6 text-center flex-1 flex items-center justify-center">
            <p class="text-gray-600">Buscando propiedades...</p>
          </div>

          <div v-else class="bg-white rounded-xl shadow-lg p-6 text-center flex-1 flex items-center justify-center">
            <div>
              <h3 class="text-lg font-bold">Inicia una búsqueda</h3>
              <p class="text-gray-600">Utiliza el Chatbot ML para buscar propiedades.</p>
            </div>
          </div>
        </div>

        <!-- Columna derecha (mantener para alineación) -->
        <div></div>
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
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type {
  PreferenciasDetalladasML,
  PropiedadRecomendadaML
} from '~/services/recommendationMLService'
import { obtenerRecomendacionesML } from '~/services/recommendationMLService'
import Map from '~/components/Map.vue'
import { XMarkIcon } from '@heroicons/vue/16/solid'

definePageMeta({
  title: 'Recomendaciones ML - Búsqueda Avanzada'
});

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

// Todas las propiedades para el mapa (incluye score_total adaptado a "score")
const propiedadesMapa = computed(() => {
  return todasLasRecomendaciones.value.map(p => ({
    id: p.id,
    direccion: p.direccion,
    latitud: p.latitud,
    longitud: p.longitud,
    precio: p.precio,
    dormitorios: p.dormitorios,
    banos: p.banos,
    comuna: p.comuna,
    score: p.score_total // El componente Map espera 'score'
  }))
})

// Propiedad seleccionada adaptada para el mapa (incluye 'score')
const propiedadSeleccionadaParaMapa = computed(() => {
  const p = propiedadSeleccionada.value
  if (!p) return null
  return {
    id: p.id,
    direccion: p.direccion,
    latitud: p.latitud,
    longitud: p.longitud,
    precio: p.precio,
    dormitorios: p.dormitorios,
    banos: p.banos,
    comuna: p.comuna,
    score: p.score_total
  }
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
    
    mostrarToast(`${response.recomendaciones.length} propiedades encontradas`)
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error)
  } finally {
    buscandoPropiedades.value = false
  }
}

// Selección desde el mapa (emisión de Map.vue)
const onPropertySelected = (propiedad: any) => {
  // Cuando el usuario hace clic en un marcador desde el mapa
  const encontrada = todasLasRecomendaciones.value.find(p => p.id === propiedad.id)
  if (encontrada) {
    propiedadSeleccionada.value = encontrada
  }
}

const handleFeedback = (data: { propiedad: PropiedadRecomendadaML; tipo: string }) => {
  const { propiedad, tipo } = data
  
  if (tipo === 'me_gusta') {
    mostrarToast(`Guardado: ${propiedad.direccion}`)
  } else {
    mostrarToast(`Descartado: ${propiedad.direccion}`)
  }
  
  // TODO: Enviar feedback al backend para mejorar el modelo
}

const nuevaBusqueda = () => {
  todasLasRecomendaciones.value = []
  metadataML.value = null
  propiedadSeleccionada.value = null
  paginaActual.value = 1
}

const mostrarToast = (mensaje: string) => {
  toastMessage.value = mensaje
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Funciones de formato y estilo
const formatearPrecio = (precioCLP: number): string => {
  // Los precios ya vienen normalizados en CLP desde el backend
  const clpFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precioCLP);
  
  return clpFormateado;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-gray-600'
}

const getScoreIcon = (score: number): string => {
  if (score >= 80) return 'pi pi-star-fill'
  if (score >= 60) return 'pi pi-star'
  if (score >= 40) return 'pi pi-thumbs-up'
  return 'pi pi-lightbulb'
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
