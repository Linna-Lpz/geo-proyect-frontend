<template>
  <div class="flex flex-row col-span-3 border border-gray-300 rounded-2xl p-4 gap-4 bg-white">
    <img
        :src="propertyImage || '/assets/imgs/modelo-casa-1.png'"
        alt="Vivienda"
        class="h-[100px] w-[100px] rounded bg-gray-100"
    >
    <div class="flex flex-col flex-1 justify-between">
      <h2 class="text-xxl">{{ propertyTittle }}</h2>
      <div class="flex flex-row items-center mt-1 mb-2">
        <i class="pi pi-map-marker"></i>
        <p class="ml-2 text-lg text-gray-700">{{ propertyAddress }}</p>
        <p class="ml-2 text-lg text-gray-700">{{ propertyCommune }}</p>
      </div>
      <div class="flex flex-row items-center justify-between">
        <p class="text-xl font-bold">$ {{ propertyPrice }} UF</p>
        <button
            class="px-4 py-2 bg-gray-100 text-black font-semibold rounded-lg hover:bg-gray-200"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'primeicons/primeicons.css'

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
})
</script>
