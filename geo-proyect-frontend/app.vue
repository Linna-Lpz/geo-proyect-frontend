<template>
  <div>
    <NuxtLoadingIndicator />
    <NavBar />
    <NuxtPage />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { watch } from 'vue';

const route = useRoute();

// Función para obtener el título de la página basado en la ruta
const getPageTitle = (path: string): string => {
  const titles: Record<string, string> = {
    '/': 'Inicio',
    '/chatRecommendations': 'Asistente Inteligente',
    '/propertySearch': 'Predictor de Precios',
    '/recomendacionesML': 'Búsqueda Avanzada ML'
  };
  
  return titles[path] || 'TerraMatch';
};

// Actualizar el título cuando cambie la ruta
watch(
  () => route.path,
  (newPath) => {
    const pageTitle = getPageTitle(newPath);
    useHead({
      title: `${pageTitle} - TerraMatch`,
      titleTemplate: '%s'
    });
  },
  { immediate: true }
);
</script>