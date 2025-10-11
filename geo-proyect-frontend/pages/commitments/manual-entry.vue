<template>
  <div class="flex justify-center p-6 overflow-hidden">
    <div class="bg-white p-8 rounded-2xl shadow-hard w-full max-w-auto overflow-auto">
      <h2 class="text-2xl font-bold mb-6 text-center text-tertiary">
        Ingreso Manual de Compromiso
      </h2>
      <form @submit.prevent="handleSubmit">

        <!-- Componente Datos Personales -->
        <PersonalData 
          :personalData="form.personalData" 
          :cuentaCorrienteOptions="cuentaCorrienteOptions"
          @fetch-data="fetchPersonalData" 
        />

        <!-- Características del Compromiso -->
        <fieldset class="mb-8 border p-4 rounded-lg">
          <legend class="text-xl font-semibold text-primary mb-2">
            Características del Compromiso
          </legend>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tipo de compromiso -->
            <div>
              <label class="block text-gray-700 font-medium mb-2" for="tipoCompromiso">
                Tipo de Compromiso
              </label>
              <input v-model="form.compromiso.tipo" type="text" id="tipoCompromiso" placeholder="Tipo de compromiso"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                required />
            </div>
            <!-- Fecha (DD/MM/AAAA) -->
            <div>
              <label class="block text-gray-700 font-medium mb-2" for="fecha">
                Fecha (DD/MM/AAAA)
              </label>
              <input v-model="form.compromiso.fecha" type="date" id="fecha" placeholder="DD/MM/AAAA"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                required />
            </div>
            <!-- Año -->
            <div>
              <label class="block text-gray-700 font-medium mb-2" for="anioCompromiso">
                Año
              </label>
              <input v-model="form.compromiso.anio" type="number" id="anioCompromiso" placeholder="Año"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                required />
            </div>
            <!-- Semestre -->
            <div>
              <label class="block text-gray-700 font-medium mb-2" for="semestreCompromiso">
                Semestre
              </label>
              <input v-model="form.compromiso.semestre" type="number" id="semestreCompromiso" placeholder="Semestre"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                required />
            </div>
            <!-- Select de Documento Asociado -->
            <div>
              <label class="block text-gray-700 font-medium mb-2" for="documentoAsociado">
                Documento Asociado
              </label>
              <select v-model="form.compromiso.documentoAsociado" id="documentoAsociado"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                <option disabled value="">Seleccione una opción</option>
                <option v-for="option in documentoAsociadoOptions" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
            <!-- Número -->
            <div>
              <label class="block text-gray-700 font-medium mb-2" for="numero">
                Número
              </label>
              <input v-model="form.compromiso.numero" type="text" id="numero" placeholder="Número"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <!-- Select de Tipo de Moneda -->
            <div>
              <label class="block text-gray-700 font-medium mb-2" for="tipoMoneda">
                Tipo de Moneda
              </label>
              <select v-model="form.compromiso.tipoMoneda" id="tipoMoneda"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                <option disabled value="">Seleccione una opción</option>
                <option v-for="option in tipoMonedaOptions" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
            <!-- Total Compromiso -->
            <div>
              <label class="block text-gray-700 font-medium mb-2" for="totalCompromiso">
                Total Compromiso
              </label>
              <input v-model="form.compromiso.total" type="number" id="totalCompromiso" placeholder="Total compromiso"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                required />
            </div>
            <!-- Comentario (ocupa dos columnas en md) -->
            <div class="md:col-span-2">
              <label class="block text-gray-700 font-medium mb-2" for="comentario">
                Comentario
              </label>
              <textarea v-model="form.compromiso.comentario" id="comentario" placeholder="Agrega un comentario"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"></textarea>
            </div>
            <!-- Select de Documento de Valor Asociado -->
            <div>
              <label class="block text-gray-700 font-medium mb-2" for="documentoValor">
                Documento de valor asociado
              </label>
              <select v-model="form.compromiso.documentoValor" id="documentoValor"
                class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                <option disabled value="">Seleccione una opción</option>
                <option v-for="option in documentoValorOptions" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
          </div>
        </fieldset>

        <!-- Cuotas -->
        <fieldset class="mb-8 border p-4 rounded-lg">
          <legend class="text-xl font-semibold text-primary mb-2">Cuotas</legend>
          <div>
            <label class="block text-gray-700 font-medium mb-2" for="cantidadCuotas">
              Cantidad de cuotas
            </label>
            <input v-model="form.cuotas.cantidad" type="number" id="cantidadCuotas" placeholder="Cantidad de cuotas"
              class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
        </fieldset>

        <!-- Botón de Envío -->
        <div class="text-center">
          <button type="submit"
            class="bg-primary text-white py-2 px-6 rounded-xl hover:opacity-90 transition duration-300">
            Enviar Formulario
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import PersonalData from '~/components/PersonalData.vue' // Ajusta la ruta según tu estructura

// Estado reactivo del formulario
const form = reactive({
  personalData: {
    rut: '',
    nombreCompleto: '',
    cuentaCorriente: '',
    semestreIngreso: '',
    carrera: '',
    ultimaMatricula: ''
  },
  compromiso: {
    tipo: '',
    fecha: '',
    anio: '',
    semestre: '',
    documentoAsociado: '',
    numero: '',
    tipoMoneda: '',
    total: '',
    comentario: '',
    documentoValor: ''
  },
  cuotas: {
    cantidad: ''
  }
});

// Opciones que se cargarán desde el backend (simuladas)
const cuentaCorrienteOptions = ref([
  { value: 'cc1', text: 'Cuenta Corriente 1' },
  { value: 'cc2', text: 'Cuenta Corriente 2' }
]);

const documentoAsociadoOptions = ref([
  { value: 'doc1', text: 'Documento 1' },
  { value: 'doc2', text: 'Documento 2' }
]);

const tipoMonedaOptions = ref([
  { value: 'uf', text: 'UF' },
  { value: 'utm', text: 'UTM' },
  { value: 'clp', text: 'CLP' }
]);

const documentoValorOptions = ref([
  { value: 'docVal1', text: 'Documento Valor 1' },
  { value: 'docVal2', text: 'Documento Valor 2' }
]);

// Función para simular la carga de datos personales en base al RUT
const fetchPersonalData = () => {
  // En lugar de reasignar todo el objeto (lo que puede romper la reactividad),
  // se actualizan las propiedades individualmente:
  form.personalData.nombreCompleto = 'Juan Pérez'
  form.personalData.cuentaCorriente = 'cc1'
  form.personalData.semestreIngreso = '1 / 2022'
  form.personalData.carrera = 'Ingeniería Civil'
  form.personalData.ultimaMatricula = 'Matrícula 2023'
  alert('Datos personales cargados')
}

// Función para manejar el envío del formulario
const handleSubmit = () => {
  console.log('Formulario enviado:', form)
  // Aquí enviarías los datos al backend
  alert('Formulario enviado con éxito')
}
</script>

<style scoped></style>