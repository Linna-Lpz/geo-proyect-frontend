<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header del Dashboard -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          <i class="pi pi-chart-bar mr-3 text-blue-600"></i>Dashboard Analítico
        </h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Análisis geoespacial del mercado inmobiliario en Santiago - 
          Visualización de datos y resultados del modelo de Machine Learning
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
          <p class="text-gray-600">Cargando datos del dashboard...</p>
        </div>
      </div>

      <div v-else>
        <!-- Métricas Principales -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div class="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow">
            <div class="text-3xl font-bold text-blue-600 mb-1">{{ dashboardData?.estadisticas.total_propiedades || 0 }}</div>
            <div class="text-sm text-gray-600">Propiedades</div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow">
            <div class="text-3xl font-bold text-green-600 mb-1">{{ dashboardData?.estadisticas.total_comunas || 0 }}</div>
            <div class="text-sm text-gray-600">Comunas</div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow">
            <div class="text-3xl font-bold text-purple-600 mb-1">{{ formatPercent(dashboardData?.modeloInfo.r2_precio || 0) }}</div>
            <div class="text-sm text-gray-600">R² Precio (Stacking)</div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow">
            <div class="text-3xl font-bold text-orange-600 mb-1">{{ formatPercent(dashboardData?.modeloInfo.r2_satisfaccion || 0) }}</div>
            <div class="text-sm text-gray-600">R² Satisfacción</div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow">
            <div class="text-3xl font-bold text-cyan-600 mb-1">{{ dashboardData?.modeloInfo.features_precio || 0 }}</div>
            <div class="text-sm text-gray-600">Features Precio</div>
          </div>
          <div class="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow">
            <div class="text-3xl font-bold text-pink-600 mb-1">{{ dashboardData?.modeloInfo.features_satisfaccion || 0 }}</div>
            <div class="text-sm text-gray-600">Features Satisf.</div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i class="pi pi-filter mr-2 text-blue-600"></i>Filtros
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Filtro Comuna -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
              <select 
                v-model="filtros.comuna" 
                @change="aplicarFiltros"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todas">Todas las comunas</option>
                <option v-for="comuna in comunasDisponibles" :key="comuna" :value="comuna">
                  {{ comuna }}
                </option>
              </select>
            </div>
            
            <!-- Filtro Tipo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de propiedad</label>
              <select 
                v-model="filtros.tipo" 
                @change="aplicarFiltros"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Todos">Todos los tipos</option>
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
              </select>
            </div>
            
            <!-- Filtro Precio Mínimo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio mínimo (UF)</label>
              <input 
                type="number" 
                v-model.number="filtros.precioMin"
                @change="aplicarFiltros"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <!-- Filtro Precio Máximo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio máximo (UF)</label>
              <input 
                type="number" 
                v-model.number="filtros.precioMax"
                @change="aplicarFiltros"
                placeholder="50000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div class="mt-4 flex items-center justify-between">
            <span class="text-sm text-gray-600">
              <i class="pi pi-info-circle mr-1"></i>
              {{ propiedadesFiltradas.length }} propiedades encontradas
            </span>
            <button 
              @click="limpiarFiltros"
              class="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i class="pi pi-refresh mr-1"></i>Limpiar filtros
            </button>
          </div>
        </div>

        <!-- Grid Principal: Mapa y Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Mapa Interactivo -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4">
              <h3 class="text-lg font-bold flex items-center">
                <i class="pi pi-map mr-2"></i>Mapa de Propiedades
              </h3>
              <p class="text-sm text-blue-100">Distribución geográfica del mercado inmobiliario</p>
            </div>
            <div class="h-[400px]">
              <Map 
                :propiedades="propiedadesParaMapa"
                :selected-property="propiedadSeleccionada"
                @property-selected="onPropertySelected"
              />
            </div>
          </div>

          <!-- Gráfico de Distribución de Precios -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4">
              <h3 class="text-lg font-bold flex items-center">
                <i class="pi pi-chart-bar mr-2"></i>Distribución de Precios
              </h3>
              <p class="text-sm text-green-100">Rangos de precios en UF</p>
            </div>
            <div class="p-4 h-[400px]">
              <canvas ref="chartPrecios"></canvas>
            </div>
          </div>
        </div>

        <!-- Segunda fila de gráficos -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <!-- Gráfico de Tipos de Propiedad -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-4">
              <h3 class="text-lg font-bold flex items-center">
                <i class="pi pi-chart-pie mr-2"></i>Tipos de Propiedad
              </h3>
            </div>
            <div class="p-4 h-[300px]">
              <canvas ref="chartTipos"></canvas>
            </div>
          </div>

          <!-- Gráfico por Comunas -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-4">
              <h3 class="text-lg font-bold flex items-center">
                <i class="pi pi-building mr-2"></i>Propiedades por Comuna
              </h3>
            </div>
            <div class="p-4 h-[300px]">
              <canvas ref="chartComunas"></canvas>
            </div>
          </div>

          <!-- Gráfico de Precios Promedio por Comuna -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-6 py-4">
              <h3 class="text-lg font-bold flex items-center">
                <i class="pi pi-dollar mr-2"></i>Precio Promedio (UF)
              </h3>
            </div>
            <div class="p-4 h-[300px]">
              <canvas ref="chartPreciosComunas"></canvas>
            </div>
          </div>
        </div>

        <!-- Tabla de Estadísticas por Comuna -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div class="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-6 py-4">
            <h3 class="text-lg font-bold flex items-center">
              <i class="pi pi-table mr-2"></i>Estadísticas por Comuna
            </h3>
            <p class="text-sm text-gray-300">Resumen detallado del mercado inmobiliario</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comuna</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Casas</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Deptos</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Prom.</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Mín.</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Máx.</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sup. Prom.</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Dorms Prom.</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(comuna, index) in dashboardData?.comunasStats || []" :key="comuna.nombre" 
                    :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                    class="hover:bg-blue-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <i class="pi pi-map-marker text-blue-500 mr-2"></i>
                      <span class="font-medium text-gray-900">{{ comuna.nombre }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">{{ comuna.total_casas }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{{ comuna.total_departamentos }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center font-semibold text-gray-900">
                    {{ comuna.total_casas + comuna.total_departamentos }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                    {{ formatUF(comuna.precio_promedio) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    {{ formatUF(comuna.precio_min) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    {{ formatUF(comuna.precio_max) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                    {{ comuna.superficie_promedio.toFixed(0) }} m²
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                    {{ comuna.dormitorios_promedio.toFixed(1) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sección de Hallazgos Principales -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div class="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-4">
            <h3 class="text-lg font-bold flex items-center">
              <i class="pi pi-lightbulb mr-2"></i>Principales Hallazgos
            </h3>
            <p class="text-sm text-indigo-100">Insights del análisis geoespacial</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Hallazgo 1 -->
              <div class="border-l-4 border-blue-500 pl-4">
                <h4 class="font-bold text-gray-800 mb-2">
                  <i class="pi pi-chart-bar text-blue-600 mr-2"></i>Distribución del Mercado
                </h4>
                <p class="text-gray-600 text-sm">
                  El mercado está compuesto por 
                  <span class="font-semibold text-blue-600">{{ porcentajeCasas }}% casas</span> y 
                  <span class="font-semibold text-green-600">{{ porcentajeDepartamentos }}% departamentos</span>.
                  {{ comunaMayorOferta }} concentra la mayor oferta con {{ propiedadesComunaMayor }} propiedades.
                </p>
              </div>
              
              <!-- Hallazgo 2 -->
              <div class="border-l-4 border-green-500 pl-4">
                <h4 class="font-bold text-gray-800 mb-2">
                  <i class="pi pi-dollar text-green-600 mr-2"></i>Análisis de Precios
                </h4>
                <p class="text-gray-600 text-sm">
                  El precio promedio es de <span class="font-semibold text-green-600">{{ formatUF(precioPromedioGeneral) }}</span>.
                  {{ comunaMasCara }} es la comuna más cara con un promedio de {{ formatUF(precioMayorComuna) }}.
                </p>
              </div>
              
              <!-- Hallazgo 3 -->
              <div class="border-l-4 border-purple-500 pl-4">
                <h4 class="font-bold text-gray-800 mb-2">
                  <i class="pi pi-cog text-purple-600 mr-2"></i>Modelos ML
                </h4>
                <p class="text-gray-600 text-sm">
                  El modelo de predicción de precios (Stacking) alcanza un 
                  <span class="font-semibold text-purple-600">R² de {{ formatPercent(dashboardData?.modeloInfo.r2_precio || 0) }}</span>.
                  El modelo de satisfacción (LightGBM) logra un 
                  <span class="font-semibold text-orange-600">R² de {{ formatPercent(dashboardData?.modeloInfo.r2_satisfaccion || 0) }}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de Propiedad Seleccionada -->
        <div v-if="propiedadSeleccionada" class="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 flex items-center justify-between">
            <h4 class="font-bold">Propiedad Seleccionada</h4>
            <button @click="propiedadSeleccionada = null" class="hover:bg-blue-700 rounded p-1">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="p-4">
            <p class="font-semibold text-gray-800 mb-2">{{ propiedadSeleccionada.titulo || propiedadSeleccionada.ubicacion }}</p>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div><span class="text-gray-500">Tipo:</span> <span class="font-medium">{{ propiedadSeleccionada.tipo }}</span></div>
              <div><span class="text-gray-500">Comuna:</span> <span class="font-medium">{{ propiedadSeleccionada.comuna }}</span></div>
              <div><span class="text-gray-500">Precio:</span> <span class="font-medium text-green-600">{{ formatUF(propiedadSeleccionada.precio_uf) }}</span></div>
              <div><span class="text-gray-500">Superficie:</span> <span class="font-medium">{{ propiedadSeleccionada.superficie }} m²</span></div>
              <div><span class="text-gray-500">Dormitorios:</span> <span class="font-medium">{{ propiedadSeleccionada.dormitorios }}</span></div>
              <div><span class="text-gray-500">Baños:</span> <span class="font-medium">{{ propiedadSeleccionada.banos }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { dashboardService, formatUF, type DashboardData, type PropiedadParsed } from '../services/dashboardService'
import Map from '../components/Map.vue'
import Chart from 'chart.js/auto'

definePageMeta({
  title: 'Dashboard - TerraMatch'
})

// Estado
const loading = ref(true)
const dashboardData = ref<DashboardData | null>(null)
const propiedadSeleccionada = ref<PropiedadParsed | null>(null)

// Filtros - Por defecto mostrar solo Ñuñoa para cargar más rápido
const filtros = ref({
  comuna: 'Ñuñoa',
  tipo: 'Todos',
  precioMin: 0,
  precioMax: 0
})

// Referencias a los canvas de Chart.js
const chartPrecios = ref<HTMLCanvasElement | null>(null)
const chartTipos = ref<HTMLCanvasElement | null>(null)
const chartComunas = ref<HTMLCanvasElement | null>(null)
const chartPreciosComunas = ref<HTMLCanvasElement | null>(null)

// Instancias de Chart.js
let chartPreciosInstance: Chart | null = null
let chartTiposInstance: Chart | null = null
let chartComunasInstance: Chart | null = null
let chartPreciosComunasInstance: Chart | null = null

// Computed
const comunasDisponibles = computed(() => {
  return dashboardData.value?.comunasStats.map(c => c.nombre) || []
})

const propiedadesFiltradas = computed(() => {
  if (!dashboardData.value) return []
  return dashboardService.filtrarPropiedades(dashboardData.value.propiedades, filtros.value)
})

const propiedadesParaMapa = computed(() => {
  return propiedadesFiltradas.value.map(p => ({
    id: p.id,
    direccion: p.ubicacion || p.titulo,
    latitud: p.latitud,
    longitud: p.longitud,
    precio: p.precio_clp,
    dormitorios: p.dormitorios,
    banos: p.banos,
    comuna: p.comuna,
    score: 50 // Score neutral
  }))
})

// Métricas calculadas
const porcentajeCasas = computed(() => {
  if (!dashboardData.value) return 0
  const total = dashboardData.value.propiedades.length
  const casas = dashboardData.value.propiedades.filter(p => p.tipo === 'Casa').length
  return total > 0 ? ((casas / total) * 100).toFixed(1) : 0
})

const porcentajeDepartamentos = computed(() => {
  if (!dashboardData.value) return 0
  const total = dashboardData.value.propiedades.length
  const deptos = dashboardData.value.propiedades.filter(p => p.tipo === 'Departamento').length
  return total > 0 ? ((deptos / total) * 100).toFixed(1) : 0
})

const comunaMayorOferta = computed(() => {
  if (!dashboardData.value || dashboardData.value.comunasStats.length === 0) return 'N/A'
  return dashboardData.value.comunasStats[0].nombre
})

const propiedadesComunaMayor = computed(() => {
  if (!dashboardData.value || dashboardData.value.comunasStats.length === 0) return 0
  const comuna = dashboardData.value.comunasStats[0]
  return comuna.total_casas + comuna.total_departamentos
})

const precioPromedioGeneral = computed(() => {
  if (!dashboardData.value) return 0
  const precios = dashboardData.value.propiedades.map(p => p.precio_uf).filter(p => p > 0)
  return precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0
})

const comunaMasCara = computed(() => {
  if (!dashboardData.value || dashboardData.value.comunasStats.length === 0) return 'N/A'
  const ordenadas = [...dashboardData.value.comunasStats].sort((a, b) => b.precio_promedio - a.precio_promedio)
  return ordenadas[0].nombre
})

const precioMayorComuna = computed(() => {
  if (!dashboardData.value || dashboardData.value.comunasStats.length === 0) return 0
  const ordenadas = [...dashboardData.value.comunasStats].sort((a, b) => b.precio_promedio - a.precio_promedio)
  return ordenadas[0].precio_promedio
})

// Funciones
const formatPercent = (value: number): string => {
  return (value * 100).toFixed(1) + '%'
}

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente via computed
}

const limpiarFiltros = () => {
  filtros.value = {
    comuna: 'Ñuñoa',
    tipo: 'Todos',
    precioMin: 0,
    precioMax: 0
  }
}

const onPropertySelected = (propiedad: any) => {
  const encontrada = dashboardData.value?.propiedades.find(p => p.id === propiedad.id)
  if (encontrada) {
    propiedadSeleccionada.value = encontrada
  }
}

// Crear gráficos con Chart.js
const crearGraficos = () => {
  if (!dashboardData.value) return

  // Destruir gráficos existentes
  if (chartPreciosInstance) chartPreciosInstance.destroy()
  if (chartTiposInstance) chartTiposInstance.destroy()
  if (chartComunasInstance) chartComunasInstance.destroy()
  if (chartPreciosComunasInstance) chartPreciosComunasInstance.destroy()

  // Gráfico de Distribución de Precios (Barras)
  if (chartPrecios.value) {
    const ctx = chartPrecios.value.getContext('2d')
    if (ctx) {
      chartPreciosInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dashboardData.value.distribucionPrecios.rangos,
          datasets: [{
            label: 'Cantidad de propiedades',
            data: dashboardData.value.distribucionPrecios.cantidades,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(14, 165, 233, 0.8)',
              'rgba(168, 85, 247, 0.8)'
            ],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      })
    }
  }

  // Gráfico de Tipos de Propiedad (Donut)
  if (chartTipos.value) {
    const ctx = chartTipos.value.getContext('2d')
    if (ctx) {
      chartTiposInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: dashboardData.value.distribucionTipos.tipos,
          datasets: [{
            data: dashboardData.value.distribucionTipos.cantidades,
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(59, 130, 246, 0.8)'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
  }

  // Gráfico de Propiedades por Comuna (Barras horizontales)
  if (chartComunas.value) {
    const ctx = chartComunas.value.getContext('2d')
    if (ctx) {
      const comunasData = dashboardData.value.comunasStats.map(c => ({
        nombre: c.nombre,
        total: c.total_casas + c.total_departamentos
      }))

      chartComunasInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: comunasData.map(c => c.nombre),
          datasets: [{
            label: 'Total propiedades',
            data: comunasData.map(c => c.total),
            backgroundColor: 'rgba(249, 115, 22, 0.8)',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false }
          }
        }
      })
    }
  }

  // Gráfico de Precios Promedio por Comuna
  if (chartPreciosComunas.value) {
    const ctx = chartPreciosComunas.value.getContext('2d')
    if (ctx) {
      chartPreciosComunasInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dashboardData.value.comunasStats.map(c => c.nombre),
          datasets: [{
            label: 'Precio promedio (UF)',
            data: dashboardData.value.comunasStats.map(c => Math.round(c.precio_promedio)),
            backgroundColor: 'rgba(6, 182, 212, 0.8)',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false }
          }
        }
      })
    }
  }
}

// Lifecycle
onMounted(async () => {
  try {
    dashboardData.value = await dashboardService.getDashboardData()
    loading.value = false
    
    await nextTick()
    crearGraficos()
  } catch (error) {
    console.error('Error cargando dashboard:', error)
    loading.value = false
  }
})

// Watch para recrear gráficos cuando cambian los datos
watch(() => dashboardData.value, () => {
  nextTick(() => {
    crearGraficos()
  })
}, { deep: true })
</script>

<style scoped>
/* Estilos adicionales para el dashboard */
</style>
