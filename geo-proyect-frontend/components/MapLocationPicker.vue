<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="block text-sm font-medium text-gray-700">
        Ubicación en el Mapa *
      </label>
      <button
        type="button"
        @click="getCurrentLocation"
        class="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <i class="pi pi-map-marker"></i>
        Usar mi ubicación
      </button>
    </div>

    <div class="relative">
      <div 
        ref="mapContainer" 
        class="w-full h-80 rounded-lg border-2 border-gray-300 shadow-md z-0"
      ></div>
      
      <div 
        v-if="modelValue.latitud && modelValue.longitud"
        class="absolute top-2 left-2 bg-white px-3 py-2 rounded-lg shadow-md text-xs z-[1000]"
      >
        <div class="font-semibold text-gray-700 mb-1">Coordenadas seleccionadas:</div>
        <div class="text-gray-600">
          Lat: {{ modelValue.latitud.toFixed(6) }}
        </div>
        <div class="text-gray-600">
          Lng: {{ modelValue.longitud.toFixed(6) }}
        </div>
      </div>
    </div>

    <p class="text-xs text-gray-500 italic">
      <i class="pi pi-info-circle mr-1"></i>
      Haz click en el mapa para seleccionar la ubicación de la propiedad
    </p>
  </div>
</template>

<script setup lang="ts">
interface Coordinates {
  latitud: number;
  longitud: number;
}

const props = defineProps<{
  modelValue: Coordinates;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Coordinates): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: any = null;
let marker: any = null;
let L: any = null;

onMounted(async () => {
  // Importar Leaflet dinámicamente (solo en el cliente)
  if (import.meta.client) {
    L = (await import('leaflet')).default;

    // Fix para los iconos de Leaflet en Nuxt
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    initMap();
  }
});

const initMap = () => {
  if (!mapContainer.value || !L) return;

  // Centro de Santiago
  const defaultCenter: [number, number] = [
    props.modelValue.latitud || -33.4489,
    props.modelValue.longitud || -70.6693
  ];

  // Crear mapa
  map = L.map(mapContainer.value, {
    zoomControl: true,
  }).setView(defaultCenter, 13);

  // Agregar capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Agregar marcador inicial si hay coordenadas
  if (props.modelValue.latitud && props.modelValue.longitud) {
    marker = L.marker(defaultCenter, {
      draggable: true
    }).addTo(map);

    // Evento al arrastrar el marcador
    marker.on('dragend', (e: any) => {
      const position = e.target.getLatLng();
      updateCoordinates(position.lat, position.lng);
    });
  }

  // Evento de click en el mapa
  map.on('click', (e: any) => {
    const { lat, lng } = e.latlng;
    
    // Si ya existe un marcador, moverlo
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      // Crear nuevo marcador
      marker = L.marker([lat, lng], {
        draggable: true
      }).addTo(map);

      // Evento al arrastrar el marcador
      marker.on('dragend', (e: any) => {
        const position = e.target.getLatLng();
        updateCoordinates(position.lat, position.lng);
      });
    }

    updateCoordinates(lat, lng);
  });
};

const updateCoordinates = (lat: number, lng: number) => {
  emit('update:modelValue', {
    latitud: Number(lat.toFixed(6)),
    longitud: Number(lng.toFixed(6))
  });
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Actualizar mapa y marcador
      if (map && L) {
        map.setView([lat, lng], 15);
        
        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          marker = L.marker([lat, lng], {
            draggable: true
          }).addTo(map);

          marker.on('dragend', (e: any) => {
            const position = e.target.getLatLng();
            updateCoordinates(position.lat, position.lng);
          });
        }

        updateCoordinates(lat, lng);
      }
    },
    (error) => {
      console.error('Error obteniendo ubicación:', error);
      alert('No se pudo obtener tu ubicación');
    }
  );
};

// Actualizar mapa cuando cambien las coordenadas externamente
watch(() => props.modelValue, (newVal) => {
  if (map && marker && L && newVal.latitud && newVal.longitud) {
    const newLatLng: [number, number] = [newVal.latitud, newVal.longitud];
    marker.setLatLng(newLatLng);
    map.setView(newLatLng);
  }
}, { deep: true });
</script>

<style scoped>
/* Asegurar que el mapa tenga el z-index correcto */
:deep(.leaflet-container) {
  z-index: 0;
}

:deep(.leaflet-pane) {
  z-index: 400;
}

:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 1000;
}
</style>
