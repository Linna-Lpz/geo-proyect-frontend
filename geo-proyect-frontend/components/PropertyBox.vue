<template>
  <div class="flex flex-row col-span-3 border border-gray-300 rounded-2xl p-4 gap-4 bg-white">
    <!-- Imagen de la propiedad -->
    <img
        :src="propertyImage || '/assets/imgs/modelo-casa-1.png'"
        alt="Vivienda"
        class="h-full w-[100px] rounded bg-gray-100"
    >
    <!-- Detalles de la propiedad -->
    <div class="flex flex-col flex-1">
      <h2 class="text-xxl items-center">{{ propertyTittle }}</h2>
      <div class="flex flex-row items-center mt-1 mb-2">
        <i class="pi pi-map-marker"></i>
        <p class="ml-2 text-lg text-gray-700">{{ propertyAddress }}</p>
        <p class="ml-2 text-lg text-gray-700">{{ propertyCommune }}</p>
      </div>
      <div class="flex flex-row items-center justify-between">
        <p class="text-xl font-bold">$ {{ propertyPrice }} UF</p>
      </div>
    </div>
    <!-- Calificación y botón -->
    <div class="flex flex-col gap-12 items-end">
      <div
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1 w-fit"
          :class="ratingBadgeClass"
          aria-label="Evaluación de la propiedad"
      >
        <span class="text-sm font-semibold">{{ ratingText }}</span>
        <i class="pi pi-star-fill" :class="starColorClass"></i>
      </div>
      <button
          class="px-4 py-2 bg-gray-100 text-black font-semibold rounded-lg hover:bg-gray-200"
      >
        Ver Detalles
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'primeicons/primeicons.css'
import { computed } from 'vue'

const props = defineProps ({
  propertyImage: {
    type: String,
    required: true
  },
  propertyTittle: {
    type: String,
    required: true
  },
  propertyAddress: {
    type: String,
    required: true
  },
  propertyCommune: {
    type: String,
    required: true
  },
  propertyPrice: {
    type: String,
    required: true
  },
  propertyDescription: {
    type: String,
    required: true
  },
  propertyCalification: {
    type: Number,
    required: false,
    default: 0
  }
})

// Cálculos simples para mostrar la calificación como un badge legible y con color
const ratingValue = computed(() => {
  const n = Number(props.propertyCalification ?? 0)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(5, n))
})

const ratingText = computed(() => ratingValue.value.toFixed(1))

const ratingBadgeClass = computed(() => {
  const v = ratingValue.value
  if (v >= 4.5) return 'bg-green-50 text-green-700 border-green-200'
  if (v >= 3) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
  return 'bg-red-50 text-red-700 border-red-200'
})

const starColorClass = computed(() => {
  const v = ratingValue.value
  if (v >= 4.5) return 'text-green-500'
  if (v >= 3) return 'text-yellow-500'
  return 'text-red-500'
})
</script>
