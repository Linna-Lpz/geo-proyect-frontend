<template>
  <div class="relative w-full h-full">
    <div id="map" class="w-full h-full"></div>
    
  <!-- Toggle POI Button -->
    <button
      v-if="selectedPropertyInfo"
      @click="togglePOI"
      :class="[
        'absolute top-4 right-4 z-10 px-4 py-2 rounded-lg shadow-lg font-semibold transition-all',
        showPOI 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
      ]"
    >
      <span v-if="showPOI"><i class="pi pi-eye mr-2"></i>Ocultar Servicios</span>
      <span v-else><i class="pi pi-map mr-2"></i>Mostrar Servicios</span>
    </button>
    
    <!-- POI Legend (cuando se muestran los POIs) -->
    <div
      v-if="selectedPropertyInfo && showPOI && puntosDeInteres"
      class="absolute top-20 right-4 bg-white rounded-lg shadow-xl p-3 z-10 max-w-xs"
    >
  <h4 class="font-bold text-sm mb-2 text-gray-700"><i class="pi pi-map-marker mr-2"></i>Servicios Cercanos</h4>
      <div class="space-y-1 text-xs">
        <div v-if="puntosDeInteres.metros?.length" class="flex items-center gap-2">
          <i class="pi pi-train"></i>
          <span class="text-gray-600">{{ puntosDeInteres.metros.length }} Metro(s)</span>
        </div>
        <div v-if="puntosDeInteres.colegios?.length" class="flex items-center gap-2">
          <i class="pi pi-book"></i>
          <span class="text-gray-600">{{ puntosDeInteres.colegios.length }} Colegio(s)</span>
        </div>
        <div v-if="puntosDeInteres.centros_medicos?.length" class="flex items-center gap-2">
          <i class="pi pi-hospital"></i>
          <span class="text-gray-600">{{ puntosDeInteres.centros_medicos.length }} Centro(s) Médico(s)</span>
        </div>
        <div v-if="puntosDeInteres.supermercados?.length" class="flex items-center gap-2">
          <i class="pi pi-shopping-cart"></i>
          <span class="text-gray-600">{{ puntosDeInteres.supermercados.length }} Supermercado(s)</span>
        </div>
        <div v-if="puntosDeInteres.parques?.length" class="flex items-center gap-2">
          <i class="pi pi-tree"></i>
          <span class="text-gray-600">{{ puntosDeInteres.parques.length }} Parque(s)</span>
        </div>
        <div v-if="puntosDeInteres.farmacias?.length" class="flex items-center gap-2">
          <i class="pi pi-plus-circle"></i>
          <span class="text-gray-600">{{ puntosDeInteres.farmacias.length }} Farmacia(s)</span>
        </div>
        <div v-if="puntosDeInteres.comisarias?.length" class="flex items-center gap-2">
          <i class="pi pi-shield"></i>
          <span class="text-gray-600">{{ puntosDeInteres.comisarias.length }} Comisaría(s)</span>
        </div>
        <div v-if="puntosDeInteres.bomberos?.length" class="flex items-center gap-2">
          <i class="pi pi-fire"></i>
          <span class="text-gray-600">{{ puntosDeInteres.bomberos.length }} Cuartel(es) Bomberos</span>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-2 border-t pt-2">
        Radio de búsqueda: 1.5 km
      </p>
    </div>
    
    <!-- Property Info Card (when selected) -->
    <div
      v-if="selectedPropertyInfo"
      class="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-md z-10"
    >
      <button
        @click="clearSelection"
        class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <i class="pi pi-times"></i>
      </button>
      
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <i v-if="selectedPropertyInfo.score" :class="['text-2xl', iconClass(getEmojiScore(selectedPropertyInfo.score))]"></i>
          <h3 class="font-bold text-lg">{{ selectedPropertyInfo.direccion }}</h3>
        </div>
        
  <p class="text-sm text-gray-600"><i class="pi pi-map-marker mr-1"></i> {{ selectedPropertyInfo.comuna }}</p>
        
        <div class="flex items-center gap-4 text-sm">
          <span class="font-bold text-green-600">
            {{ formatearPrecio(selectedPropertyInfo.precio) }}
          </span>
          <span><i class="pi pi-user mr-1"></i> {{ selectedPropertyInfo.dormitorios }}D</span>
          <span><i class="pi pi-shower mr-1"></i> {{ selectedPropertyInfo.banos }}B</span>
        </div>
        
        <div v-if="selectedPropertyInfo.score" class="mt-3 pt-3 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Puntuación:</span>
            <span :class="['text-xl font-bold', getColorScore(selectedPropertyInfo.score)]">
              {{ selectedPropertyInfo.score.toFixed(1) }}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
const selectedPropertyInfo = ref<Property | null>(null);
const showPOI = ref<boolean>(true); // Control para mostrar/ocultar POIs
const puntosDeInteres = ref<PointsOfInterestResponse | null>(null);

onMounted(() => {
  initMap();
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
      iconSize: [60, 60], // Aumentado de 40x40 a 60x60
      iconAnchor: [30, 60], // Ajustado proporcionalmente
    });

    const marker = L.marker([propiedad.latitud, propiedad.longitud], {
      icon: customIcon,
    }).addTo(map);

    marker.on('click', async () => {
      selectedPropertyInfo.value = propiedad;
      emit('property-selected', propiedad);
      
      // Cargar puntos de interés cercanos
      await cargarPuntosDeInteresCercanos(propiedad.latitud, propiedad.longitud);
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
  let color = '#3B82F6'; // blue default
  let token = 'home';

  if (score !== undefined) {
    if (score >= 80) {
      color = '#10B981'; // green
      token = 'trophy';
    } else if (score >= 60) {
      color = '#3B82F6'; // blue
      token = 'star';
    } else if (score >= 40) {
      color = '#F59E0B'; // yellow
      token = 'thumbs';
    } else {
      color = '#6B7280'; // gray
      token = 'idea';
    }
  }

  const icon = `<i class="${iconClass(token)}" style="font-size:28px;color:white;"></i>`;

  return `
    <div style="
      background-color: ${color};
      width: 60px;
      height: 60px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 4px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="transform: rotate(45deg);">${icon}</div>
    </div>
  `;
};

// Función para cargar puntos de interés cercanos
const cargarPuntosDeInteresCercanos = async (latitud: number, longitud: number) => {
  try {
    puntosDeInteres.value = await obtenerPuntosDeInteresCercanos(latitud, longitud, 1500); // Radio de 1.5km
    
    if (showPOI.value) {
      mostrarPuntosDeInteres();
    }
  } catch (error) {
    console.error('Error cargando puntos de interés:', error);
  }
};

// Función para mostrar los puntos de interés en el mapa
const mostrarPuntosDeInteres = () => {
  if (!map || !puntosDeInteres.value) return;
  
  // Limpiar marcadores anteriores de POI
  limpiarPuntosDeInteres();
  
  const pois = puntosDeInteres.value;
  
  // Metros
  pois.metros?.forEach(poi => agregarMarcadorPOI(poi, 'train', '#EF4444', 'Metro'));
  
  // Colegios
  pois.colegios?.forEach(poi => agregarMarcadorPOI(poi, 'book', '#8B5CF6', 'Colegio'));
  
  // Centros médicos
  pois.centros_medicos?.forEach(poi => agregarMarcadorPOI(poi, 'hospital', '#10B981', 'Centro Médico'));
  
  // Supermercados
  pois.supermercados?.forEach(poi => agregarMarcadorPOI(poi, 'shopping-cart', '#F59E0B', 'Supermercado'));
  
  // Parques
  pois.parques?.forEach(poi => agregarMarcadorPOI(poi, 'tree', '#22C55E', 'Parque'));
  
  // Farmacias
  pois.farmacias?.forEach(poi => agregarMarcadorPOI(poi, 'plus-circle', '#06B6D4', 'Farmacia'));
  
  // Comisarías
  pois.comisarias?.forEach(poi => agregarMarcadorPOI(poi, 'shield', '#3B82F6', 'Comisaría'));
  
  // Bomberos
  pois.bomberos?.forEach(poi => agregarMarcadorPOI(poi, 'fire', '#DC2626', 'Bomberos'));
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
  
  // Agregar popup con información
  const distanciaTexto = poi.distancia ? `<br><small><i class="pi pi-ruler"></i> ${poi.distancia}m de distancia</small>` : '';
  marker.bindPopup(`
    <div style="text-align: center;">
      <strong><i class="${iconClass(emoji)}"></i> ${tipo}</strong><br>
      ${poi.nombre}
      ${distanciaTexto}
    </div>
  `);
  
  poiMarkers.push(marker);
};

// Función para limpiar puntos de interés
const limpiarPuntosDeInteres = () => {
  poiMarkers.forEach(marker => marker.remove());
  poiMarkers = [];
};

// Toggle para mostrar/ocultar POIs
const togglePOI = () => {
  showPOI.value = !showPOI.value;
  
  if (showPOI.value && puntosDeInteres.value) {
    mostrarPuntosDeInteres();
  } else {
    limpiarPuntosDeInteres();
  }
};

const clearSelection = () => {
  selectedPropertyInfo.value = null;
  limpiarPuntosDeInteres();
  puntosDeInteres.value = null;
};

const formatearPrecio = (precio: number): string => {
  // Precio está en UF, convertir a CLP para visualización
  const VALOR_UF_CLP = 37500;
  const precioCLP = precio * VALOR_UF_CLP;
  const ufFormateado = precio.toLocaleString('es-CL', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });
  const clpFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precioCLP);
  
  return `${ufFormateado} UF (≈${clpFormateado})`;
};

const getColorScore = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-gray-600';
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
// Wrapper to obtain token from recommendation service
const getEmojiScore = (score: number): string => {
  return recommendationService.getEmojiScore(score);
};

// old emoji helper removed (we now use recommendationService.getEmojiScore and iconClass mapping)
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
</style>
