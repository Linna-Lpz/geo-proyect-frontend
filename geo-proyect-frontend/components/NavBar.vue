<template>
  <nav class="bg-white shadow-lg">
    <div class="px-4">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2">
          <span class="text-2xl"><i class="pi pi-home"></i></span>
          <span class="text-xl font-bold text-gray-800">TerraMatch</span>
        </NuxtLink>

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
