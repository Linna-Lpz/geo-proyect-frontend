<template>
  <div class="relative w-full h-full">
    <div id="map" class="w-full h-full"></div>
    
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
        </div>
      </div>

      <!-- Footer con Total -->
      <div class="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 flex items-center gap-2">
            <i class="pi pi-check-circle text-green-600"></i>
            Total encontrados
          </span>
          <span class="font-bold text-blue-600">{{ puntosDeInteres.total_encontrados || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { obtenerPuntosDeInteresCercanos, type PointOfInterest, type PointsOfInterestResponse } from '~/services/pointsOfInterestService';
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
let markers: L.Marker[] = [];
let poiMarkers: L.Marker[] = []; // Marcadores de puntos de interés
let searchRadiusCircle: L.Circle | null = null; // Círculo del radio de búsqueda
const selectedPropertyInfo = ref<Property | null>(null);
const showPOI = ref<boolean>(true); // Control para mostrar/ocultar POIs
const puntosDeInteres = ref<PointsOfInterestResponse | null>(null);
const loadingPOI = ref<boolean>(false);
const searchRadius = ref<number>(1500); // Radio de búsqueda en metros (por defecto 1.5km)
const filtrosServicios = ref({
  metros: true,
  colegios: true,
  centros_medicos: true,
  supermercados: true,
  parques: true,
  farmacias: true,
  comisarias: true,
  bomberos: true
});

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
      // Sólo cargamos si ya se había hecho una búsqueda antes y se quieren ver nuevamente (mantener UX liviana)
      if (puntosDeInteres.value && showPOI.value) {
        mostrarPuntosDeInteres();
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
  if (!map || !selectedPropertyInfo.value) return;
  
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
  ).addTo(map);
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
    puntosDeInteres.value = await obtenerPuntosDeInteresCercanos(latitud, longitud, radioActual);
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

// Función para mostrar los puntos de interés en el mapa
const mostrarPuntosDeInteres = () => {
  if (!map || !puntosDeInteres.value) return;
  
  // Limpiar marcadores anteriores de POI
  limpiarPuntosDeInteres();
  
  const pois = puntosDeInteres.value;
  
  // Mostrar solo los servicios que están habilitados en los filtros
  if (filtrosServicios.value.metros) {
    pois.metros?.forEach(poi => agregarMarcadorPOI(poi, 'train', '#EF4444', 'Metro'));
  }
  if (filtrosServicios.value.colegios) {
    pois.colegios?.forEach(poi => agregarMarcadorPOI(poi, 'book', '#8B5CF6', 'Colegio'));
  }
  if (filtrosServicios.value.centros_medicos) {
    pois.centros_medicos?.forEach(poi => agregarMarcadorPOI(poi, 'hospital', '#10B981', 'Centro Médico'));
  }
  if (filtrosServicios.value.supermercados) {
    pois.supermercados?.forEach(poi => agregarMarcadorPOI(poi, 'shopping-cart', '#F59E0B', 'Supermercado'));
  }
  if (filtrosServicios.value.parques) {
    pois.parques?.forEach(poi => agregarMarcadorPOI(poi, 'tree', '#22C55E', 'Parque'));
  }
  if (filtrosServicios.value.farmacias) {
    pois.farmacias?.forEach(poi => agregarMarcadorPOI(poi, 'plus-circle', '#06B6D4', 'Farmacia'));
  }
  if (filtrosServicios.value.comisarias) {
    pois.comisarias?.forEach(poi => agregarMarcadorPOI(poi, 'shield', '#3B82F6', 'Comisaría'));
  }
  if (filtrosServicios.value.bomberos) {
    pois.bomberos?.forEach(poi => agregarMarcadorPOI(poi, 'fire', '#DC2626', 'Bomberos'));
  }
};

// Función auxiliar para agregar un marcador de POI
const agregarMarcadorPOI = (poi: PointOfInterest, emoji: string, color: string, tipo: string) => {
  if (!map) return;
  
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
  }).addTo(map);
  
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
