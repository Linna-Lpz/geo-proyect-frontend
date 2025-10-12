<script setup lang="ts">
import { ref } from 'vue'

// Referencia al componente Map
const mapRef = ref<any>(null)

// Lista de propiedades (vacía inicialmente - aquí irán tus datos reales)
const propiedades = ref<any[]>([])

// BBox que restringe el paneo a Ñuñoa, Santiago, Estación Central y La Reina
const maxBounds: [[number, number], [number, number]] = [
  [-33.520, -70.725], // SW (suroeste)
  [-33.400, -70.500]  // NE (noreste)
]

// GeoJSON con los polígonos de las 4 comunas
const boundaryGeojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Estación Central', color: '#3B82F6' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-70.725, -33.505],
          [-70.655, -33.505],
          [-70.655, -33.455],
          [-70.725, -33.455],
          [-70.725, -33.505]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Santiago', color: '#10B981' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-70.720, -33.520],
          [-70.590, -33.520],
          [-70.590, -33.400],
          [-70.720, -33.400],
          [-70.720, -33.520]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Ñuñoa', color: '#F59E0B' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-70.620, -33.495],
          [-70.540, -33.495],
          [-70.540, -33.435],
          [-70.620, -33.435],
          [-70.620, -33.495]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'La Reina', color: '#8B5CF6' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-70.580, -33.470],
          [-70.500, -33.470],
          [-70.500, -33.410],
          [-70.580, -33.410],
          [-70.580, -33.470]
        ]]
      }
    }
  ]
}

function onSelect(item: any) {
  console.log('Seleccionado en mapa:', item)
}

// Manejar selección de búsqueda
function handleSearchSelect(data: { lat: number; lng: number; displayName: string }) {
  if (mapRef.value) {
    mapRef.value.goToLocation(data.lat, data.lng, data.displayName)
  }
}
</script>

<template>
  <div class="grid grid-cols-12 gap-4 h-screen pt-4 px-4 pb-4">
    <!-- C3: Columna izquierda, barra de búsqueda + mapa -->
    <div class="col-span-12 lg:col-span-6 flex flex-col">
      <!-- Barra de búsqueda -->
      <SearchBar @select="handleSearchSelect" />
      
      <!-- Mapa -->
      <div class="w-full flex-1">
        <ClientOnly>
          <Map
            ref="mapRef"
            :items="propiedades"
            :fit-to-items="true"
            :max-bounds="maxBounds"
            zoom-control-position="bottomleft"
            :boundary-geojson="boundaryGeojson"
            @select="onSelect"
          />
        </ClientOnly>
      </div>
    </div>

    <!-- C2: derecha (listado de propiedades) -->
    <div class="col-span-12 lg:col-span-6 overflow-y-auto">
      <!-- tu lista de tarjetas -->
    </div>
  </div>
</template>
