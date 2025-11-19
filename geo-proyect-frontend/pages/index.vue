<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-gray-800 mb-4">
          <i class="pi pi-home mr-2"></i>TerraMatch
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Sistema inteligente de recomendaciones inmobiliarias con Machine Learning
        </p>
        <NuxtLink 
          to="/recomendacionesML"
          class="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all shadow-lg"
        >
          <i class="pi pi-search mr-2"></i>Encontrar Mi Propiedad Ideal
        </NuxtLink>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-5xl mb-4"><i class="pi pi-cog text-5xl"></i></div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Machine Learning</h3>
          <p class="text-gray-600">
            Sistema de scoring avanzado con preferencias personalizadas (-10 a +10)
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-5xl mb-4"><i class="pi pi-map-marker text-5xl"></i></div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Análisis Geoespacial</h3>
          <p class="text-gray-600">
            21 métricas de distancia a servicios: metro, parques, hospitales, colegios
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-5xl mb-4"><i class="pi pi-bolt text-5xl"></i></div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Recomendaciones Inteligentes</h3>
          <p class="text-gray-600">
            Encuentra propiedades que se ajustan exactamente a tus preferencias
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-16 grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
          <div class="text-3xl font-bold mb-1">91.4%</div>
          <div class="text-sm opacity-90">Precisión (R²)</div>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white text-center">
          <div class="text-3xl font-bold mb-1">7</div>
          <div class="text-sm opacity-90">Comunas</div>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center">
          <div class="text-3xl font-bold mb-1">16</div>
          <div class="text-sm opacity-90">Features</div>
        </div>
        <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white text-center">
          <div class="text-3xl font-bold mb-1">0.13</div>
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
            class="px-6 py-3 bg-white rounded-full shadow-md text-gray-700 font-medium"
          >
            <i class="pi pi-map-marker mr-1"></i> {{ comuna }}
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
