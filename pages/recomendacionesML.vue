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
                      <!-- Badge de tipo de propiedad -->
                      <span :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2',
                        propiedadSeleccionada.tipo_propiedad?.toLowerCase().includes('departamento') || propiedadSeleccionada.tipo_propiedad?.toLowerCase().includes('depto')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      ]">
                        <i :class="[
                          'mr-1',
                          propiedadSeleccionada.tipo_propiedad?.toLowerCase().includes('departamento') || propiedadSeleccionada.tipo_propiedad?.toLowerCase().includes('depto')
                            ? 'pi pi-building'
                            : 'pi pi-home'
                        ]"></i>
                        {{ propiedadSeleccionada.tipo_propiedad || 'Propiedad' }}
                      </span>
                      <p class="text-gray-900"><strong>Dirección:</strong> {{ propiedadSeleccionada.direccion }}</p>
                      <p class="text-gray-900 mt-1"><strong>Comuna:</strong> {{ propiedadSeleccionada.comuna }}</p>
                      <p class="mt-1"><strong>Precio estimado:</strong> {{ formatearPrecio(propiedadSeleccionada.precio) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Atributos -->
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                  <!-- Satisfacción ML (LightGBM) -->
                  <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 flex items-center gap-2" v-if="propiedadSeleccionada.satisfaccion_score">
                    <i :class="getSatisfaccionIcon(propiedadSeleccionada.satisfaccion_score)"></i>
                    <div>
                      <div class="text-xs text-purple-600 font-medium">Satisfacción ML</div>
                      <div :class="['font-bold', getSatisfaccionColor(propiedadSeleccionada.satisfaccion_score)]">
                        {{ propiedadSeleccionada.satisfaccion_score.toFixed(1) }}/10
                      </div>
                      <div class="text-xs text-gray-500">{{ propiedadSeleccionada.satisfaccion_nivel }}</div>
                    </div>
                  </div>
                </div>
                <!-- Detalles adicionales -->
                <div>
                  <button
                    class="text-sm text-blue-600 hover:underline flex justify-end"
                    @click="mostrarModalDetalles = true"
                  >
                    <i class="pi pi-info-circle mr-1"></i> Ver más detalles
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
              <p class="text-gray-600 mb-4">Utiliza el Chatbot ML para buscar propiedades o haz una búsqueda rápida.</p>
              <button
                @click="busquedaRapida"
                class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                <i class="pi pi-search mr-2"></i> Búsqueda Rápida (Ver todas)
              </button>
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
    
    <!-- Modal de detalles de propiedad -->
    <Teleport to="body">
      <div
        v-if="mostrarModalDetalles && propiedadSeleccionada"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="mostrarModalDetalles = false"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <i :class="propiedadSeleccionada.tipo_propiedad?.toLowerCase().includes('departamento') ? 'pi pi-building' : 'pi pi-home'"></i>
              Detalles de la Propiedad
            </h3>
            <button @click="mostrarModalDetalles = false" class="text-white/80 hover:text-white">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Info básica -->
            <div class="border-b pb-4">
              <h4 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <i class="pi pi-map-marker text-gray-500"></i> Ubicación
              </h4>
              <p class="text-gray-800 font-medium">{{ propiedadSeleccionada.direccion }}</p>
              <p class="text-gray-500 text-sm">{{ propiedadSeleccionada.comuna }}</p>
            </div>
            
            <!-- Precio -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <i class="pi pi-dollar text-gray-500"></i> Precio de Venta
              </h4>
              <p class="text-2xl font-bold text-gray-800">{{ formatearPrecio(propiedadSeleccionada.precio) }}</p>
            </div>
            
            <!-- Características principales -->
            <div>
              <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i class="pi pi-list text-gray-500"></i> Características Principales
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="border border-gray-200 rounded-lg p-3 text-center">
                  <i class="pi pi-home text-gray-500 text-lg mb-1"></i>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Dormitorios</p>
                  <p class="font-bold text-gray-800 text-lg">{{ propiedadSeleccionada.dormitorios }}</p>
                </div>
                <div class="border border-gray-200 rounded-lg p-3 text-center">
                  <i class="pi pi-stop text-gray-500 text-lg mb-1"></i>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Baños</p>
                  <p class="font-bold text-gray-800 text-lg">{{ propiedadSeleccionada.banos }}</p>
                </div>
                <div class="border border-gray-200 rounded-lg p-3 text-center">
                  <i class="pi pi-arrows-h text-gray-500 text-lg mb-1"></i>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Superficie</p>
                  <p class="font-bold text-gray-800 text-lg">{{ propiedadSeleccionada.superficie_util }} m²</p>
                </div>
                <div class="border border-gray-200 rounded-lg p-3 text-center">
                  <i class="pi pi-car text-gray-500 text-lg mb-1"></i>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Estacionamientos</p>
                  <p class="font-bold text-gray-800 text-lg">{{ propiedadSeleccionada.estacionamientos || 0 }}</p>
                </div>
              </div>
            </div>
            
            <!-- Características del edificio/departamento -->
            <div v-if="propiedadSeleccionada.gastos_comunes || propiedadSeleccionada.orientacion || propiedadSeleccionada.numero_piso || propiedadSeleccionada.bodegas">
              <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i class="pi pi-building text-gray-500"></i> Características del Edificio
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div v-if="propiedadSeleccionada.gastos_comunes" class="border border-gray-200 rounded-lg p-3 text-center">
                  <i class="pi pi-wallet text-gray-500 text-lg mb-1"></i>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Gastos Comunes</p>
                  <p class="font-bold text-gray-800">${{ propiedadSeleccionada.gastos_comunes.toLocaleString('es-CL') }}</p>
                </div>
                <div v-if="propiedadSeleccionada.orientacion" class="border border-gray-200 rounded-lg p-3 text-center">
                  <i class="pi pi-compass text-gray-500 text-lg mb-1"></i>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Orientación</p>
                  <p class="font-bold text-gray-800">{{ propiedadSeleccionada.orientacion }}</p>
                </div>
                <div v-if="propiedadSeleccionada.numero_piso" class="border border-gray-200 rounded-lg p-3 text-center">
                  <i class="pi pi-building text-gray-500 text-lg mb-1"></i>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Piso</p>
                  <p class="font-bold text-gray-800">{{ propiedadSeleccionada.numero_piso }} <span v-if="propiedadSeleccionada.cantidad_pisos" class="text-sm text-gray-500 font-normal">de {{ propiedadSeleccionada.cantidad_pisos }}</span></p>
                </div>
                <div v-if="propiedadSeleccionada.bodegas" class="border border-gray-200 rounded-lg p-3 text-center">
                  <i class="pi pi-box text-gray-500 text-lg mb-1"></i>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Bodegas</p>
                  <p class="font-bold text-gray-800 text-lg">{{ propiedadSeleccionada.bodegas }}</p>
                </div>
              </div>
            </div>
            
            <!-- Scores -->
            <div v-if="propiedadSeleccionada.score_total" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i class="pi pi-chart-bar text-gray-500"></i> Puntuación
              </h4>
              <div class="flex items-center gap-6">
                <div class="text-center">
                  <p class="text-3xl font-bold" :class="getScoreColor(propiedadSeleccionada.score_total)">
                    {{ propiedadSeleccionada.score_total.toFixed(1) }}
                  </p>
                  <p class="text-sm text-gray-500">Compatibilidad</p>
                </div>
                <div v-if="propiedadSeleccionada.satisfaccion_score" class="text-center border-l border-gray-300 pl-6">
                  <p class="text-3xl font-bold" :class="getSatisfaccionColor(propiedadSeleccionada.satisfaccion_score)">
                    {{ propiedadSeleccionada.satisfaccion_score.toFixed(1) }}
                  </p>
                  <p class="text-sm text-gray-500">Satisfacción ML</p>
                </div>
              </div>
            </div>
            
            <!-- Puntos fuertes y débiles -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="propiedadSeleccionada.puntos_fuertes?.length" class="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h4 class="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <i class="pi pi-check-circle text-green-600"></i> Puntos Fuertes
                </h4>
                <ul class="space-y-2">
                  <li v-for="(punto, idx) in propiedadSeleccionada.puntos_fuertes" :key="idx" class="text-sm text-gray-700 flex items-start gap-2">
                    <span class="text-green-500 mt-0.5">•</span>
                    <span>{{ punto }}</span>
                  </li>
                </ul>
              </div>
              <div v-if="propiedadSeleccionada.puntos_debiles?.length" class="border border-amber-200 rounded-lg p-4 bg-amber-50/50">
                <h4 class="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <i class="pi pi-exclamation-triangle text-amber-600"></i> Puntos a Considerar
                </h4>
                <ul class="space-y-2">
                  <li v-for="(punto, idx) in propiedadSeleccionada.puntos_debiles" :key="idx" class="text-sm text-gray-700 flex items-start gap-2">
                    <span class="text-amber-500 mt-0.5">•</span>
                    <span>{{ punto }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-100 rounded-b-xl flex justify-end gap-3 border-t">
            <button
              @click="mostrarModalDetalles = false"
              class="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
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
} from '../services/recommendationMLService'
import { obtenerRecomendacionesML } from '../services/recommendationMLService'
import Map from '../components/Map.vue'
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
const mostrarModalDetalles = ref(false)

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

// Búsqueda rápida sin preferencias específicas
const busquedaRapida = async () => {
  buscandoPropiedades.value = true
  paginaActual.value = 1
  todasLasRecomendaciones.value = []
  
  try {
    // Búsqueda con preferencias por defecto para obtener propiedades
    const preferenciasDefault: PreferenciasDetalladasML = {
      peso_precio: 0.2,
      peso_ubicacion: 0.12,
      peso_tamano: 0.08,
      peso_transporte: 0.15,
      peso_educacion: 0.1,
      peso_salud: 0.1,
      peso_servicios: 0.08,
      peso_areas_verdes: 0.05,
      peso_edificio: 0.12
    }
    // Limitar a 500 para evitar problemas de rendimiento
    const response = await obtenerRecomendacionesML(preferenciasDefault, 500)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    todasLasRecomendaciones.value = response.recomendaciones
    metadataML.value = {
      modelo_version: response.modelo_version,
      total_propiedades_evaluadas: response.total_analizadas,
      tiempo_procesamiento_ms: 150
    }
    
    mostrarToast(`${response.recomendaciones.length} propiedades encontradas (de ${response.total_analizadas} analizadas)`)
  } catch (error) {
    console.error('Error en búsqueda rápida:', error)
    mostrarToast('Error al buscar propiedades')
  } finally {
    buscandoPropiedades.value = false
  }
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
const VALOR_UF_CLP = 37500;

const formatearPrecio = (precioCLP: number): string => {
  // Convertir CLP a UF
  const precioUF = precioCLP / VALOR_UF_CLP;
  
  // Formatear UF
  const ufFormateado = precioUF.toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  // Formatear CLP
  const clpFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precioCLP);
  
  return `${ufFormateado} UF (${clpFormateado})`;
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

// Funciones para Satisfacción ML (LightGBM)
const getSatisfaccionColor = (score: number): string => {
  if (score >= 8) return 'text-green-600'
  if (score >= 6) return 'text-blue-600'
  if (score >= 4) return 'text-orange-500'
  return 'text-red-500'
}

const getSatisfaccionIcon = (score: number): string => {
  if (score >= 8) return 'pi pi-star-fill text-yellow-500 text-xl'
  if (score >= 6) return 'pi pi-check-circle text-green-500 text-xl'
  if (score >= 4) return 'pi pi-exclamation-circle text-orange-500 text-xl'
  return 'pi pi-times-circle text-red-500 text-xl'
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
