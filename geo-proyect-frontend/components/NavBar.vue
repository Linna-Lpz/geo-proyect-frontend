<template>
  <nav class="bg-white shadow-lg">
    <div class="px-4">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <div class="flex items-center justify-between h-16">
        <!-- Left: Logo + Company -->
        <NuxtLink to="/" class="flex items-center space-x-3">
          <!-- Inline logo: stylized map pin + leaf -->
          <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-green-400 text-white">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.866-3.134-7-7-7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z" fill="white"/>
            </svg>
          </span>

          <div class="flex flex-col">
            <span class="text-lg font-semibold text-slate-900 dark:text-slate-100">TerraMatch</span>
            <span v-if="currentPageTitle" class="text-xs text-blue-600 font-medium">{{ currentPageTitle }}</span>
          </div>
        </NuxtLink>

        <!-- Mobile menu placeholder (keeps layout consistent) -->
        <div class="sm:hidden">
          <button aria-label="open menu" class="p-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

        <!-- Navegación -->
        <div class="hidden md:flex space-x-6">
          <NuxtLink 
            to="/"
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center"
            :class="{ 'text-blue-600': route.path === '/' }"
          >
            <i class="pi pi-home mr-1"></i>
            Inicio
          </NuxtLink>
          <NuxtLink 
            to="/recomendacionesML"
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center"
            :class="{ 'text-blue-600': route.path === '/recomendacionesML' }"
          >
            <i class="pi pi-search mr-1"></i>
            Búsqueda Avanzada
          </NuxtLink>
          <NuxtLink 
            to="/chatRecommendations"
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center"
            :class="{ 'text-blue-600': route.path === '/chatRecommendations' }"
          >
            <i class="pi pi-comments mr-1"></i>
            Asistente Inteligente
          </NuxtLink>
          <NuxtLink 
            to="/propertySearch"
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center"
            :class="{ 'text-blue-600': route.path === '/propertySearch' }"
          >
            <i class="pi pi-dollar mr-1"></i>
            Predictor de Precios
          </NuxtLink>
        </div>

        <!-- Mobile menu button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4 space-y-2">
        <NuxtLink 
          to="/" 
          class="block py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium flex items-center"
          :class="{ 'bg-blue-50 text-blue-600': route.path === '/' }"
          @click="mobileMenuOpen = false"
        >
          <i class="pi pi-home mr-2"></i>
          Inicio
        </NuxtLink>
        <NuxtLink 
          to="/recomendacionesML"
          class="block py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium flex items-center"
          :class="{ 'bg-blue-50 text-blue-600': route.path === '/recomendacionesML' }"
          @click="mobileMenuOpen = false"
        >
          <i class="pi pi-search mr-2"></i>
          Búsqueda Avanzada
        </NuxtLink>
        <NuxtLink 
          to="/chatRecommendations"
          class="block py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium flex items-center"
          :class="{ 'bg-blue-50 text-blue-600': route.path === '/chatRecommendations' }"
          @click="mobileMenuOpen = false"
        >
          <i class="pi pi-comments mr-2"></i>
          Asistente Inteligente
        </NuxtLink>
        <NuxtLink 
          to="/propertySearch"
          class="block py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium flex items-center"
          :class="{ 'bg-blue-50 text-blue-600': route.path === '/propertySearch' }"
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
  '/recomendacionesML': 'Búsqueda Avanzada',
  '/chatRecommendations': 'Asistente Inteligente',
  '/propertySearch': 'Predictor de Precios'
}

const currentPageTitle = computed(() => {
  return pageTitles[route.path] || ''
})
</script>
