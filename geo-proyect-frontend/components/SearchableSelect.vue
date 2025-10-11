<template>
  <div class="relative w-1/2">
    <div class="relative" ref="inputRef">
      <input :id="id" :name="id ? `searchable-select-input-${idKey}-${id}` : `searchable-select-input-${idKey}`"
        type="text" v-model="searchQuery" @focus="toggleDropdown" @blur="handleBlur"
        class="block w-full pl-3 pr-10 py-2 text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        :placeholder="placeholder" />

      <!-- erase button -->
      <Icon v-if="erasable && searchQuery" icon="mdi:close-circle"
        class="absolute right-2 top-1/2 transform -translate-x-full -translate-y-1/2 text-gray-500 hover:text-secondary select-none cursor-pointer"
        @mousedown.prevent="eraseOption" />

      <Icon icon="mdi:chevron-down"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 select-none cursor-pointer"
        :class="{ 'rotate-180': isOpen }" @mousedown.prevent="toggleIcon" />

    </div>

    <div v-if="isOpen" class="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
      ref="dropdownRef" :class="openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'">
      <!-- Opción por defecto -->
      <div v-if="defaultOptionText" @mousedown.prevent="selectOption(defaultOption)"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b">
        {{ defaultOption.display }}
      </div>

      <div v-for="option in filteredOptions" :key="option[idKey]" @mousedown.prevent="selectOption(option)"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100">
        {{ props.showId ? option[idKey] + ' - ' : '' }} {{ option[nameKey] }}
      </div>
      <div v-if="filteredOptions.length === 0 && searchQuery" class="px-3 py-2 text-gray-500">
        No hay resultados coincidentes.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue/dist/iconify.js';

const props = defineProps({
  id: {
    type: String,
    required: false
  },
  modelValue: {
    type: [String, Number, null],
    default: null
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  idKey: {
    type: String,
    default: 'id'
  },
  nameKey: {
    type: String,
    default: 'name'
  },
  defaultOptionText: {
    type: String,
    default: ''
  },
  showId: {
    type: Boolean,
    default: true
  },
  erasable: {
    type: Boolean,
    default: true
  }
})

const inputRef = ref(null)
const dropdownRef = ref(null)
const openUpwards = ref(false);

const toggleDropdown = async () => {
  if (!isOpen.value) {
    isOpen.value = true;
    await nextTick()
    checkUpward();
  }
  else {
    await closeDropdown();
  }
};

const closeDropdown = async () => {
  await setTimeout(() => {
    isOpen.value = false;
  }, 100);
};

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('') // Iniciar vacío

// **Default option object**
const defaultOption = computed(() => ({
  [props.idKey]: null,
  [props.nameKey]: '',
  display: props.defaultOptionText
}))

const toggleIcon = async () => {
  if (!isOpen.value) {
    await requestAnimationFrame(async () => {
      let input = null;
      if (props.id) {
        input = document.querySelector(`input[name=searchable-select-input-${props.idKey}-${props.id}]`)
      } else {
        input = document.querySelector(`input[name=searchable-select-input-${props.idKey}]`)
      }
      if (input) {
        input.focus()
        isOpen.value = true

        await nextTick()
        checkUpward();
      }
    })
  } else {
    await closeDropdown();
  }
}

const checkUpward = () => {
  const inputRect = inputRef.value.getBoundingClientRect();
  const dropdownHeight = dropdownRef.value?.offsetHeight || 0;
  const viewportHeight = window.innerHeight;

  openUpwards.value = inputRect.bottom + dropdownHeight > viewportHeight;
}

// **Filtrado de opciones**
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options

  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => {
    const idText = String(option[props.idKey]).toLowerCase()
    const nameText = String(option[props.nameKey]).toLowerCase()
    if (props.showId) {
      return idText.includes(query) || nameText.includes(query)
    }
    return nameText.includes(query)
  })
})

// **Sincronizar modelValue con el input**
watch(() => props.modelValue, (newVal) => {
  const selected = props.options.find(option => option[props.idKey] === newVal)

  if (props.showId) {
    searchQuery.value = selected
      ? `${selected[props.idKey]} - ${selected[props.nameKey]}`
      : ''
  } else {
    searchQuery.value = selected
      ? `${selected[props.nameKey]}`
      : ''
  }
}, { immediate: true })

// **Seleccionar opción**
const selectOption = (option) => {
  emit('update:modelValue', option[props.idKey])
  emit('change', option)

  // Si la opción seleccionada es la opción por defecto, mantener el input vacío
  if (props.showId) {
    searchQuery.value = option[props.idKey] ? `${option[props.idKey]} - ${option[props.nameKey]}` : ''
  } else {
    searchQuery.value = option[props.nameKey] ? `${option[props.nameKey]}` : ''
  }
  isOpen.value = false
  document.activeElement.blur()
}

const eraseOption = async () => {
  if (props.defaultOptionText) {
    selectOption('')
  } else {
    searchQuery.value = '';
  }

  await nextTick()
  checkUpward();
}

// **Manejar blur con delay**
const handleBlur = () => {
  setTimeout(() => {
    isOpen.value = false
    const selected = props.options.find(option => option[props.idKey] === props.modelValue)

    if (selected && searchQuery.value === '') {
      selectOption('')
      return
    }
    if (props.showId) {
      searchQuery.value = selected
        ? `${selected[props.idKey]} - ${selected[props.nameKey]}`
        : ''
    } else {
      searchQuery.value = selected
        ? `${selected[props.nameKey]}`
        : ''
    }
  }, 100)
};

// **Inicializar correctamente el input en mounted**
onMounted(() => {
  if (props.modelValue === null) {
    searchQuery.value = '' // Asegurarse de que inicie vacío
  }
})
</script>
