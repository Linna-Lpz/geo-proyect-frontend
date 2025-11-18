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

          <span class="text-lg font-semibold text-slate-900 dark:text-slate-100">TerraMatch</span>
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
            :to="navTo"
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center"
            @click="mobileMenuOpen = false"
          >
            <i :class="navIcon" class="mr-1"></i>
            {{ navLabel }}
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
      <div v-if="mobileMenuOpen" class="md:hidden pb-4">
        <NuxtLink 
          to="/" 
          class="block py-2 text-gray-700 hover:text-blue-600 font-medium"
          @click="mobileMenuOpen = false"
        >
          Inicio
        </NuxtLink>
        <NuxtLink 
          :to="navTo"
          class="block py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center"
          @click="mobileMenuOpen = false"
        >
          <i :class="navIcon" class="mr-1"></i>
          {{ navLabel }}
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

const isOnRecomendaciones = computed(() => {
  // Ajusta la comparación si tu ruta tiene nombre distinto
  return route.path === '/recomendacionesML' || route.name === 'recomendacionesML'
})

const navTo = computed(() => isOnRecomendaciones.value ? '/' : '/recomendacionesML')
const navLabel = computed(() => isOnRecomendaciones.value ? 'Volver al inicio' : 'Recomendaciones ML')
const navIcon = computed(() => isOnRecomendaciones.value ? 'pi pi-arrow-left' : 'pi pi-star')
</script>
