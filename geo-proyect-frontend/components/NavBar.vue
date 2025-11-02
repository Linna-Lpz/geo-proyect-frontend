<template>
  <nav class="bg-white shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2">
          <i class="pi pi-home text-2xl text-blue-600"></i>
          <span class="text-xl font-bold text-gray-800">GeoInmobiliaria</span>
        </NuxtLink>

        <!-- Navegación -->
        <div class="hidden md:flex space-x-6">
          <NuxtLink 
            to="/" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Inicio
          </NuxtLink>
          <NuxtLink 
            to="/recomendacionesML" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center"
          >
            <i class="pi pi-sparkles mr-2"></i>
            Recomendaciones ML
          </NuxtLink>
        </div>

        <!-- Mobile menu button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <i class="pi pi-bars text-xl"></i>
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
          to="/recomendacionesML" 
          class="flex items-center py-2 text-gray-700 hover:text-blue-600 font-medium"
          @click="mobileMenuOpen = false"
        >
          <i class="pi pi-sparkles mr-2"></i>
          Recomendaciones ML
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const mobileMenuOpen = ref(false);
</script>
