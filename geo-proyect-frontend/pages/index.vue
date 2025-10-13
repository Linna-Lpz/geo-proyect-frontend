<script setup lang="ts">
import { ref } from 'vue'

// Referencia al componente Map
const mapRef = ref<any>(null)

// Lista de propiedades (vacía inicialmente - aquí irán tus datos reales)
const propertiesLocation = ref<any[]>([])

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
  <div class="flex flex-col gap-4 pt-4 px-4 pb-4">
    <!-- Barra de búsqueda + opciones de búsqueda -->
    <div class="flex flex-row items-center mr-4 mb-4 mt-2 gap-4">
      <!-- Barra de búsqueda -->
      <div class="w-1/2 items-center">
        <SearchBar @select="handleSearchSelect" />
      </div>

      <!-- Opciones de búsqueda -->
      <OptionBox
          option-label="Supermercados"
          :options="[
            { text: 'A menos de 500 m' },
            { text: 'A menos de 1 km' },
            { text: 'A menos de 2 km' }
          ]"
          option-icon="pi pi-shopping-cart"
      />
      <OptionBox
          option-label="Colegios"
          :options="[
            { text: 'A menos de 500 m' },
            { text: 'A menos de 1 km' },
            { text: 'A menos de 2 km' }
          ]"
          option-icon="pi pi-graduation-cap"
      />
      <OptionBox
          option-label="Áreas verdes"
          :options="[
            { text: 'A menos de 500 m' },
            { text: 'A menos de 1 km' },
            { text: 'A menos de 2 km' }
          ]"
          option-icon="pi pi-image"
      />

      <button
      class="px-6 py-[13px] p-3 mb-[13px] border bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 items-center shadow-md"
      >
        Buscar
      </button>
    </div>

    <!-- Mapa y listado de viviendas -->
    <div class="flex flex-row h-screen">
        <!-- Mapa -->
        <div class="w-1/2 mr-4">
          <ClientOnly>
            <Map
                ref="mapRef"
                :items="propertiesLocation"
                :fit-to-items="true"
                :max-bounds="maxBounds"
                zoom-control-position="bottomleft"
                :boundary-geojson="boundaryGeojson"
                @select="onSelect"
            />
          </ClientOnly>
        </div>

      <!-- Listado de viviendas -->
      <div class="flex flex-col w-1/2 gap-4">
        <PropertyBox
            v-for="(property, idx) in properties"
            :key="idx"
            v-bind="property"
        />
      </div>
    </div>
  </div>
</template>


<script lang="ts">

const properties = [
  {
    propertyImage: 'casa1.jpg',
    propertyTittle: 'Casa Moderna',
    propertyAddress: 'Calle Falsa 123',
    propertyCommune: 'Santiago',
    propertyPrice: '250000',
    propertyDescription: 'Una casa moderna en el centro.'
  },
  {
    propertyImage: 'departamento1.jpg',
    propertyTittle: 'Departamento Acogedor',
    propertyAddress: 'Avenida Siempre Viva 456',
    propertyCommune: 'Ñuñoa',
    propertyPrice: '180000',
    propertyDescription: 'Departamento cerca de la naturaleza.'
  }
]
</script>
