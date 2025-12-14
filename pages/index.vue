<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="container mx-auto px-4 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-gray-800 mb-4">
          <i class="pi pi-home mr-2 text-blue-700"></i>TerraMatch
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Sistema inteligente de recomendaciones inmobiliarias con Machine Learning
        </p>
        <NuxtLink 
          to="/recomendacionesML"
          class="inline-block px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          <i class="pi pi-search mr-2"></i>Encontrar Mi Propiedad Ideal
        </NuxtLink>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 text-center border border-gray-200">
          <div class="text-blue-700 mb-4"><i class="pi pi-cog text-5xl"></i></div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">Machine Learning</h3>
          <p class="text-gray-600 leading-relaxed">
            Sistema de scoring avanzado con preferencias personalizadas (-10 a +10)
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 text-center border border-gray-200">
          <div class="text-blue-700 mb-4"><i class="pi pi-map-marker text-5xl"></i></div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">Análisis Geoespacial</h3>
          <p class="text-gray-600 leading-relaxed">
            21 métricas de distancia a servicios: metro, parques, hospitales, colegios
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 text-center border border-gray-200">
          <div class="text-blue-700 mb-4"><i class="pi pi-bolt text-5xl"></i></div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">Recomendaciones Inteligentes</h3>
          <p class="text-gray-600 leading-relaxed">
            Encuentra propiedades que se ajustan exactamente a tus preferencias
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-16 grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        <div class="bg-blue-700 rounded-lg p-6 text-white text-center shadow-md hover:shadow-lg transition-shadow">
          <div class="text-4xl font-bold mb-2">91.4%</div>
          <div class="text-sm opacity-90">Precisión (R²)</div>
        </div>
        <div class="bg-blue-600 rounded-lg p-6 text-white text-center shadow-md hover:shadow-lg transition-shadow">
          <div class="text-4xl font-bold mb-2">4</div>
          <div class="text-sm opacity-90">Comunas</div>
        </div>
        <div class="bg-gray-600 rounded-lg p-6 text-white text-center shadow-md hover:shadow-lg transition-shadow">
          <div class="text-4xl font-bold mb-2">16</div>
          <div class="text-sm opacity-90">Features</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-6 text-white text-center shadow-md hover:shadow-lg transition-shadow">
          <div class="text-4xl font-bold mb-2">0.13</div>
          <div class="text-sm opacity-90">RMSE</div>
        </div>
      </div>

      <!-- Comunas -->
      <div class="mt-16 max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-800 text-center mb-8">
          Comunas Disponibles
        </h2>
        <div class="flex flex-wrap justify-center gap-3">
            <span 
            v-for="comuna in comunas" 
            :key="comuna"
            class="px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700 font-medium border border-gray-200"
          >
            <i class="pi pi-map-marker mr-2 text-blue-600"></i>{{ comuna }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Inicio - TerraMatch'
});

const comunas = [
  'Estación Central',
  'Santiago',
  'Ñuñoa',
  'La Reina'
];
</script>
