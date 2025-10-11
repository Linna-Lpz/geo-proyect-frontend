<template>
  <fieldset class="mb-8 border p-4 rounded-lg">
    <legend class="text-xl font-semibold text-primary mb-2">
      Datos Personales
      <!-- Si ya se cargaron datos, mostramos el botón de toggle en la esquina derecha -->
      <span v-if="hasFetchedData" class="float-right">
        <button @click="toggleCollapse" type="button" class="px-6 text-sm text-secondary">
          {{ isExpanded ? 'Minimizar' : 'Expandir' }}
        </button>
      </span>
    </legend>

    <!-- Vista inicial: solo se muestra la barra de búsqueda (antes de cargar datos) -->
    <div v-if="!hasFetchedData">
      <div class="relative">
        <label class="block text-gray-700 font-medium mb-2" for="rut">
          RUT
        </label>
        <input
          v-model="personalData.rut"
          type="text"
          id="rut"
          placeholder="Ingrese su RUT"
          class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <button
          type="button"
          @click="handleSearch"
          class="absolute right-2 top-12 bg-secondary text-white px-2 py-1 rounded-lg hover:opacity-90 transition duration-300"
        >
          Cargar
        </button>
      </div>
    </div>

    <!-- Vista expandida: se muestran todos los campos -->
    <div v-else-if="hasFetchedData && isExpanded">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Campo RUT (con botón de carga para reintentar búsqueda si se requiere) -->
        <div class="relative">
          <label class="block text-gray-700 font-medium mb-2" for="rut">
            RUT
          </label>
          <input
            v-model="personalData.rut"
            type="text"
            id="rut"
            placeholder="Ingrese su RUT"
            class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="button"
            @click="handleSearch"
            class="absolute right-2 top-12 bg-secondary text-white px-2 py-1 rounded-lg hover:opacity-90 transition duration-300"
          >
            Cargar
          </button>
        </div>
        <!-- Nombre Completo -->
        <div>
          <label class="block text-gray-700 font-medium mb-2" for="nombreCompleto">
            Nombre Completo
          </label>
          <input
            v-model="personalData.nombreCompleto"
            type="text"
            id="nombreCompleto"
            placeholder="Nombre Completo"
            class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <!-- Select de Cuenta Corriente -->
        <div>
          <label class="block text-gray-700 font-medium mb-2" for="cuentaCorriente">
            Cuenta Corriente
          </label>
          <select
            v-model="personalData.cuentaCorriente"
            id="cuentaCorriente"
            class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option disabled value="">Seleccione una opción</option>
            <option
              v-for="option in cuentaCorrienteOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.text }}
            </option>
          </select>
        </div>
        <!-- Semestre y Año de Ingreso -->
        <div>
          <label class="block text-gray-700 font-medium mb-2" for="semestreIngreso">
            Semestre y Año de Ingreso
          </label>
          <input
            v-model="personalData.semestreIngreso"
            type="text"
            id="semestreIngreso"
            placeholder="Ej: 1 / 2022"
            class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <!-- Carrera -->
        <div>
          <label class="block text-gray-700 font-medium mb-2" for="carrera">
            Carrera
          </label>
          <input
            v-model="personalData.carrera"
            type="text"
            id="carrera"
            placeholder="Carrera"
            class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <!-- Última Matrícula -->
        <div>
          <label class="block text-gray-700 font-medium mb-2" for="ultimaMatricula">
            Última Matrícula
          </label>
          <input
            v-model="personalData.ultimaMatricula"
            type="text"
            id="ultimaMatricula"
            placeholder="Última matrícula"
            class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>

    <!-- Vista minimizada: solo se muestran RUT y Nombre -->
    <div v-else>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <p class="text-gray-700 font-medium">RUT: {{ personalData.rut }}</p>
          <p class="text-gray-700 font-medium">Nombre: {{ personalData.nombreCompleto }}</p>
        </div>
        <button @click="toggleCollapse" type="button" class="text-secondary">
          Expandir
        </button>
      </div>
    </div>
  </fieldset>
</template>

<script setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'

// Recibimos la data y las opciones desde el componente padre.
const props = defineProps({
  personalData: {
    type: Object,
    required: true
  },
  cuentaCorrienteOptions: {
    type: Array,
    default: () => []
  }
})

// Emitimos un evento cuando se hace clic en "Cargar" para que el padre ejecute la función de carga de datos.
const emits = defineEmits(['fetch-data'])

// Estados internos para controlar la vista del componente
const isExpanded = ref(false)       // Controla si se muestran todos los campos o solo la cabecera
const hasFetchedData = ref(false)     // Indica si ya se han cargado los datos del estudiante

const handleSearch = () => {
  // Emitir el evento para cargar datos
  emits('fetch-data')
  // Actualizamos los estados para mostrar la información completa
  hasFetchedData.value = true
  isExpanded.value = true
}

const toggleCollapse = () => {
  // Alternar entre la vista expandida y la minimizada
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
/* Agrega estilos adicionales si lo requieres */
</style>
