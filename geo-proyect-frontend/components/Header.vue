<template>
  <header class="w-full bg-white/80 backdrop-blur-md dark:bg-gray-900/70 shadow-sm">
    <div class="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <!-- Right: small nav (optional) -->
        <nav class="hidden sm:flex items-center space-x-6">
          <NuxtLink to="/" class="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300">Inicio</NuxtLink>
          <NuxtLink to="/propertySearch" class="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300">Buscar</NuxtLink>
          <NuxtLink to="/about" class="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300">Acerca</NuxtLink>
        </nav>

        <!-- Mobile menu placeholder (keeps layout consistent) -->
        <div class="sm:hidden">
          <button aria-label="open menu" class="p-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Header is presentational only; no script logic needed yet.
</script>

<style scoped>
/* Small tweak so the header remains above map elements if used on pages with map full-screen */
header { z-index: 50; }
</style>
