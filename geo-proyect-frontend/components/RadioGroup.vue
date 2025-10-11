<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  modelValue: String,
  options: Array, // [{ label: 'All', value: 'all', color: 'blue' }]
  // available Colors = blue, green, red, pink, primary, secondary, tertiary
  color: {
    type: String,
    default: "pink",
  },
  textSize: {
    type: String,
    default: "base",
  },
  vertical: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(["update:modelValue", "change"]);

const updateValue = (value) => {
  emit("update:modelValue", value);
  emit("change", value);
};

const computedOptions = computed(() =>
  props.options.map((option) => ({
    ...option,
    color: option.color || props.color,
  }))
);
</script>

<template>
  <div class="flex flex-wrap justify-evenly gap-x-2"
    :class="{
      'flex-col gap-y-2': vertical,
      'flex-row gap-x-2': !vertical,
    }">
    <label v-for="option in computedOptions" :key="option.value" class="flex items-center cursor-pointer">
      <input type="radio" :value="option.value" :checked="modelValue === option.value" class="hidden peer"
        @change="updateValue(option.value)" />
      <div class="w-3.5 h-3.5 border rounded-full flex items-center justify-center" :class="{
        'border-blue-400 peer-checked:border-blue-500  ': option.color === 'blue',
        'border-green-400 peer-checked:border-green-500  ': option.color === 'green',
        'border-red-400 peer-checked:border-red-500  ': option.color === 'red',
        'border-pink-400 peer-checked:border-pink-500  ': option.color === 'pink',
        'border-primary peer-checked:border-primary': option.color === 'primary',
        'border-secondary peer-checked:border-secondary': option.color === 'secondary',
        'border-tertiary peer-checked:border-tertiary': option.color === 'tertiary',
      }">
        <div v-if="modelValue === option.value" class="w-[8px] h-[8px] rounded-full peer-checked:block" :class="{
          'bg-blue-500': option.color === 'blue',
          'bg-green-500': option.color === 'green',
          'bg-red-500': option.color === 'red',
          'bg-pink-500': option.color === 'pink',
          'bg-primary': option.color === 'primary',
          'bg-secondary': option.color === 'secondary',
          'bg-tertiary': option.color === 'tertiary',
        }"></div>
      </div>
      <span class="ml-2 text-tertiary" :class="`text-${textSize}`">
        {{ option.label }}
      </span>
    </label>
  </div>
</template>
