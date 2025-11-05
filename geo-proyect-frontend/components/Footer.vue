<template>
  <footer class="bg-white border-t mt-12">
    <div class="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="text-sm text-gray-600">
        © {{ year }} TerraMatch. Todos los derechos reservados.
      </div>

      <div class="flex items-center space-x-4 text-sm">
        <NuxtLink to="/" class="text-gray-600 hover:text-blue-600">Inicio</NuxtLink>
        <NuxtLink to="/recomendacionesML" class="text-gray-600 hover:text-blue-600">Recomendaciones ML</NuxtLink>
        <a href="#" class="text-gray-600 hover:text-blue-600">Contacto</a>
      </div>

      <div class="flex items-center space-x-3 text-gray-600">
        <a href="mailto:info@terramatch.example" class="hover:text-blue-600" aria-label="Email">
          <i class="pi pi-envelope"></i>
        </a>
        <a href="https://github.com/" target="_blank" rel="noopener" class="hover:text-blue-600" aria-label="GitHub">
          <i class="pi pi-github"></i>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const year = new Date().getFullYear()
</script>

<style scoped>
footer { /* ligera sombra y fondo neutro */
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,250,0.95));
}
</style>