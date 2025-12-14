<template>
  <div class="relative w-full h-full">
    <div id="map" class="w-full h-full"></div>
    
    <!-- Botón Pantalla Completa -->
    <button
      @click="toggleFullscreen"
      class="absolute bottom-4 left-4 z-[1000] px-3 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-all border-2 border-gray-300 flex items-center gap-2"
      title="Ver en pantalla completa"
    >
      <i class="pi pi-window-maximize text-gray-700"></i>
      <span class="text-sm font-medium text-gray-700 hidden sm:inline">Pantalla completa</span>
    </button>

  <!-- Toggle POI Button -->
    <button
      v-if="selectedPropertyInfo"
      @click="handlePOIButton"
      :disabled="loadingPOI"
      :class="[
        'absolute top-4 right-4 z-[1000] px-4 py-2 rounded-lg shadow-lg font-semibold transition-all flex items-center gap-2',
        loadingPOI ? 'opacity-70 cursor-wait' : '',
        puntosDeInteres ? (showPOI ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300') : 'bg-green-600 text-white hover:bg-green-700'
      ]"
    >
      <span v-if="loadingPOI" class="flex items-center gap-2">
        <i class="pi pi-spin pi-spinner" /> Buscando...
      </span>
      <span v-else-if="!puntosDeInteres"><i class="pi pi-search mr-1"></i>Buscar Servicios</span>
      <span v-else-if="showPOI"><i class="pi pi-eye mr-1"></i>Ocultar Servicios</span>
      <span v-else><i class="pi pi-map mr-1"></i>Mostrar Servicios</span>
    </button>

    <!-- Panel de Control de Servicios (mejorado y unificado) -->
    <div
      v-if="selectedPropertyInfo && puntosDeInteres"
      class="absolute top-16 right-4 bg-white rounded-xl shadow-2xl z-[1000] w-80 overflow-hidden"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-base flex items-center gap-2">
            <i class="pi pi-map-marker"></i>
            Servicios Cercanos
          </h3>
          <button 
            @click="showPOI = !showPOI; showPOI ? mostrarPuntosDeInteres() : limpiarPuntosDeInteres(); showPOI ? mostrarCirculoRadio() : limpiarCirculoRadio();"
            class="hover:bg-blue-700 rounded p-1 transition-colors"
          >
            <i :class="showPOI ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>
      </div>

      <!-- Radio de Búsqueda -->
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <i class="pi pi-arrows-h text-blue-600"></i>
          Radio: <span class="text-blue-600">{{ searchRadius }}m</span>
        </label>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-500">500m</span>
          <input
            type="range"
            v-model="searchRadius"
            @input="onRadiusChange"
            min="500"
            max="3000"
            step="100"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
          />
          <span class="text-xs text-gray-500">3km</span>
        </div>
      </div>

      <!-- Filtros de Servicios -->
      <div v-if="showPOI" class="px-4 py-3 max-h-96 overflow-y-auto styled-scrollbar">
        <div class="space-y-2">
          <!-- Colegios -->
          <label 
            v-if="puntosDeInteres.colegios?.length" 
            class="flex items-center gap-3 cursor-pointer hover:bg-purple-50 p-2 rounded-lg transition-colors border border-transparent hover:border-purple-200"
            :class="{ 'bg-purple-50 border-purple-200': filtrosServicios.colegios }"
          >
            <input type="checkbox" v-model="filtrosServicios.colegios" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-purple-500" />
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
              <i class="pi pi-book text-purple-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-800 text-sm">Colegios</div>
              <div class="text-xs text-gray-500">{{ puntosDeInteres.colegios.length }} establecimiento(s)</div>
            </div>
          </label>

          <!-- Supermercados -->
          <label 
            v-if="puntosDeInteres.supermercados?.length" 
            class="flex items-center gap-3 cursor-pointer hover:bg-amber-50 p-2 rounded-lg transition-colors border border-transparent hover:border-amber-200"
            :class="{ 'bg-amber-50 border-amber-200': filtrosServicios.supermercados }"
          >
            <input type="checkbox" v-model="filtrosServicios.supermercados" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-amber-500" />
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
              <i class="pi pi-shopping-cart text-amber-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-800 text-sm">Supermercados</div>
              <div class="text-xs text-gray-500">{{ puntosDeInteres.supermercados.length }} tienda(s)</div>
            </div>
          </label>

          <!-- Farmacias -->
          <label 
            v-if="puntosDeInteres.farmacias?.length" 
            class="flex items-center gap-3 cursor-pointer hover:bg-cyan-50 p-2 rounded-lg transition-colors border border-transparent hover:border-cyan-200"
            :class="{ 'bg-cyan-50 border-cyan-200': filtrosServicios.farmacias }"
          >
            <input type="checkbox" v-model="filtrosServicios.farmacias" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-cyan-500" />
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100">
              <i class="pi pi-plus-circle text-cyan-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-800 text-sm">Farmacias</div>
              <div class="text-xs text-gray-500">{{ puntosDeInteres.farmacias.length }} farmacia(s)</div>
            </div>
          </label>

          <!-- Centros Médicos -->
          <label 
            v-if="puntosDeInteres.centros_medicos?.length" 
            class="flex items-center gap-3 cursor-pointer hover:bg-green-50 p-2 rounded-lg transition-colors border border-transparent hover:border-green-200"
            :class="{ 'bg-green-50 border-green-200': filtrosServicios.centros_medicos }"
          >
            <input type="checkbox" v-model="filtrosServicios.centros_medicos" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-green-500" />
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <i class="pi pi-heart text-green-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-800 text-sm">Centros Médicos</div>
              <div class="text-xs text-gray-500">{{ puntosDeInteres.centros_medicos.length }} centro(s)</div>
            </div>
          </label>

          <!-- Comisarías -->
          <label 
            v-if="puntosDeInteres.comisarias?.length" 
            class="flex items-center gap-3 cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors border border-transparent hover:border-blue-200"
            :class="{ 'bg-blue-50 border-blue-200': filtrosServicios.comisarias }"
          >
            <input type="checkbox" v-model="filtrosServicios.comisarias" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-blue-500" />
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <i class="pi pi-shield text-blue-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-800 text-sm">Comisarías</div>
              <div class="text-xs text-gray-500">{{ puntosDeInteres.comisarias.length }} comisaría(s)</div>
            </div>
          </label>

          <!-- Bomberos -->
          <label 
            v-if="puntosDeInteres.bomberos?.length" 
            class="flex items-center gap-3 cursor-pointer hover:bg-rose-50 p-2 rounded-lg transition-colors border border-transparent hover:border-rose-200"
            :class="{ 'bg-rose-50 border-rose-200': filtrosServicios.bomberos }"
          >
            <input type="checkbox" v-model="filtrosServicios.bomberos" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-rose-500" />
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100">
              <i class="pi pi-bolt text-rose-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-800 text-sm">Bomberos</div>
              <div class="text-xs text-gray-500">{{ puntosDeInteres.bomberos.length }} cuartel(es)</div>
            </div>
          </label>

          <!-- Universidades -->
          <label 
            v-if="puntosDeInteres.universidades?.length" 
            class="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 p-2 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
            :class="{ 'bg-indigo-50 border-indigo-200': filtrosServicios.universidades }"
          >
            <input type="checkbox" v-model="filtrosServicios.universidades" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-indigo-500" />
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
              <i class="pi pi-graduation-cap text-indigo-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-800 text-sm">Universidades</div>
              <div class="text-xs text-gray-500">{{ puntosDeInteres.universidades.length }} institución(es)</div>
            </div>
          </label>

          <!-- Bancos -->
          <label 
            v-if="puntosDeInteres.bancos?.length" 
            class="flex items-center gap-3 cursor-pointer hover:bg-emerald-50 p-2 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
            :class="{ 'bg-emerald-50 border-emerald-200': filtrosServicios.bancos }"
          >
            <input type="checkbox" v-model="filtrosServicios.bancos" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-emerald-500" />
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100">
              <i class="pi pi-wallet text-emerald-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-800 text-sm">Bancos</div>
              <div class="text-xs text-gray-500">{{ puntosDeInteres.bancos.length }} sucursal(es)</div>
            </div>
          </label>

          <!-- Restaurantes -->
          <label 
            v-if="puntosDeInteres.restaurantes?.length" 
            class="flex items-center gap-3 cursor-pointer hover:bg-orange-50 p-2 rounded-lg transition-colors border border-transparent hover:border-orange-200"
            :class="{ 'bg-orange-50 border-orange-200': filtrosServicios.restaurantes }"
          >
            <input type="checkbox" v-model="filtrosServicios.restaurantes" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-orange-500" />
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
              <i class="pi pi-star text-orange-600 text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-800 text-sm">Restaurantes</div>
              <div class="text-xs text-gray-500">{{ puntosDeInteres.restaurantes.length }} local(es)</div>
            </div>
          </label>
          
          <!-- Separador para Servicios GeoJSON -->
          <div v-if="categoriasGeoJSON.length > 0" class="border-t border-purple-200 mt-3 pt-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 rounded-full bg-purple-600"></div>
              <span class="text-xs font-bold text-purple-700 uppercase tracking-wider">Datos Originales</span>
            </div>
            
            <!-- Categorías GeoJSON dinámicas -->
            <label 
              v-for="categoria in categoriasGeoJSON" 
              :key="categoria"
              class="flex items-center gap-3 cursor-pointer hover:bg-purple-50 p-2 rounded-lg transition-colors border border-transparent hover:border-purple-200"
              :class="{ 'bg-purple-50 border-purple-200': filtrosServiciosGeoJSON[categoria] }"
            >
              <input type="checkbox" v-model="filtrosServiciosGeoJSON[categoria]" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-purple-600" />
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-300">
                <i :class="`pi pi-${iconosCategoriasGeoJSON[categoria] || 'map-marker'} text-purple-600 text-lg`"></i>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-gray-800 text-sm">{{ nombresCategoriasGeoJSON[categoria] || categoria }}</div>
                <div class="text-xs text-purple-500">{{ serviciosGeoJSON?.categorias[categoria]?.length || 0 }} punto(s)</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer con Total -->
      <div class="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 flex items-center gap-2">
            <i class="pi pi-check-circle text-green-600"></i>
            Total encontrados
          </span>
          <span class="font-bold text-blue-600">{{ (puntosDeInteres.total_encontrados || 0) + (serviciosGeoJSON?.total_encontrados || 0) }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Pantalla Completa -->
    <Teleport to="body">
      <div
        v-if="isFullscreen"
        class="fixed inset-0 bg-black bg-opacity-95 z-[10000] flex flex-col"
      >
        <!-- Header del Modal -->
        <div class="bg-white shadow-lg px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <i class="pi pi-map text-blue-600 text-2xl"></i>
            <div>
              <h2 class="text-xl font-bold text-gray-800">Mapa en Pantalla Completa</h2>
              <p v-if="selectedPropertyInfo" class="text-sm text-gray-600">{{ selectedPropertyInfo.direccion }}</p>
            </div>
          </div>
          <button
            @click="toggleFullscreen"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium flex items-center gap-2"
          >
            <i class="pi pi-times"></i>
            Cerrar
          </button>
        </div>

        <!-- Mapa en Fullscreen -->
        <div class="flex-1 relative bg-gray-200">
          <div id="map-fullscreen" class="w-full h-full"></div>
          
          <!-- Botón para volver a mostrar todas las propiedades -->
          <button
            v-if="selectedPropertyInfo"
            @click="mostrarTodasPropiedades"
            class="absolute bottom-4 left-4 z-[1000] px-4 py-2 bg-gray-700 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-all font-medium flex items-center gap-2"
          >
            <i class="pi pi-eye"></i>
            Ver todas las propiedades
          </button>

          <!-- Toggle POI Button (en fullscreen) -->
          <button
            v-if="selectedPropertyInfo"
            @click="handlePOIButton"
            :disabled="loadingPOI"
            :class="[
              'absolute top-4 right-4 z-[1000] px-4 py-2 rounded-lg shadow-lg font-semibold transition-all flex items-center gap-2',
              loadingPOI ? 'opacity-70 cursor-wait' : '',
              puntosDeInteres ? (showPOI ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300') : 'bg-green-600 text-white hover:bg-green-700'
            ]"
          >
            <span v-if="loadingPOI" class="flex items-center gap-2">
              <i class="pi pi-spin pi-spinner" /> Buscando...
            </span>
            <span v-else-if="!puntosDeInteres"><i class="pi pi-search mr-1"></i>Buscar Servicios</span>
            <span v-else-if="showPOI"><i class="pi pi-eye mr-1"></i>Ocultar Servicios</span>
            <span v-else><i class="pi pi-map mr-1"></i>Mostrar Servicios</span>
          </button>

          <!-- Panel de Control de Servicios en Fullscreen -->
          <div
            v-if="selectedPropertyInfo && puntosDeInteres"
            class="absolute top-16 right-4 bg-white rounded-xl shadow-2xl z-[1000] w-80 overflow-hidden"
          >
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-base flex items-center gap-2">
                  <i class="pi pi-map-marker"></i>
                  Servicios Cercanos
                </h3>
                <button 
                  @click="showPOI = !showPOI; showPOI ? mostrarPuntosDeInteres() : limpiarPuntosDeInteres(); showPOI ? mostrarCirculoRadio() : limpiarCirculoRadio();"
                  class="hover:bg-blue-700 rounded p-1 transition-colors"
                >
                  <i :class="showPOI ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Radio de Búsqueda -->
            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <i class="pi pi-arrows-h text-blue-600"></i>
                Radio: <span class="text-blue-600">{{ searchRadius }}m</span>
              </label>
              <div class="flex items-center gap-3">
                <span class="text-xs text-gray-500">500m</span>
                <input
                  type="range"
                  v-model="searchRadius"
                  @input="onRadiusChange"
                  min="500"
                  max="3000"
                  step="100"
                  class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
                />
                <span class="text-xs text-gray-500">3km</span>
              </div>
            </div>

            <!-- Filtros de Servicios -->
            <div v-if="showPOI" class="px-4 py-3 max-h-96 overflow-y-auto styled-scrollbar">
              <div class="space-y-2">
                <!-- Colegios -->
                <label 
                  v-if="puntosDeInteres.colegios?.length" 
                  class="flex items-center gap-3 cursor-pointer hover:bg-purple-50 p-2 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                  :class="{ 'bg-purple-50 border-purple-200': filtrosServicios.colegios }"
                >
                  <input type="checkbox" v-model="filtrosServicios.colegios" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-purple-500" />
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                    <i class="pi pi-book text-purple-600 text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-800 text-sm">Colegios</div>
                    <div class="text-xs text-gray-500">{{ puntosDeInteres.colegios.length }} establecimiento(s)</div>
                  </div>
                </label>

                <!-- Supermercados -->
                <label 
                  v-if="puntosDeInteres.supermercados?.length" 
                  class="flex items-center gap-3 cursor-pointer hover:bg-amber-50 p-2 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                  :class="{ 'bg-amber-50 border-amber-200': filtrosServicios.supermercados }"
                >
                  <input type="checkbox" v-model="filtrosServicios.supermercados" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-amber-500" />
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                    <i class="pi pi-shopping-cart text-amber-600 text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-800 text-sm">Supermercados</div>
                    <div class="text-xs text-gray-500">{{ puntosDeInteres.supermercados.length }} tienda(s)</div>
                  </div>
                </label>

                <!-- Farmacias -->
                <label 
                  v-if="puntosDeInteres.farmacias?.length" 
                  class="flex items-center gap-3 cursor-pointer hover:bg-cyan-50 p-2 rounded-lg transition-colors border border-transparent hover:border-cyan-200"
                  :class="{ 'bg-cyan-50 border-cyan-200': filtrosServicios.farmacias }"
                >
                  <input type="checkbox" v-model="filtrosServicios.farmacias" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-cyan-500" />
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100">
                    <i class="pi pi-plus-circle text-cyan-600 text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-800 text-sm">Farmacias</div>
                    <div class="text-xs text-gray-500">{{ puntosDeInteres.farmacias.length }} farmacia(s)</div>
                  </div>
                </label>

                <!-- Comisarías -->
                <label 
                  v-if="puntosDeInteres.comisarias?.length" 
                  class="flex items-center gap-3 cursor-pointer hover:bg-sky-50 p-2 rounded-lg transition-colors border border-transparent hover:border-sky-200"
                  :class="{ 'bg-sky-50 border-sky-200': filtrosServicios.comisarias }"
                >
                  <input type="checkbox" v-model="filtrosServicios.comisarias" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-sky-500" />
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100">
                    <i class="pi pi-shield text-sky-600 text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-800 text-sm">Comisarías</div>
                    <div class="text-xs text-gray-500">{{ puntosDeInteres.comisarias.length }} comisaría(s)</div>
                  </div>
                </label>
                
                <!-- Separador para Servicios GeoJSON (Fullscreen) -->
                <div v-if="categoriasGeoJSON.length > 0" class="border-t border-purple-200 mt-3 pt-3">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-3 h-3 rounded-full bg-purple-600"></div>
                    <span class="text-xs font-bold text-purple-700 uppercase tracking-wider">Datos Originales</span>
                  </div>
                  
                  <!-- Categorías GeoJSON dinámicas -->
                  <label 
                    v-for="categoria in categoriasGeoJSON" 
                    :key="categoria"
                    class="flex items-center gap-3 cursor-pointer hover:bg-purple-50 p-2 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                    :class="{ 'bg-purple-50 border-purple-200': filtrosServiciosGeoJSON[categoria] }"
                  >
                    <input type="checkbox" v-model="filtrosServiciosGeoJSON[categoria]" @change="actualizarMarcadores" class="w-4 h-4 cursor-pointer accent-purple-600" />
                    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-300">
                      <i :class="`pi pi-${iconosCategoriasGeoJSON[categoria] || 'map-marker'} text-purple-600 text-lg`"></i>
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-gray-800 text-sm">{{ nombresCategoriasGeoJSON[categoria] || categoria }}</div>
                      <div class="text-xs text-purple-500">{{ serviciosGeoJSON?.categorias[categoria]?.length || 0 }} punto(s)</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Resumen -->
              <div class="mt-3 pt-3 border-t border-gray-200">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 flex items-center gap-2">
                    <i class="pi pi-check-circle text-green-600"></i>
                    Total encontrados
                  </span>
                  <span class="font-bold text-gray-800">{{ (puntosDeInteres.total_encontrados || 0) + (serviciosGeoJSON?.total_encontrados || 0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { obtenerPuntosDeInteresCercanos, obtenerServiciosGeoJSON, type PointOfInterest, type PointsOfInterestResponse, type ServiciosGeoJSONResponse } from '~/services/pointsOfInterestService';
import { recommendationService } from '~/services/recommendationService';

interface Property {
  id: number;
  direccion: string;
  latitud: number;
  longitud: number;
  precio: number;
  dormitorios: number;
  banos: number;
  superficie_total?: number;
  comuna?: string;
  score?: number;
}

const props = defineProps<{
  propiedades?: Property[];
  selectedProperty?: Property | null;
}>();

const emit = defineEmits<{
  (e: 'property-selected', property: Property): void;
}>();

let map: L.Map | null = null;
let mapFullscreen: L.Map | null = null;
let markers: L.Marker[] = [];
let fullscreenMarkers: L.Marker[] = []; // Marcadores del mapa fullscreen
let poiMarkers: L.Marker[] = []; // Marcadores de puntos de interés
let searchRadiusCircle: L.Circle | null = null; // Círculo del radio de búsqueda
const selectedPropertyInfo = ref<Property | null>(null);
const showPOI = ref<boolean>(true); // Control para mostrar/ocultar POIs
const puntosDeInteres = ref<PointsOfInterestResponse | null>(null);
const loadingPOI = ref<boolean>(false);
const searchRadius = ref<number>(1500); // Radio de búsqueda en metros (por defecto 1.5km)
const isFullscreen = ref<boolean>(false);
const filtrosServicios = ref({
  metros: true,
  colegios: true,
  universidades: true,
  centros_medicos: true,
  supermercados: true,
  parques: true,
  farmacias: true,
  comisarias: true,
  bomberos: true,
  bancos: true,
  restaurantes: true,
  correos: true,
  gasolineras: true,
  cajeros: true,
  otros_servicios: true,
  otros_comercios: true
});

// Servicios GeoJSON (datos originales) - con marcadores morados
const serviciosGeoJSON = ref<ServiciosGeoJSONResponse | null>(null);
let geoJsonMarkers: L.Marker[] = []; // Marcadores separados para servicios GeoJSON

// Filtros para servicios GeoJSON
const filtrosServiciosGeoJSON = ref<Record<string, boolean>>({});

// Categorías disponibles de servicios GeoJSON
const categoriasGeoJSON = ref<string[]>([]);

// Mapa de nombres amigables para categorías GeoJSON
const nombresCategoriasGeoJSON: Record<string, string> = {
  'establecimientos_educacionales': 'Colegios (GeoJSON)',
  'centros_de_salud': 'Centros de Salud',
  'hospitales': 'Hospitales',
  'farmacias': 'Farmacias (GeoJSON)',
  'supermercados': 'Supermercados (GeoJSON)',
  'restaurantes': 'Restaurantes',
  'parques': 'Parques (GeoJSON)',
  'deporte': 'Deportes',
  'bancos': 'Bancos',
  'cajeros': 'Cajeros',
  'correos': 'Correos',
  'policia': 'Policía (GeoJSON)',
  'bomberos': 'Bomberos (GeoJSON)',
  'transporte_publico': 'Transporte Público'
};

// Iconos para categorías GeoJSON
const iconosCategoriasGeoJSON: Record<string, string> = {
  'establecimientos_educacionales': 'graduation-cap',
  'centros_de_salud': 'heart',
  'hospitales': 'building',
  'farmacias': 'plus',
  'supermercados': 'shopping-bag',
  'restaurantes': 'star',
  'parques': 'sun',
  'deporte': 'flag',
  'bancos': 'wallet',
  'cajeros': 'credit-card',
  'correos': 'envelope',
  'policia': 'shield',
  'bomberos': 'bolt',
  'transporte_publico': 'car'
};

onMounted(() => {
  initMap();
  // Asegurar que el mapa calcule correctamente su tamaño cuando el contenedor esté visible
  nextTick(() => setTimeout(() => { if (map) map.invalidateSize(); }, 150));
});

watch(
  () => props.propiedades,
  (newPropiedades) => {
    if (newPropiedades && newPropiedades.length > 0) {
      updateMarkers(newPropiedades);
    }
  },
  { deep: true }
);

watch(
  () => props.selectedProperty,
  (newSelected) => {
    if (newSelected && map) {
      map.setView([newSelected.latitud, newSelected.longitud], 15);
      selectedPropertyInfo.value = newSelected;
      // Resetear POIs al cambiar de propiedad hasta que el usuario vuelva a buscarlos
      limpiarPuntosDeInteres();
      puntosDeInteres.value = null;
      showPOI.value = true;
    }
  }
);

const initMap = () => {
  // Santiago, Chile coordinates
  const defaultCenter: [number, number] = [-33.4489, -70.6693];
  
  map = L.map('map').setView(defaultCenter, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Fix icon issue with Leaflet + Webpack
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  if (props.propiedades && props.propiedades.length > 0) {
    updateMarkers(props.propiedades);
  }
};

const updateMarkers = (propiedades: Property[]) => {
  if (!map) return;

  // Clear existing markers
  markers.forEach(marker => marker.remove());
  markers = [];

  // Add new markers
  propiedades.forEach((propiedad) => {
    if (!map) return;

    // Create custom icon based on score (TAMAÑO MÁS GRANDE)
    const iconHtml = getMarkerIcon(propiedad.score);
    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [40, 52], // ancho x alto total (incluye la cola)
      iconAnchor: [20, 52], // punta del alfiler
    });

    const marker = L.marker([propiedad.latitud, propiedad.longitud], {
      icon: customIcon,
    }).addTo(map);

    marker.on('click', async () => {
      selectedPropertyInfo.value = propiedad;
      emit('property-selected', propiedad);
      
      // Si estamos en fullscreen, ocultar las demás propiedades
      if (isFullscreen.value) {
        const activeMap = mapFullscreen || map;
        markers.forEach(m => {
          if (m !== marker && activeMap && activeMap.hasLayer(m)) {
            activeMap.removeLayer(m);
          }
        });
      }
      
      // Cargar puntos de interés si aún no se han cargado
      if (!puntosDeInteres.value) {
        await cargarPuntosDeInteresCercanos(propiedad.latitud, propiedad.longitud);
      }
    });

    markers.push(marker);
  });

  // Fit bounds to show all markers
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
  }
};

const getMarkerIcon = (score?: number): string => {
  let color = '#3B82F6'; // azul por defecto
  let token = 'star';

  if (score !== undefined) {
    if (score >= 80) {
      color = '#10B981'; // verde
      token = 'trophy';
    } else if (score >= 60) {
      color = '#3B82F6'; // azul
      token = 'star';
    } else if (score >= 40) {
      color = '#F59E0B'; // amarillo
      token = 'thumbs';
    } else {
      color = '#6B7280'; // gris
      token = 'idea';
    }
  }

  const icon = `<i class="${iconClass(token)}" style="font-size:18px;color:${color}"></i>`;

  // Alfiler
  return `
    <div style="position: relative; width: 40px; height: 52px;">
      <div style="
        width: 36px; height: 36px; border-radius: 9999px; background: white;
        border: 4px solid ${color}; box-shadow: 0 6px 12px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center; margin: 0 auto;
      ">
        ${icon}
      </div>
      <div style="
        width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent;
        border-top: 16px solid ${color}; margin: -2px auto 0 auto;
      "></div>
    </div>
  `;
};

// Función para mostrar círculo del radio de búsqueda
const mostrarCirculoRadio = () => {
  const activeMap = mapFullscreen || map;
  if (!activeMap || !selectedPropertyInfo.value) return;
  
  // Limpiar círculo anterior si existe
  limpiarCirculoRadio();
  
  // Crear nuevo círculo
  searchRadiusCircle = L.circle(
    [selectedPropertyInfo.value.latitud, selectedPropertyInfo.value.longitud],
    {
      radius: searchRadius.value,
      color: '#3B82F6',
      fillColor: '#3B82F6',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '8, 12',
      opacity: 0.6
    }
  ).addTo(activeMap);
};

// Función para limpiar círculo del radio
const limpiarCirculoRadio = () => {
  if (searchRadiusCircle) {
    searchRadiusCircle.remove();
    searchRadiusCircle = null;
  }
};

// Función para cargar puntos de interés cercanos
const cargarPuntosDeInteresCercanos = async (latitud: number, longitud: number, radio?: number) => {
  try {
    loadingPOI.value = true;
    const radioActual = radio || searchRadius.value;
    
    // Cargar servicios tradicionales
    puntosDeInteres.value = await obtenerPuntosDeInteresCercanos(latitud, longitud, radioActual);
    
    // Cargar servicios GeoJSON (datos originales)
    await cargarServiciosGeoJSON(latitud, longitud, radioActual);
    
    if (showPOI.value) {
      mostrarPuntosDeInteres();
      mostrarCirculoRadio(); // Mostrar círculo al cargar servicios
    }
  } catch (error) {
    console.error('Error cargando puntos de interés:', error);
  } finally {
    loadingPOI.value = false;
  }
};

// Función para cargar servicios GeoJSON (datos originales)
const cargarServiciosGeoJSON = async (latitud: number, longitud: number, radio: number) => {
  try {
    serviciosGeoJSON.value = await obtenerServiciosGeoJSON(latitud, longitud, radio);
    
    // Inicializar filtros para todas las categorías encontradas
    if (serviciosGeoJSON.value && serviciosGeoJSON.value.categorias) {
      const categorias = Object.keys(serviciosGeoJSON.value.categorias);
      categoriasGeoJSON.value = categorias;
      
      // Activar todos los filtros por defecto
      categorias.forEach(cat => {
        if (!(cat in filtrosServiciosGeoJSON.value)) {
          filtrosServiciosGeoJSON.value[cat] = true;
        }
      });
    }
  } catch (error) {
    console.error('Error cargando servicios GeoJSON:', error);
  }
};

// Función para mostrar los puntos de interés en el mapa
const mostrarPuntosDeInteres = () => {
  const activeMap = mapFullscreen || map;
  if (!activeMap || !puntosDeInteres.value) return;
  
  // Limpiar marcadores anteriores de POI
  limpiarPuntosDeInteres();
  
  const pois = puntosDeInteres.value;
  
  // Mostrar solo los servicios que están habilitados en los filtros
  if (filtrosServicios.value.metros) {
    pois.metros?.forEach(poi => agregarMarcadorPOI(poi, 'train', '#EF4444', 'Metro', activeMap));
  }
  if (filtrosServicios.value.colegios) {
    pois.colegios?.forEach(poi => agregarMarcadorPOI(poi, 'book', '#8B5CF6', 'Colegio', activeMap));
  }
  if (filtrosServicios.value.centros_medicos) {
    pois.centros_medicos?.forEach(poi => agregarMarcadorPOI(poi, 'hospital', '#10B981', 'Centro Médico', activeMap));
  }
  if (filtrosServicios.value.supermercados) {
    pois.supermercados?.forEach(poi => agregarMarcadorPOI(poi, 'shopping-cart', '#F59E0B', 'Supermercado', activeMap));
  }
  if (filtrosServicios.value.parques) {
    pois.parques?.forEach(poi => agregarMarcadorPOI(poi, 'tree', '#22C55E', 'Parque', activeMap));
  }
  if (filtrosServicios.value.farmacias) {
    pois.farmacias?.forEach(poi => agregarMarcadorPOI(poi, 'plus-circle', '#06B6D4', 'Farmacia', activeMap));
  }
  if (filtrosServicios.value.comisarias) {
    pois.comisarias?.forEach(poi => agregarMarcadorPOI(poi, 'shield', '#3B82F6', 'Comisaría', activeMap));
  }
  if (filtrosServicios.value.bomberos) {
    pois.bomberos?.forEach(poi => agregarMarcadorPOI(poi, 'fire', '#DC2626', 'Bomberos', activeMap));
  }
  if (filtrosServicios.value.universidades) {
    pois.universidades?.forEach(poi => agregarMarcadorPOI(poi, 'graduation-cap', '#6366F1', 'Universidad', activeMap));
  }
  if (filtrosServicios.value.bancos) {
    pois.bancos?.forEach(poi => agregarMarcadorPOI(poi, 'wallet', '#059669', 'Banco', activeMap));
  }
  if (filtrosServicios.value.restaurantes) {
    pois.restaurantes?.forEach(poi => agregarMarcadorPOI(poi, 'star', '#F97316', 'Restaurante', activeMap));
  }
  if (filtrosServicios.value.correos) {
    pois.correos?.forEach(poi => agregarMarcadorPOI(poi, 'envelope', '#7C3AED', 'Correo', activeMap));
  }
  if (filtrosServicios.value.gasolineras) {
    pois.gasolineras?.forEach(poi => agregarMarcadorPOI(poi, 'car', '#EC4899', 'Gasolinera', activeMap));
  }
  if (filtrosServicios.value.cajeros) {
    pois.cajeros?.forEach(poi => agregarMarcadorPOI(poi, 'credit-card', '#14B8A6', 'Cajero', activeMap));
  }
  if (filtrosServicios.value.otros_servicios) {
    pois.otros_servicios?.forEach(poi => agregarMarcadorPOI(poi, 'wrench', '#6B7280', 'Otro Servicio', activeMap));
  }
  if (filtrosServicios.value.otros_comercios) {
    pois.otros_comercios?.forEach(poi => agregarMarcadorPOI(poi, 'shop', '#9CA3AF', 'Otro Comercio', activeMap));
  }
  
  // Mostrar servicios GeoJSON (datos originales) con marcadores morados
  mostrarServiciosGeoJSON(activeMap);
};

// Función para mostrar servicios GeoJSON con marcadores morados
const mostrarServiciosGeoJSON = (targetMap: L.Map) => {
  if (!targetMap || !serviciosGeoJSON.value) return;
  
  // Limpiar marcadores GeoJSON anteriores
  limpiarMarcadoresGeoJSON();
  
  const categorias = serviciosGeoJSON.value.categorias;
  
  // Iterar sobre cada categoría y mostrar los que estén activos en filtros
  Object.entries(categorias).forEach(([categoria, servicios]) => {
    if (filtrosServiciosGeoJSON.value[categoria] && servicios) {
      const icono = iconosCategoriasGeoJSON[categoria] || 'map-marker';
      const nombreCategoria = nombresCategoriasGeoJSON[categoria] || categoria;
      
      servicios.forEach((servicio: PointOfInterest) => {
        agregarMarcadorGeoJSON(servicio, icono, nombreCategoria, targetMap);
      });
    }
  });
};

// Función auxiliar para agregar marcador GeoJSON (siempre morado)
const agregarMarcadorGeoJSON = (poi: PointOfInterest, icono: string, categoria: string, targetMap: L.Map) => {
  if (!targetMap) return;
  
  // Color morado para todos los servicios GeoJSON
  const color = '#9333EA'; // Morado
  
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid #C084FC;
      box-shadow: 0 2px 8px rgba(147, 51, 234, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <i class="${iconClass(icono)}" style="font-size:14px;color:white"></i>
    </div>
  `;
  
  const customIcon = L.divIcon({
    html: iconHtml,
    className: 'custom-geojson-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
  
  const marker = L.marker([poi.latitud, poi.longitud], {
    icon: customIcon,
    opacity: 0.9
  }).addTo(targetMap);
  
  // Popup con información
  const distanciaTexto = poi.distancia ? `<div class="text-sm text-gray-600 mt-1"><i class="pi pi-map-marker"></i> ${Math.round(poi.distancia)}m</div>` : '';
  const direccionTexto = poi.direccion ? `<div class="text-xs text-gray-500 mt-1">${poi.direccion}</div>` : '';
  
  // Mostrar propiedades adicionales si existen
  let propiedadesHtml = '';
  if (poi.propiedades) {
    Object.entries(poi.propiedades).forEach(([key, value]) => {
      if (value && key !== 'geometry' && key !== 'id') {
        propiedadesHtml += `<div class="text-xs text-gray-500">${key}: ${value}</div>`;
      }
    });
  }
  
  marker.bindPopup(`
    <div style="min-width: 180px; max-width: 280px;">
      <div style="text-align: center; border-bottom: 2px solid ${color}; padding-bottom: 8px; margin-bottom: 8px;">
        <strong style="font-size: 12px; color: ${color};"><i class="${iconClass(icono)}"></i> ${categoria}</strong>
      </div>
      <div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">${poi.nombre || 'Sin nombre'}</div>
      ${distanciaTexto}
      ${direccionTexto}
      ${propiedadesHtml}
      <div class="text-xs text-purple-600 mt-2 italic">📍 Datos originales</div>
    </div>
  `, {
    maxWidth: 280,
    className: 'geojson-popup'
  });
  
  geoJsonMarkers.push(marker);
};

// Función para limpiar marcadores GeoJSON
const limpiarMarcadoresGeoJSON = () => {
  geoJsonMarkers.forEach(marker => marker.remove());
  geoJsonMarkers = [];
};

// Función auxiliar para agregar un marcador de POI
const agregarMarcadorPOI = (poi: PointOfInterest, emoji: string, color: string, tipo: string, targetMap: L.Map) => {
  if (!targetMap) return;
  
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 35px;
      height: 35px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
  <i class="${iconClass(emoji)}" style="font-size:18px;color:white"></i>
    </div>
  `;
  
  const customIcon = L.divIcon({
    html: iconHtml,
    className: 'custom-poi-marker',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
  });
  
  const marker = L.marker([poi.latitud, poi.longitud], {
    icon: customIcon,
    opacity: 0.85
  }).addTo(targetMap);
  
  // Agregar popup con información completa
  const distanciaTexto = poi.distancia ? `<div class="text-sm text-gray-600 mt-1"><i class="pi pi-map-marker"></i> ${Math.round(poi.distancia)}m de distancia</div>` : '';
  const direccionTexto = poi.direccion ? `<div class="text-xs text-gray-500 mt-1"><i class="pi pi-home"></i> ${poi.direccion}</div>` : '';
  const telefonoTexto = poi.telefono ? `<div class="text-xs text-gray-500"><i class="pi pi-phone"></i> ${poi.telefono}</div>` : '';
  const horarioTexto = poi.horario ? `<div class="text-xs text-gray-500"><i class="pi pi-clock"></i> ${poi.horario}</div>` : '';
  
  marker.bindPopup(`
    <div style="min-width: 200px; max-width: 300px;">
      <div style="text-align: center; border-bottom: 2px solid ${color}; padding-bottom: 8px; margin-bottom: 8px;">
        <strong style="font-size: 14px; color: ${color};"><i class="${iconClass(emoji)}"></i> ${tipo}</strong>
      </div>
      <div style="font-weight: 600; margin-bottom: 6px;">${poi.nombre}</div>
      ${distanciaTexto}
      ${direccionTexto}
      ${telefonoTexto}
      ${horarioTexto}
    </div>
  `, {
    maxWidth: 300,
    className: 'custom-popup'
  });
  
  poiMarkers.push(marker);
};

// Función para limpiar puntos de interés
const limpiarPuntosDeInteres = () => {
  poiMarkers.forEach(marker => marker.remove());
  poiMarkers = [];
  limpiarMarcadoresGeoJSON(); // Limpiar marcadores GeoJSON también
  limpiarCirculoRadio(); // Limpiar círculo también
};

// Toggle para mostrar/ocultar POIs
const handlePOIButton = async () => {
  if (!selectedPropertyInfo.value) return;
  // Si aún no hemos buscado POIs para esta propiedad
  if (!puntosDeInteres.value) {
    await cargarPuntosDeInteresCercanos(selectedPropertyInfo.value.latitud, selectedPropertyInfo.value.longitud);
    return;
  }
  // Si ya existen, simplemente togglear
  showPOI.value = !showPOI.value;
  if (showPOI.value) {
    mostrarPuntosDeInteres();
    mostrarCirculoRadio(); // Mostrar círculo
  } else {
    limpiarPuntosDeInteres();
  }
};

// Handler para cambio de radio
const onRadiusChange = async () => {
  if (!selectedPropertyInfo.value) return;
  // Recargar POIs con el nuevo radio
  await cargarPuntosDeInteresCercanos(selectedPropertyInfo.value.latitud, selectedPropertyInfo.value.longitud, searchRadius.value);
};

// Actualizar marcadores cuando cambian los filtros
const actualizarMarcadores = () => {
  if (showPOI.value) {
    mostrarPuntosDeInteres();
  }
};

// Toggle fullscreen
// Función para mostrar todas las propiedades nuevamente
const mostrarTodasPropiedades = () => {
  const activeMap = mapFullscreen || map;
  if (!activeMap || !props.propiedades) return;

  // Volver a mostrar todos los marcadores del fullscreen
  fullscreenMarkers.forEach(m => {
    if (!activeMap.hasLayer(m)) {
      m.addTo(activeMap);
    }
  });

  // Limpiar servicios
  limpiarPuntosDeInteres();
  limpiarCirculoRadio();
  puntosDeInteres.value = null;
  showPOI.value = false;
  selectedPropertyInfo.value = null;
};

const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value;
  
  if (isFullscreen.value) {
    // Abrir fullscreen
    await nextTick();
    
    // Inicializar mapa fullscreen con centro por defecto
    const defaultCenter: [number, number] = [-33.4489, -70.6693];
    
    mapFullscreen = L.map('map-fullscreen').setView(defaultCenter, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapFullscreen);

    // Fix icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Copiar marcadores al mapa fullscreen con popups
    if (props.propiedades && props.propiedades.length > 0) {
      // Limpiar marcadores anteriores del fullscreen
      fullscreenMarkers.forEach(m => mapFullscreen?.removeLayer(m));
      fullscreenMarkers = [];
      
      props.propiedades.forEach((propiedad) => {
        if (!mapFullscreen) return;

        const iconHtml = getMarkerIcon(propiedad.score);
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [40, 52],
          iconAnchor: [20, 52],
        });

        const marker = L.marker([propiedad.latitud, propiedad.longitud], {
          icon: customIcon,
        }).addTo(mapFullscreen);

        marker.on('click', async () => {
          selectedPropertyInfo.value = propiedad;
          emit('property-selected', propiedad);
          
          // Ocultar las demás propiedades en fullscreen
          fullscreenMarkers.forEach(m => {
            if (m !== marker && mapFullscreen?.hasLayer(m)) {
              mapFullscreen?.removeLayer(m);
            }
          });
          
          // Cargar puntos de interés si aún no se han cargado
          if (!puntosDeInteres.value) {
            await cargarPuntosDeInteresCercanos(propiedad.latitud, propiedad.longitud);
          } else if (showPOI.value) {
            // Si ya existen POIs y están visibles, mostrarlos
            mostrarPuntosDeInteres();
            mostrarCirculoRadio();
          }
        });

        // Agregar popup igual que en el mapa normal
        const popupContent = `
          <div style="min-width: 200px;">
            <b>${propiedad.direccion}</b><br/>
            <span style="color: #10B981; font-weight: bold;">
              ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(propiedad.precio)}
            </span><br/>
            ${propiedad.dormitorios}D / ${propiedad.banos}B
            ${propiedad.score ? `<br/><span style="color: ${getMarkerColor(propiedad.score)};">Score: ${propiedad.score.toFixed(1)}/100</span>` : ''}
            ${propiedad.comuna ? `<br/><small>${propiedad.comuna}</small>` : ''}
          </div>
        `;
        marker.bindPopup(popupContent);
        
        // Guardar en el array de marcadores fullscreen
        fullscreenMarkers.push(marker);
      });

      // Ajustar el zoom para mostrar todos los marcadores
      if (fullscreenMarkers.length > 0) {
        const group = L.featureGroup(fullscreenMarkers);
        mapFullscreen.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }

    // Agregar evento de click en el mapa para reactivar todas las propiedades
    if (mapFullscreen) {
      mapFullscreen.on('click', (e: L.LeafletMouseEvent) => {
        // Solo reactivar si hay propiedades ocultas y se hizo click en el mapa (no en un marcador)
        const clickedOnMarker = fullscreenMarkers.some(m => {
          const markerLatLng = m.getLatLng();
          const distance = mapFullscreen!.distance(e.latlng, markerLatLng);
          return distance < 20; // 20 metros de tolerancia
        });

        if (!clickedOnMarker && selectedPropertyInfo.value) {
          mostrarTodasPropiedades();
        }
      });
    }

    // Copiar POIs si están visibles
    if (showPOI.value && puntosDeInteres.value && mapFullscreen) {
      mostrarPuntosDeInteres();
      mostrarCirculoRadio();
    }
  } else {
    // Cerrar fullscreen
    if (mapFullscreen) {
      mapFullscreen.remove();
      mapFullscreen = null;
    }
  }
};

// Función auxiliar para obtener color del marcador
const getMarkerColor = (score?: number): string => {
  if (!score) return '#6B7280';
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#3B82F6';
  if (score >= 40) return '#F59E0B';
  return '#6B7280';
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
    case 'train':
      return 'pi pi-train';
    case 'book':
      return 'pi pi-book';
    case 'hospital':
      return 'pi pi-hospital';
    case 'shopping-cart':
      return 'pi pi-shopping-cart';
    case 'tree':
      return 'pi pi-tree';
    case 'plus-circle':
      return 'pi pi-plus-circle';
    case 'shield':
      return 'pi pi-shield';
    case 'fire':
      return 'pi pi-fire';
    default:
      return 'pi pi-question';
  }
};
</script>

<style>
.custom-marker {
  background: transparent;
  border: none;
}

.custom-poi-marker {
  background: transparent;
  border: none;
  cursor: pointer;
}

.custom-poi-marker:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Estilos para el slider de radio */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type="range"]::-webkit-slider-runnable-track {
  background: linear-gradient(to right, #3B82F6 0%, #3B82F6 var(--value), #E5E7EB var(--value), #E5E7EB 100%);
  height: 8px;
  border-radius: 4px;
}

input[type="range"]::-moz-range-track {
  background: #E5E7EB;
  height: 8px;
  border-radius: 4px;
}

/* Scrollbar personalizado para panel de servicios */
.styled-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.styled-scrollbar::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 10px;
}

.styled-scrollbar::-webkit-scrollbar-thumb {
  background: #3B82F6;
  border-radius: 10px;
  transition: background 0.2s;
}

.styled-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #2563EB;
}

/* Slider mejorado con efecto hover */
.slider-blue:hover::-webkit-slider-thumb {
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.4);
}

.slider-blue:hover::-moz-range-thumb {
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.4);
}

/* Estilos para popups personalizados */
.custom-popup .leaflet-popup-content-wrapper {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.custom-popup .leaflet-popup-content {
  margin: 12px;
}
</style>
