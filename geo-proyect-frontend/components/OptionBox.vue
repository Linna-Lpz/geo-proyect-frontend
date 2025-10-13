<template>
  <div class="relative text-left">
    <button
        @click="isOpen = !isOpen"
        class="p-3 mb-[15px] text-black rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 transition-colors"
    >
      <i :class="optionIcon" class="mr-2"></i>
      {{ optionLabel }}
      <i class="pi pi-chevron-down ml-2"></i>
    </button>
    <div
        v-if="isOpen"
        class="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
    >
      <ul>
        <li
            v-for="(option, idx) in options"
            :key="idx"
            @click="selectOption(option)"
            class="px-4 py-2 text-black hover:bg-gray-100 cursor-pointer"
        >
          {{ option.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  options: { text: string }[],
  optionLabel: string,
  optionIcon: string
}>()


const isOpen = ref(false)

function selectOption(option: { text: string }) {
  isOpen.value = false
  // Aquí puedes emitir un evento o manejar la opción seleccionada
}
</script>
