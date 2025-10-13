<template>
  <div class="w-full mb-4">
    <div class="relative">
      <input
        v-model="searchQuery"
        @keyup.enter="searchAddress"
        type="text"
        placeholder="Buscar calle o dirección..."
        class="w-full px-4 py-3 pr-12 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        @click="searchAddress"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-blue-600 transition-colors"
        :disabled="isSearching"
      >
        <svg v-if="!isSearching" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
    </div>
    <!-- Resultados de búsqueda -->
    <div v-if="searchResults.length > 0" class="mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto max-w-2xl">
      <button
        v-for="result in searchResults"
        :key="result.place_id"
        @click="selectSearchResult(result)"
        class="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
      >
        <div class="font-medium text-gray-900 text-sm">{{ result.display_name }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'select', data: { lat: number; lng: number; displayName: string }): void
}>()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

// Función para buscar dirección usando Nominatim (OpenStreetMap)
async function searchAddress() {
  if (!searchQuery.value.trim()) return

  isSearching.value = true
  searchResults.value = []

  try {
    // Buscar en la región de Santiago, Chile (4 comunas: Estación Central, Santiago, Ñuñoa, La Reina)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json` +
      `&q=${encodeURIComponent(searchQuery.value + ', Santiago, Chile')}` +
      `&limit=5` +
      `&bounded=1` +
      `&viewbox=-70.725,-33.400,-70.500,-33.520` + // Bbox de las 4 comunas (SW-NE)
      `&addressdetails=1`
    )
    const data = await response.json()
    searchResults.value = data
  } catch (error) {
    console.error('Error buscando dirección:', error)
  } finally {
    isSearching.value = false
  }
}

// Función para seleccionar un resultado de búsqueda
function selectSearchResult(result: any) {
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)

  emit('select', {
    lat,
    lng,
    displayName: result.display_name
  })

  // Actualizar el query con el resultado seleccionado
  searchQuery.value = result.display_name
  
  // Limpiar resultados
  searchResults.value = []
}
</script>
