<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />
    
    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        <!-- Chat Section (Left/Top) -->
        <div class="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <h1 class="text-xl font-bold"><i class="pi pi-home mr-2"></i>Asistente Inmobiliario</h1>
            <p class="text-sm opacity-90">Encuentra tu propiedad ideal</p>
          </div>
          
          <ChatBot
            @preferencias-completas="handlePreferenciasCompletas"
            class="flex-1"
          />
        </div>

        <!-- Results Section (Right/Bottom) -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <!-- Recommendations List -->
          <div
            v-if="!mostrandoMapa"
            class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full"
          >
            <div class="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-800">
                  <span v-if="todasLasRecomendaciones.length > 0"><i class="pi pi-check mr-2"></i> Propiedades Recomendadas</span>
                  <span v-else><i class="pi pi-list mr-2"></i> Resultados</span>
                </h2>
                <p v-if="totalAnalizadas > 0" class="text-sm text-gray-600">
                  {{ todasLasRecomendaciones.length }} propiedades encontradas ({{ totalAnalizadas }} analizadas)
                </p>
              </div>
              <button
                v-if="todasLasRecomendaciones.length > 0"
                @click="toggleVista"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <i class="pi pi-map mr-2"></i>Ver en Mapa
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="flex-1 flex items-center justify-center p-8">
              <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p class="mt-4 text-gray-600">Buscando las mejores propiedades...</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="todasLasRecomendaciones.length === 0" class="flex-1 flex items-center justify-center p-8">
              <div class="text-center text-gray-500">
                <div class="text-6xl mb-4"><i class="pi pi-home text-6xl"></i></div>
                <p class="text-lg font-medium">Completa el chat para ver recomendaciones</p>
                <p class="text-sm mt-2">El asistente te ayudará a encontrar tu propiedad ideal</p>
              </div>
            </div>

            <!-- Results List -->
            <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
              <div
                v-for="(propiedad, index) in recomendaciones"
                :key="propiedad.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                @click="seleccionarPropiedad(propiedad)"
              >
                <!-- Score Badge -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <i :class="['text-2xl', iconClass(getEmojiScore(propiedad.score_total))]"></i>
                    <div>
                      <span :class="['text-2xl font-bold', getColorScore(propiedad.score_total)]">
                        {{ propiedad.score_total.toFixed(1) }}
                      </span>
                      <span class="text-gray-500 text-sm">/100</span>
                    </div>
                  </div>
                  <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    #{{ (paginaActual - 1) * propiedadesPorPagina + index + 1 }}
                  </span>
                </div>

                <!-- Property Info -->
                <h3 class="font-semibold text-lg text-gray-800 mb-1">
                  {{ propiedad.direccion }}
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  <i class="pi pi-map-marker mr-1"></i> {{ propiedad.comuna }}
                </p>

                <!-- Price & Details -->
                <div class="flex items-center gap-4 mb-3 text-sm">
                  <span class="font-bold text-green-600 text-lg">
                    {{ formatearPrecio(propiedad.precio) }}
                  </span>
                  <span class="text-gray-600">
                    <i class="pi pi-arrows-h mr-1"></i> {{ propiedad.superficie_util?.toFixed(0) || 'N/A' }}m²
                  </span>
                  <span class="text-gray-600">
                    <i class="pi pi-user mr-1"></i> {{ propiedad.dormitorios }}D / {{ propiedad.banos }}B
                  </span>
                  <span v-if="propiedad.estacionamientos" class="text-gray-600">
                    <i class="pi pi-car mr-1"></i> {{ propiedad.estacionamientos }}
                  </span>
                </div>

                <!-- Explicaciones -->
                <div class="space-y-1 mb-3">
                  <p
                    v-for="(razon, rIndex) in propiedad.explicacion"
                    :key="rIndex"
                    class="text-sm text-gray-700"
                  >
                    {{ razon }}
                  </p>
                </div>

                <!-- Distancias -->
                <div class="flex flex-wrap gap-3 text-xs text-gray-600">
                  <span v-if="propiedad.dist_metro_m">
                    <i class="pi pi-train mr-1"></i> Metro: {{ formatearDistancia(propiedad.dist_metro_m) }}
                  </span>
                  <span v-if="propiedad.dist_educacion_min_m">
                    <i class="pi pi-book mr-1"></i> Educación: {{ formatearDistancia(propiedad.dist_educacion_min_m) }}
                  </span>
                  <span v-if="propiedad.dist_salud_min_m">
                    <i class="pi pi-hospital mr-1"></i> Salud: {{ formatearDistancia(propiedad.dist_salud_min_m) }}
                  </span>
                  <span v-if="propiedad.dist_areas_verdes_m">
                    <i class="pi pi-tree mr-1"></i> Parques: {{ formatearDistancia(propiedad.dist_areas_verdes_m) }}
                  </span>
                </div>

                <!-- Scores Detallados (Expandible) -->
                <details class="mt-3">
                  <summary class="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver puntuación detallada
                  </summary>
                  <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div class="flex justify-between p-2 bg-gray-50 rounded">
                      <span><i class="pi pi-money-bill mr-1"></i> Precio:</span>
                      <span class="font-semibold">{{ propiedad.scores_detallados.precio.toFixed(1) }}/20</span>
                    </div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded">
                      <span><i class="pi pi-map-marker mr-1"></i> Ubicación:</span>
                      <span class="font-semibold">{{ propiedad.scores_detallados.ubicacion.toFixed(1) }}/20</span>
                    </div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded">
                      <span><i class="pi pi-arrows-h mr-1"></i> Tamaño:</span>
                      <span class="font-semibold">{{ propiedad.scores_detallados.tamano.toFixed(1) }}/15</span>
                    </div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded">
                      <span><i class="pi pi-train mr-1"></i> Transporte:</span>
                      <span class="font-semibold">{{ propiedad.scores_detallados.transporte.toFixed(1) }}/15</span>
                    </div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded">
                      <span><i class="pi pi-book mr-1"></i> Educación:</span>
                      <span class="font-semibold">{{ propiedad.scores_detallados.educacion.toFixed(1) }}/10</span>
                    </div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded">
                      <span><i class="pi pi-hospital mr-1"></i> Salud:</span>
                      <span class="font-semibold">{{ propiedad.scores_detallados.salud.toFixed(1) }}/10</span>
                    </div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded col-span-2">
                      <span><i class="pi pi-tree mr-1"></i> Áreas Verdes:</span>
                      <span class="font-semibold">{{ propiedad.scores_detallados.areas_verdes.toFixed(1) }}/10</span>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            <!-- Paginación -->
            <div v-if="todasLasRecomendaciones.length > 0" class="bg-gray-50 border-t border-gray-200 p-4">
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
                        : 'bg-blue-500 text-white hover:bg-blue-600'
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
                            ? 'bg-blue-600 text-white'
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
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    ]"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Map View -->
          <div
            v-else
            class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full"
          >
            <div class="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">
                <i class="pi pi-map-marker mr-2"></i>Mapa de Propiedades
              </h2>
              <button
                @click="toggleVista"
                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <i class="pi pi-list mr-2"></i> Ver Lista
              </button>
            </div>
            
            <div class="flex-1 relative">
              <Map
                :propiedades="propiedadesParaMapa"
                :selectedProperty="propiedadSeleccionada"
                @property-selected="handlePropertySelected"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  recommendationService,
  type PreferenciasUsuario,
  type PropiedadRecomendada,
} from '~/services/recommendationService';

const todasLasRecomendaciones = ref<PropiedadRecomendada[]>([]);
const paginaActual = ref(1);
const propiedadesPorPagina = 25;
const isLoading = ref(false);
const totalAnalizadas = ref(0);
const mostrandoMapa = ref(false);
const propiedadSeleccionada = ref<PropiedadRecomendada | null>(null);

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

const handlePreferenciasCompletas = async (preferencias: PreferenciasUsuario) => {
  isLoading.value = true;
  todasLasRecomendaciones.value = [];
  paginaActual.value = 1;
  totalAnalizadas.value = 0;

  try {
    // Solicitar TODAS las propiedades (límite alto)
    const response = await recommendationService.obtenerRecomendaciones(preferencias, 9999);
    
    todasLasRecomendaciones.value = response.recomendaciones;
    totalAnalizadas.value = response.total_analizadas;
    
    if (todasLasRecomendaciones.value.length === 0) {
      console.log('No se encontraron propiedades con esos criterios');
    }
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error);
    alert('Error al obtener recomendaciones. Por favor, intenta nuevamente.');
  } finally {
    isLoading.value = false;
  }
};

const cambiarPagina = (pagina: number) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina;
    // Scroll al inicio de la lista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const obtenerPaginasVisibles = (): (number | string)[] => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  const paginas: (number | string)[] = [];
  
  if (total <= 7) {
    // Mostrar todas las páginas si hay 7 o menos
    for (let i = 1; i <= total; i++) {
      paginas.push(i);
    }
  } else {
    // Siempre mostrar primera página
    paginas.push(1);
    
    if (actual > 3) {
      paginas.push('...');
    }
    
    // Páginas alrededor de la actual
    const inicio = Math.max(2, actual - 1);
    const fin = Math.min(total - 1, actual + 1);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    if (actual < total - 2) {
      paginas.push('...');
    }
    
    // Siempre mostrar última página
    paginas.push(total);
  }
  
  return paginas;
};

const toggleVista = () => {
  mostrandoMapa.value = !mostrandoMapa.value;
};

const seleccionarPropiedad = (propiedad: PropiedadRecomendada) => {
  propiedadSeleccionada.value = propiedad;
  mostrandoMapa.value = true;
};

const handlePropertySelected = (property: any) => {
  // Manejar selección desde el mapa
  const prop = todasLasRecomendaciones.value.find(p => p.id === property.id);
  if (prop) {
    propiedadSeleccionada.value = prop;
  }
};

// Convertir recomendaciones a formato compatible con Map (todas las propiedades)
const propiedadesParaMapa = computed(() => {
  return todasLasRecomendaciones.value.map(rec => ({
    id: rec.id,
    direccion: rec.direccion,
    latitud: rec.latitud,
    longitud: rec.longitud,
    precio: rec.precio,
    dormitorios: rec.dormitorios,
    banos: rec.banos,
    superficie_total: rec.superficie_util || 0,
    comuna: rec.comuna,
    score: rec.score_total,
  }));
});

// Helpers
const formatearPrecio = (precio: number) => {
  return recommendationService.formatearPrecio(precio);
};

const formatearDistancia = (metros: number | null) => {
  return recommendationService.formatearDistancia(metros);
};

const getColorScore = (score: number) => {
  return recommendationService.getColorScore(score);
};

const getEmojiScore = (score: number) => {
  return recommendationService.getEmojiScore(score);
};

// Map token -> PrimeIcons class
const iconClass = (token: string) => {
  switch (token) {
    case 'trophy':
      return 'pi pi-star';
    case 'star':
      return 'pi pi-star';
    case 'thumbs':
      return 'pi pi-thumbs-up';
    case 'idea':
      return 'pi pi-lightbulb';
    default:
      return 'pi pi-question';
  }
};
</script>

<style scoped>
/* Animación para el loader */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
