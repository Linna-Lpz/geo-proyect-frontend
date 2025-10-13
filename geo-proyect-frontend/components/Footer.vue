<template>
	<footer class="w-full bg-white/80 backdrop-blur-md dark:bg-gray-900/70 border-t">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col sm:flex-row items-center justify-between py-4 text-sm text-slate-600 dark:text-slate-300">
				<div class="flex items-center space-x-2">
					<span class="text-sm">© {{ year }} TerraMatch</span>
					<span class="hidden sm:inline">•</span>
					<NuxtLink to="/terms" class="ml-2 hover:underline">Términos</NuxtLink>
					<NuxtLink to="/privacy" class="ml-2 hover:underline">Privacidad</NuxtLink>
				</div>

				<div class="mt-3 sm:mt-0">
					<span class="text-xs text-slate-500 dark:text-slate-400">Hecho con ❤️ para búsqueda inmobiliaria local</span>
				</div>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const year = new Date().getFullYear()
</script>

<style scoped>
footer { z-index: 40; }
</style>

