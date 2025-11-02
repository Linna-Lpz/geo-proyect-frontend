<template>
  <div class="importance-slider mb-6">
    <div class="flex justify-between items-start mb-2">
      <label class="text-sm font-medium text-gray-700">
        {{ label }}
      </label>
      <span
        :class="[
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
          getColorClass(localValue)
        ]"
      >
        {{ getLabel(localValue) }}
      </span>
    </div>
    
    <div class="slider-container">
      <input
        type="range"
        v-model.number="localValue"
        min="-10"
        max="10"
        step="1"
        class="w-full slider-range"
        @input="handleInput"
      />
      
      <div class="flex justify-between text-xs text-gray-500 mt-2 px-1">
        <span class="text-red-600 font-medium">Evitar<br/>(-10)</span>
        <span class="text-gray-600 font-medium">Neutro<br/>(0)</span>
        <span class="text-green-600 font-medium">Muy Importante<br/>(+10)</span>
      </div>
    </div>
    
    <p v-if="helpText" class="text-xs text-gray-500 mt-2 italic flex items-center gap-1">
      <i class="pi pi-info-circle"></i>
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getImportanciaLabel, getImportanciaColor } from '~/services/recommendationMLService'

const props = defineProps<{
  modelValue: number
  label: string
  helpText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const localValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

const handleInput = () => {
  emit('update:modelValue', localValue.value)
}

const getColorClass = (value: number): string => {
  return getImportanciaColor(value)
}

const getLabel = (value: number): string => {
  return getImportanciaLabel(value)
}
</script>

<style scoped>
.slider-range {
  -webkit-appearance: none;
  appearance: none;
  height: 10px;
  background: linear-gradient(
    to right,
    #dc2626 0%,      /* red-600: -10 */
    #f97316 20%,     /* orange-500: -5 */
    #9ca3af 50%,     /* gray-400: 0 */
    #3b82f6 70%,     /* blue-500: +5 */
    #10b981 100%     /* green-500: +10 */
  );
  border-radius: 5px;
  outline: none;
  transition: opacity 0.2s;
}

.slider-range:hover {
  opacity: 0.9;
}

.slider-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: white;
  border: 3px solid #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.2s;
}

.slider-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0,0,0,0.4);
}

.slider-range::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: white;
  border: 3px solid #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.2s;
}

.slider-range::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0,0,0,0.4);
}
</style>
