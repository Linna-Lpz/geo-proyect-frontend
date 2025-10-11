<script setup>
import { ref, defineProps, defineEmits, computed, onMounted, onUnmounted, nextTick } from "vue";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Icon } from "@iconify/vue";
const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: "Selecionna una fecha",
  },
  format: {
    type: String,
    default: "dd MMMM yyyy",
  },
  color: {
    type: String,
    default: "red", // Default color
    validator(value) {
      return ["blue", "green", "red", "pink", "primary", "secondary", "tertiary"].includes(value);
    },
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const isSelectingMonth = ref(false);
const isSelectingYear = ref(false);
const inputRef = ref(null);
const dropdownRef = ref(null);
const openUpwards = ref(false);

const yearListRef = ref(null);

const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null);
const today = new Date();
const currentMonth = ref(selectedDate.value ? selectedDate.value.getMonth() : today.getMonth());
const currentYear = ref(selectedDate.value ? selectedDate.value.getFullYear() : today.getFullYear());

const datePickerRef = ref(null);

const handleClickOutside = (event) => {
  if (datePickerRef.value && datePickerRef.value.contains(event.target)) {
    return;
  }
  dropdownRef.value?.classList.add('fade-out')

  setTimeout(() => {
    isOpen.value = false;
    isSelectingYear.value = false;
    isSelectingMonth.value = false;

    dropdownRef.value?.classList.remove('fade-out');
  }, 200);
};


onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown();
    }
  });
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Computa la fecha formateada
const formattedDate = computed(() =>
  selectedDate.value ? format(selectedDate.value, props.format, { locale: es }) : ""
);

// Genera los días del mes
const getDaysInMonth = (year, month) => {
  return new Array(31)
    .fill(null)
    .map((_, i) => new Date(year, month, i + 1))
    .filter((date) => date.getMonth() === month);
};

const days = computed(() => getDaysInMonth(currentYear.value, currentMonth.value));

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

// Lista de meses y años
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 150 }, (_, i) => currentYear - 100 + i);
});

// Seleccionar fecha
const selectDate = (date) => {
  selectedDate.value = date;
  emit("update:modelValue", format(date, "yyyy-MM-dd"));
  emit("change", format(date, "yyyy-MM-dd"));
  closeDropdown();
};

// Seleccionar mes
const selectMonth = (monthIndex) => {
  currentMonth.value = monthIndex;
  isSelectingMonth.value = false;
};

// Seleccionar año
const selectYear = (year) => {
  currentYear.value = year;
  isSelectingYear.value = false;
};

// Cerrar dropdown
const closeDropdown = () => {
  dropdownRef.value?.classList.add('fade-out')
  setTimeout(() => {
    isOpen.value = false;
    isSelectingYear.value = false;
    isSelectingMonth.value = false;

    dropdownRef.value?.classList.remove('fade-out');
  }, 200);
};

// Detecta si debe abrir hacia arriba o abajo
const toggleDropdown = async () => {
  if (!isOpen.value) {
    isOpen.value = true;
    await nextTick();
    const inputRect = inputRef.value.getBoundingClientRect();
    const dropdownHeight = dropdownRef.value?.offsetHeight || 0;
    const viewportHeight = window.innerHeight;

    openUpwards.value = inputRect.bottom + (dropdownHeight + 50) > viewportHeight;
  }
  else {
    closeDropdown();
  }
};

// Función para desplazar la lista de años al seleccionado
const scrollToSelectedYear = () => {
  nextTick(() => {
    const selectedYearElement = yearListRef.value?.querySelector(".selected-year");
    selectedYearElement?.scrollIntoView({ block: "center", behavior: "instant" });
  });
};

// ⬇Se ejecuta cuando se abre la selección de años
const toggleYearSelection = () => {
  isSelectingYear.value = !isSelectingYear.value;
  if (isSelectingYear.value) {
    scrollToSelectedYear();
  }
};

const colorRing = computed(() => {
  const colors = {
    blue: "!ring-blue-500",
    green: "!ring-green-500",
    red: "!ring-red-500",
    pink: "!ring-pink-500",
    primary: "!ring-primary",
    secondary: "!ring-secondary",
    tertiary: "!ring-tertiary",
  };
  return colors[props.color] || colors.primary;
});

const colorButton = computed(() => {
  const colors = {
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    red: "bg-red-500 text-white",
    pink: "bg-pink-500 text-white",
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    tertiary: "bg-tertiary text-white",
  };
  return colors[props.color] || colors.primary;
});

const colorButtonHoverLight = computed(() => {
  const colors = {
    blue: "hover:bg-blue-200",
    green: "hover:bg-green-200",
    red: "hover:bg-red-200",
    pink: "hover:bg-pink-200",
    primary: "hover:bg-primary hover:bg-opacity-20",
    secondary: "hover:bg-secondary  hover:bg-opacity-20",
    tertiary: "hover:bg-tertiary  hover:bg-opacity-20",
  };
  return colors[props.color] || colors.primary;
});

const colorAnchor = computed(() => {
  const colors = {
    blue: "text-gray-600 hover:text-blue-500",
    green: "text-gray-600 hover:text-green-500",
    red: "text-gray-600 hover:text-red-500",
    pink: "text-gray-600 hover:text-pink-500",
    primary: "text-gray-600 hover:text-primary",
    secondary: "text-gray-600 hover:text-secondary",
    tertiary: "text-gray-600 hover:text-tertiary",
  };
  return colors[props.color] || colors.primary;
});

watch(() => props.modelValue, (newValue) => {  
  if (newValue) {
    const [year, month, day] = newValue.split('-').map(Number);
    selectedDate.value = new Date(year, month - 1, day);
    currentMonth.value = selectedDate.value.getMonth();
    currentYear.value = selectedDate.value.getFullYear();
  } else {
    selectedDate.value = null;
  }
});

</script>

<template>
  <div class="relative w-64" ref="datePickerRef">
    <!-- Input del DatePicker -->
    <input id="datePicker" type="text" ref="inputRef"
      :class="['w-full text-end px-8 py-2 border rounded-md select-none cursor-pointer focus:outline-none focus:ring-2', colorRing]"
      :value="formattedDate" :placeholder="placeholder" readonly @click="toggleDropdown" />
    <Icon @click="toggleDropdown" icon="mdi:calendar"
      class="absolute right-2 top-1/2 transform -translate-y-1/2 text-tertiary select-none cursor-pointer" />

    <!-- Dropdown del DatePicker -->
    <div id="datePicker" v-if="isOpen" class="absolute w-full bg-white border rounded-md shadow-lg p-3 z-50"
      :class="openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'" ref="dropdownRef">
      <!-- Selector de Mes y Año -->
      <div class="flex justify-between px-2 items-center mb-2">
        <button type="button" :class="[colorAnchor]" @click="prevMonth">‹</button>

        <div class="flex space-x-2 -mb-1">
          <button type="button" :class="colorAnchor" class="text-tertiary font-medium cursor-pointer"
            @click="isSelectingMonth = !isSelectingMonth; isSelectingYear = false">
            {{ months[currentMonth] }}
          </button>
          <button type="button" :class="colorAnchor" class="text-tertiary font-medium cursor-pointer"
            @click="toggleYearSelection(); isSelectingMonth = false">
            {{ currentYear }}
          </button>
        </div>

        <button type="button" :class="colorAnchor" @click="nextMonth">›</button>
      </div>

      <!-- Lista de meses -->
      <div v-show="isSelectingMonth" class="grid grid-cols-3 gap-1 mt-2 place-items-center">
        <button v-for="(month, index) in months" :key="index" type="button"
          class="text-center px-4 py-2 cursor-pointer rounded-md"
          :class="[colorButtonHoverLight, { [colorButton]: currentMonth === index }]" @click="selectMonth(index)">
          {{ month.substring(0, 3) }}
        </button>
      </div>

      <div v-show="isSelectingYear" ref="yearListRef"
        class="grid place-items-center grid-cols-3 gap-1 mt-2 h-40 overflow-y-auto p-2">
        <button v-for="year in years" :key="year" type="button"
          class="text-center px-4 py-2 cursor-pointer rounded-md hover:bg-blue-100"
          :class="[colorButtonHoverLight, { [colorButton]: currentYear === year }, { 'selected-year': currentYear === year }]"
          @click="selectYear(year)">
          {{ year }}
        </button>
      </div>

      <!-- Días del mes -->
      <div v-if="!isSelectingMonth && !isSelectingYear"
        class="grid grid-cols-7 grid-rows-5 gap-1 mt-2 justify-items-center">
        <button v-for="day in days" :key="day" type="button"
          class="text-center py-1 px-2 w-full cursor-pointer flex justify-center rounded-md " :class="[colorButtonHoverLight, {
            [colorButton]: formattedDate === format(day, props.format, { locale: es }),
            'text-gray-500': day.getMonth() !== currentMonth,
          }]" @click="selectDate(day)">
          {{ day.getDate() }}
        </button>
      </div>
    </div>
  </div>
</template>
