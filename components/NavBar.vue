<template>
  <nav class="shadow-lg border-b" style="background-color: #1e3a5f; border-color: #2c5282;">
    <div class="px-4">
      <div class="flex justify-between items-center py-3">
        <!-- Logo -->
        <div class="flex items-center h-14">
        <!-- Left: Logo + Company -->
        <NuxtLink to="/" class="flex items-center space-x-3 group">
          <!-- Inline logo: stylized map pin + leaf -->
          <span class="inline-flex items-center justify-center h-11 w-11 rounded-lg text-white border transition-all duration-200 hover:bg-opacity-90" style="background-color: #2c5282; border-color: #4a90d9;">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.866-3.134-7-7-7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11.2a2.2 2.2 0 100-4.4 2.2 2.4 0 000 4.4z" fill="white"/>
            </svg>
          </span>

          <div class="flex flex-col">
            <span class="text-xl font-bold text-white group-hover:text-gray-100 transition-colors duration-200">TerraMatch</span>
            <span v-if="currentPageTitle" class="text-xs font-medium text-gray-300">{{ currentPageTitle }}</span>
          </div>
        </NuxtLink>
      </div>

        <!-- Navegación -->
        <div class="hidden md:flex space-x-1">
          <NuxtLink 
            to="/"
            class="text-gray-200 hover:text-white hover:bg-blue-800 hover:bg-opacity-50 font-medium transition-all duration-200 flex items-center px-4 py-2 rounded-md"
            :class="{ 'bg-blue-800 bg-opacity-60 text-white border-b-2 border-blue-400': route.path === '/' }"
          >
            <i class="pi pi-home mr-2"></i>
            Inicio
          </NuxtLink>
          <NuxtLink 
            to="/dashboard"
            class="text-gray-200 hover:text-white hover:bg-blue-800 hover:bg-opacity-50 font-medium transition-all duration-200 flex items-center px-4 py-2 rounded-md"
            :class="{ 'bg-blue-800 bg-opacity-60 text-white border-b-2 border-blue-400': route.path === '/dashboard' }"
          >
            <i class="pi pi-chart-bar mr-2"></i>
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/recomendacionesML"
            class="text-gray-200 hover:text-white hover:bg-blue-800 hover:bg-opacity-50 font-medium transition-all duration-200 flex items-center px-4 py-2 rounded-md"
            :class="{ 'bg-blue-800 bg-opacity-60 text-white border-b-2 border-blue-400': route.path === '/recomendacionesML' }"
          >
            <i class="pi pi-search mr-2"></i>
            Búsqueda Avanzada
          </NuxtLink>
          <NuxtLink 
            to="/propertySearch"
            class="text-gray-200 hover:text-white hover:bg-blue-800 hover:bg-opacity-50 font-medium transition-all duration-200 flex items-center px-4 py-2 rounded-md"
            :class="{ 'bg-blue-800 bg-opacity-60 text-white border-b-2 border-blue-400': route.path === '/propertySearch' }"
          >
            <i class="pi pi-dollar mr-2"></i>
            Predictor de Precios
          </NuxtLink>
        </div>

        <!-- Mobile menu button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-800 hover:bg-opacity-50 transition-colors duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4 space-y-1 border-t pt-4" style="border-color: #2c5282;">
        <NuxtLink 
          to="/" 
          class="block py-2 px-3 rounded-md text-gray-200 hover:bg-blue-800 hover:bg-opacity-50 hover:text-white font-medium flex items-center transition-all duration-200"
          :class="{ 'bg-blue-800 bg-opacity-60 text-white border-l-4 border-blue-400': route.path === '/' }"
          @click="mobileMenuOpen = false"
        >
          <i class="pi pi-home mr-2"></i>
          Inicio
        </NuxtLink>
        <NuxtLink 
          to="/dashboard" 
          class="block py-2 px-3 rounded-md text-gray-200 hover:bg-blue-800 hover:bg-opacity-50 hover:text-white font-medium flex items-center transition-all duration-200"
          :class="{ 'bg-blue-800 bg-opacity-60 text-white border-l-4 border-blue-400': route.path === '/dashboard' }"
          @click="mobileMenuOpen = false"
        >
          <i class="pi pi-chart-bar mr-2"></i>
          Dashboard
        </NuxtLink>
        <NuxtLink 
          to="/recomendacionesML"
          class="block py-2 px-3 rounded-md text-gray-200 hover:bg-blue-800 hover:bg-opacity-50 hover:text-white font-medium flex items-center transition-all duration-200"
          :class="{ 'bg-blue-800 bg-opacity-60 text-white border-l-4 border-blue-400': route.path === '/recomendacionesML' }"
          @click="mobileMenuOpen = false"
        >
          <i class="pi pi-search mr-2"></i>
          Búsqueda Avanzada
        </NuxtLink>
        <NuxtLink 
          to="/propertySearch"
          class="block py-2 px-3 rounded-md text-gray-200 hover:bg-blue-800 hover:bg-opacity-50 hover:text-white font-medium flex items-center transition-all duration-200"
          :class="{ 'bg-blue-800 bg-opacity-60 text-white border-l-4 border-blue-400': route.path === '/propertySearch' }"
          @click="mobileMenuOpen = false"
        >
          <i class="pi pi-dollar mr-2"></i>
          Predictor de Precios
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const mobileMenuOpen = ref(false)
const route = useRoute()

const pageTitles: Record<string, string> = {
  '/': '',
  '/dashboard': 'Dashboard',
  '/recomendacionesML': 'Búsqueda Avanzada',
  '/chatRecommendations': 'Asistente Inteligente',
  '/propertySearch': 'Predictor de Precios'
}

const currentPageTitle = computed(() => {
  return pageTitles[route.path] || ''
})
</script>
