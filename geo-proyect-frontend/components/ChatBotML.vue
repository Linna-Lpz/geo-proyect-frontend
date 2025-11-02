<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Chat Messages Area -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'flex',
          message.sender === 'bot' ? 'justify-start' : 'justify-end'
        ]"
      >
        <div
          :class="[
            'max-w-[80%] rounded-lg p-4 shadow-sm',
            message.sender === 'bot'
              ? 'bg-white border border-gray-200'
              : 'bg-blue-500 text-white'
          ]"
        >
          <!-- Avatar -->
          <div class="flex items-start gap-3">
            <div
              v-if="message.sender === 'bot'"
              class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
            >
              <HomeIcon class="w-5 h-5 text-blue-600" />
            </div>
            
            <div class="flex-1">
              <!-- Message Text -->
              <div
                v-if="message.text"
                class="text-sm leading-relaxed"
                v-html="message.text"
              ></div>

              <!-- Options (Buttons) -->
              <div
                v-if="message.options && message.options.length > 0"
                class="mt-3 space-y-2"
              >
                <button
                  v-for="(option, optIndex) in message.options"
                  :key="optIndex"
                  @click="handleOptionClick(option)"
                  class="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium text-blue-700"
                  v-html="option.label"
                ></button>
              </div>

              <!-- Multi-Select Options (Checkboxes) -->
              <div
                v-if="message.multiSelect && message.multiSelectOptions"
                class="mt-3 space-y-2"
              >
                <div
                  v-for="(option, optIndex) in message.multiSelectOptions"
                  :key="optIndex"
                  class="flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    :id="`multi-${index}-${optIndex}`"
                    :value="option.value"
                    v-model="tempMultiSelectValues"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label
                    :for="`multi-${index}-${optIndex}`"
                    class="flex-1 text-sm font-medium text-blue-700 cursor-pointer"
                    v-html="option.label"
                  ></label>
                </div>
                <button
                  @click="submitMultiSelect(message.multiSelectAction)"
                  class="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  :class="{ 'opacity-70': tempMultiSelectValues.length === 0 }"
                >
                  {{ tempMultiSelectValues.length === 0 ? 'Continuar (sin selección)' : `Continuar (${tempMultiSelectValues.length} seleccionados)` }}
                </button>
              </div>

              <!-- Slider de Importancia -->
              <div v-if="message.requiresSlider" class="mt-3">
                <ImportanceSlider
                  v-model="currentSliderValue"
                  :label="message.sliderLabel || 'Importancia'"
                  :help-text="message.sliderHelp"
                />
                <button
                  @click="submitSlider(message.sliderAction)"
                  class="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Continuar →
                </button>
              </div>
            </div>

            <div
              v-if="message.sender === 'user'"
              class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm"
            >
              <UserIcon class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions (Bottom) -->
    <div v-if="showQuickActions" class="p-4 bg-white border-t border-gray-200">
      <div class="flex gap-2 flex-wrap">
        <button
          @click="resetChat"
          class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowPathIcon class="w-4 h-4" />
          Reiniciar
        </button>
        <button
          v-if="preferencias.precio_min"
          @click="verResumen"
          class="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <DocumentTextIcon class="w-4 h-4" />
          Ver Resumen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import type { PreferenciasDetalladasML } from '~/services/recommendationMLService';
import {
  HomeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOffice2Icon,
  TruckIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon,
  SpeakerWaveIcon,
} from '@heroicons/vue/24/outline';

interface ChatMessage {
  sender: 'bot' | 'user';
  text?: string;
  options?: { label: string; value: any; action: string }[];
  multiSelect?: boolean;
  multiSelectOptions?: { label: string; value: string }[];
  multiSelectAction?: string;
  requiresSlider?: boolean;
  sliderLabel?: string;
  sliderHelp?: string;
  sliderAction?: string;
}

// Interfaz temporal para recolectar datos del usuario
interface PreferenciasTemp {
  precio_min?: number;
  precio_max?: number;
  dormitorios_min?: number;
  banos_min?: number;
  tipo_inmueble_preferido?: string;
  comunas_preferidas?: string[];
  prioridad_precio: number;
  prioridad_ubicacion: number;
  prioridad_transporte: number;
  prioridad_educacion: number;
  prioridad_salud: number;
  prioridad_areas_verdes: number;
  prioridad_tamano: number;
  requiere_estacionamiento?: boolean;
  evitar_colegios?: boolean;
  evitar_hospitales?: boolean;
  evitar_metro?: boolean;
  ruido_ambiente?: 'bajo' | 'medio' | 'alto';
}

const emit = defineEmits<{
  (e: 'preferenciasCompletas', preferencias: PreferenciasDetalladasML): void;
}>();

const messages = ref<ChatMessage[]>([]);
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement>();
const showQuickActions = ref(true);

// Multi-select temporal state
const tempMultiSelectValues = ref<string[]>([]);
const temasSeleccionados = ref<string[]>([]);

// Slider temporal state
const currentSliderValue = ref(0);

const preferencias = ref<Partial<PreferenciasTemp>>({
  prioridad_precio: 5,
  prioridad_ubicacion: 5,
  prioridad_transporte: 0,
  prioridad_educacion: 0,
  prioridad_salud: 0,
  prioridad_areas_verdes: 0,
  prioridad_tamano: 5,
  requiere_estacionamiento: false,
  evitar_colegios: false,
  evitar_hospitales: false,
  evitar_metro: false,
});

let indiceTemaActual = 0;

onMounted(() => {
  iniciarConversacion();
});

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const addMessage = (message: ChatMessage) => {
  messages.value.push(message);
  scrollToBottom();
};

const addUserMessage = (text: string) => {
  addMessage({
    sender: 'user',
    text,
  });
};

const iniciarConversacion = () => {
  addMessage({
    sender: 'bot',
    text: `
      <div class="space-y-2">
        <p class="font-semibold text-lg">¡Hola! 👋 Soy tu asistente inmobiliario</p>
        <p>Te ayudaré a encontrar la propiedad perfecta según tus necesidades.</p>
        <p class="text-gray-600 text-sm">Primero te haré algunas preguntas básicas, y luego <strong>TÚ decides</strong> qué otros aspectos quieres especificar.</p>
      </div>
    `,
    options: [
      { label: '🚀 Comenzar búsqueda', value: 'start', action: 'start' },
    ],
  });
};

const handleOptionClick = (option: { label: string; value: any; action: string }) => {
  addUserMessage(option.label);
  
  switch (option.action) {
    case 'start':
      preguntarPresupuesto();
      break;
    case 'buscar':
      ejecutarBusqueda();
      break;
    case 'reiniciar':
      resetChat();
      break;
    case 'presupuesto':
      handlePresupuestoResponse(option.value);
      break;
    case 'dormitorios':
      handleDormitoriosResponse(option.value);
      break;
    case 'tipo_inmueble':
      handleTipoInmuebleResponse(option.value);
      break;
    case 'prioridad_transporte':
      handlePrioridadTransporte(option.value);
      break;
    case 'prioridad_educacion':
      handlePrioridadEducacion(option.value);
      break;
    case 'prioridad_salud':
      handlePrioridadSalud(option.value);
      break;
    case 'prioridad_areas_verdes':
      handlePrioridadAreasVerdes(option.value);
      break;
    case 'edificio_estacionamiento':
      handleEdificioEstacionamiento(option.value);
      break;
    case 'ambiente_ruido':
      handleAmbienteRuido(option.value);
      break;
  }
};

const submitMultiSelect = (action?: string) => {
  if (!action) return;
  
  if (action === 'ubicacion') {
    // Caso especial: ubicación
    const ubicacionSeleccionada = [...tempMultiSelectValues.value];
    tempMultiSelectValues.value = [];
    
    if (ubicacionSeleccionada.length > 0) {
      preferencias.value.comunas_preferidas = ubicacionSeleccionada;
      addUserMessage(`Seleccioné: ${ubicacionSeleccionada.join(', ')}`);
    } else {
      addUserMessage('Sin preferencia de comuna');
    }
    
    preguntarTemasOpcionales();
    return;
  }
  
  if (action === 'temas_opcionales') {
    // Caso especial: temas opcionales
    temasSeleccionados.value = [...tempMultiSelectValues.value];
    
    if (temasSeleccionados.value.length > 0) {
      const labels = temasSeleccionados.value.map(val => {
        const labelMap: Record<string, string> = {
          'transporte': 'Transporte',
          'educacion': 'Educación',
          'salud': 'Salud',
          'areas_verdes': 'Áreas Verdes',
          'edificio': 'Características del Edificio',
          'ambiente': 'Ambiente/Ruido',
        };
        return labelMap[val] || val;
      });
      addUserMessage(`Seleccioné: ${labels.join(', ')}`);
    } else {
      addUserMessage('Sin preferencias adicionales');
    }
    
    tempMultiSelectValues.value = [];
    preguntarTemasSeleccionados();
    return;
  }
};

const submitSlider = (action?: string) => {
  if (!action) return;
  
  const value = currentSliderValue.value;
  
  // Mostrar mensaje del usuario con el valor seleccionado
  let mensaje = '';
  if (value > 0) {
    mensaje = `Importancia: +${value} (${getImportanceLabel(value)})`;
  } else if (value < 0) {
    mensaje = `Preferencia: ${value} (${getImportanceLabel(value)})`;
  } else {
    mensaje = 'Neutral (0)';
  }
  addUserMessage(mensaje);
  
  // Ejecutar acción según el tipo
  switch (action) {
    case 'prioridad_transporte':
      handlePrioridadTransporte(value);
      break;
    case 'prioridad_educacion':
      handlePrioridadEducacion(value);
      break;
    case 'prioridad_salud':
      handlePrioridadSalud(value);
      break;
    case 'prioridad_areas_verdes':
      handlePrioridadAreasVerdes(value);
      break;
  }
  
  // Resetear slider
  currentSliderValue.value = 0;
};

// Helper para etiquetas de importancia
const getImportanceLabel = (value: number): string => {
  if (value <= -8) return 'Evitar completamente';
  if (value <= -5) return 'Preferir lejos';
  if (value <= -2) return 'Algo lejos';
  if (value === 0) return 'Neutral';
  if (value <= 3) return 'Poco importante';
  if (value <= 6) return 'Moderado';
  if (value <= 8) return 'Importante';
  return 'Muy importante';
};

// ============================================================================
// FASE 1: PREGUNTAS OBLIGATORIAS
// ============================================================================

const preguntarPresupuesto = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold flex items-center gap-2"><span class="inline-flex items-center justify-center w-5 h-5"><svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>¿Cuál es tu presupuesto?</p><p class="text-sm text-gray-600">Pregunta obligatoria (1/4)</p>',
    options: [
      { label: 'Hasta $300.000', value: { min: 0, max: 300000 }, action: 'presupuesto' },
      { label: '$300.000 - $500.000', value: { min: 300000, max: 500000 }, action: 'presupuesto' },
      { label: '$500.000 - $800.000', value: { min: 500000, max: 800000 }, action: 'presupuesto' },
      { label: 'Más de $800.000', value: { min: 800000, max: 2000000 }, action: 'presupuesto' },
    ],
  });
};

const handlePresupuestoResponse = (value: { min: number; max: number }) => {
  preferencias.value.precio_min = value.min;
  preferencias.value.precio_max = value.max;
  preguntarDormitorios();
};

const preguntarDormitorios = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold flex items-center gap-2"><span class="inline-flex items-center justify-center w-5 h-5"><svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></span>¿Cuántos dormitorios necesitas mínimo?</p><p class="text-sm text-gray-600">Pregunta obligatoria (2/4)</p>',
    options: [
      { label: '1 dormitorio', value: 1, action: 'dormitorios' },
      { label: '2 dormitorios', value: 2, action: 'dormitorios' },
      { label: '3 o más dormitorios', value: 3, action: 'dormitorios' },
    ],
  });
};

const handleDormitoriosResponse = (value: number) => {
  preferencias.value.dormitorios_min = value;
  preferencias.value.banos_min = 1;
  preguntarTipoInmueble();
};

const preguntarTipoInmueble = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold flex items-center gap-2"><span class="inline-flex items-center justify-center w-5 h-5"><svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></span>¿Qué tipo de inmueble prefieres?</p><p class="text-sm text-gray-600">Pregunta obligatoria (3/4)</p>',
    options: [
      { label: 'Casa', value: 'Casa', action: 'tipo_inmueble' },
      { label: 'Departamento', value: 'Departamento', action: 'tipo_inmueble' },
      { label: 'Cualquiera', value: '', action: 'tipo_inmueble' },
    ],
  });
};

const handleTipoInmuebleResponse = (value: string) => {
  if (value) {
    preferencias.value.tipo_inmueble_preferido = value;
  }
  preguntarUbicacion();
};

const preguntarUbicacion = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold">�� ¿En qué zona te gustaría vivir?</p><p class="text-sm text-gray-600">Pregunta obligatoria (4/4) - Puedes elegir varias o ninguna</p>',
    multiSelect: true,
    multiSelectOptions: [
      { label: ' Santiago', value: 'Santiago' },
      { label: ' Ñuñoa', value: 'Ñuñoa' },
      { label: ' La Reina', value: 'La Reina' },
      { label: ' Estación Central', value: 'Estación Central' },
    ],
    multiSelectAction: 'ubicacion',
  });
};

// ============================================================================
// FASE 2: MENÚ DE PREFERENCIAS OPCIONALES
// ============================================================================

const preguntarTemasOpcionales = () => {
  addMessage({
    sender: 'bot',
    text: `
      <div class="space-y-2">
        <p class="font-semibold"><svg class="w-5 h-5 inline-block text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ¡Perfecto! Ahora tú decides</p>
        <p class="text-sm text-gray-600">Selecciona <strong>SOLO</strong> los temas que te interesa especificar.</p>
        <p class="text-xs text-gray-500">Te haré preguntas solo sobre lo que marques. Si no marcas nada, buscaré propiedades solo con tus preferencias básicas.</p>
      </div>
    `,
    multiSelect: true,
    multiSelectOptions: [
      { label: '<svg class="w-5 h-5 inline-block text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> Transporte (cercanía a metro)', value: 'transporte' },
      { label: '<svg class="w-5 h-5 inline-block text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> Educación (colegios)', value: 'educacion' },
      { label: '<svg class="w-5 h-5 inline-block text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Salud (hospitales, clínicas)', value: 'salud' },
      { label: ' Áreas Verdes (parques)', value: 'areas_verdes' },
      { label: '<svg class="w-5 h-5 inline-block text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> Características del Edificio', value: 'edificio' },
      { label: '<svg class="w-5 h-5 inline-block text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg> Ambiente/Ruido', value: 'ambiente' },
    ],
    multiSelectAction: 'temas_opcionales',
  });
};

// ============================================================================
// FASE 3: PREGUNTAS DINÁMICAS (SOLO LAS SELECCIONADAS)
// ============================================================================

const preguntarTemasSeleccionados = () => {
  indiceTemaActual = 0;
  preguntarSiguienteTema();
};

const preguntarSiguienteTema = () => {
  if (indiceTemaActual >= temasSeleccionados.value.length) {
    // Terminó todas las preguntas dinámicas
    finalizarConversacion();
    return;
  }
  
  const tema = temasSeleccionados.value[indiceTemaActual];
  indiceTemaActual++;
  
  switch (tema) {
    case 'transporte':
      preguntarTransporte();
      break;
    case 'educacion':
      preguntarEducacion();
      break;
    case 'salud':
      preguntarSalud();
      break;
    case 'areas_verdes':
      preguntarAreasVerdes();
      break;
    case 'edificio':
      preguntarEdificio();
      break;
    case 'ambiente':
      preguntarAmbiente();
      break;
    default:
      preguntarSiguienteTema();
  }
};

const preguntarTransporte = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold"><svg class="w-5 h-5 inline-block text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> Transporte</p><p class="text-sm text-gray-600 mt-1">¿Qué tan importante es estar cerca del metro?</p>',
    requiresSlider: true,
    sliderLabel: '¿Qué tan importante es estar cerca del metro?',
    sliderHelp: 'Valores positivos: quieres estar cerca. Valores negativos: prefieres estar lejos (zona tranquila)',
    sliderAction: 'prioridad_transporte',
  });
};

const handlePrioridadTransporte = (value: number) => {
  if (value < 0) {
    preferencias.value.prioridad_transporte = Math.abs(value);
    preferencias.value.evitar_metro = true;
  } else {
    preferencias.value.prioridad_transporte = value;
    preferencias.value.evitar_metro = false;
  }
  preguntarSiguienteTema();
};

const preguntarEducacion = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold"><svg class="w-5 h-5 inline-block text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> Educación</p><p class="text-sm text-gray-600 mt-1">¿Qué tan importante es estar cerca de colegios?</p>',
    requiresSlider: true,
    sliderLabel: '¿Qué tan importante es estar cerca de colegios?',
    sliderHelp: 'Valores positivos: ideal si tienes niños. Valores negativos: prefieres lejos (evitar ruido)',
    sliderAction: 'prioridad_educacion',
  });
};

const handlePrioridadEducacion = (value: number) => {
  if (value < 0) {
    preferencias.value.prioridad_educacion = Math.abs(value);
    preferencias.value.evitar_colegios = true;
  } else {
    preferencias.value.prioridad_educacion = value;
    preferencias.value.evitar_colegios = false;
  }
  preguntarSiguienteTema();
};

const preguntarSalud = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold"><svg class="w-5 h-5 inline-block text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Salud</p><p class="text-sm text-gray-600 mt-1">¿Qué tan importante es estar cerca de centros de salud?</p>',
    requiresSlider: true,
    sliderLabel: '¿Qué tan importante es estar cerca de hospitales/clínicas?',
    sliderHelp: 'Valores positivos: tranquilidad de tener centros médicos cerca. Valores negativos: evitar ruido de ambulancias',
    sliderAction: 'prioridad_salud',
  });
};

const handlePrioridadSalud = (value: number) => {
  if (value < 0) {
    preferencias.value.prioridad_salud = Math.abs(value);
    preferencias.value.evitar_hospitales = true;
  } else {
    preferencias.value.prioridad_salud = value;
    preferencias.value.evitar_hospitales = false;
  }
  preguntarSiguienteTema();
};

const preguntarAreasVerdes = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold"> Áreas Verdes</p><p class="text-sm text-gray-600 mt-1">¿Qué tan importante es estar cerca de parques?</p>',
    requiresSlider: true,
    sliderLabel: '¿Qué tan importante es estar cerca de parques y plazas?',
    sliderHelp: 'Valores positivos: disfrutas de espacios verdes y naturaleza',
    sliderAction: 'prioridad_areas_verdes',
  });
};

const handlePrioridadAreasVerdes = (value: number) => {
  preferencias.value.prioridad_areas_verdes = value;
  preguntarSiguienteTema();
};

const preguntarEdificio = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold"><svg class="w-5 h-5 inline-block text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> Características del Edificio - ¿Necesitas estacionamiento?</p>',
    options: [
      { label: 'Sí, es indispensable', value: true, action: 'edificio_estacionamiento' },
      { label: 'No es necesario', value: false, action: 'edificio_estacionamiento' },
    ],
  });
};

const handleEdificioEstacionamiento = (value: boolean) => {
  preferencias.value.requiere_estacionamiento = value;
  preguntarSiguienteTema();
};

const preguntarAmbiente = () => {
  addMessage({
    sender: 'bot',
    text: '<p class="font-semibold"><svg class="w-5 h-5 inline-block text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg> Ambiente/Ruido - ¿Qué nivel de ruido prefieres?</p>',
    options: [
      { label: 'Bajo (zona muy tranquila)', value: 'bajo', action: 'ambiente_ruido' },
      { label: 'Medio (normal urbano)', value: 'medio', action: 'ambiente_ruido' },
      { label: 'Alto (zona céntrica animada)', value: 'alto', action: 'ambiente_ruido' },
    ],
  });
};

const handleAmbienteRuido = (value: string) => {
  preferencias.value.ruido_ambiente = value as 'bajo' | 'medio' | 'alto';
  preguntarSiguienteTema();
};

// ============================================================================
// FASE 4: FINALIZACIÓN
// ============================================================================

const finalizarConversacion = () => {
  isLoading.value = true;
  
  setTimeout(() => {
    isLoading.value = false;
    
    // Construir resumen dinámico
    const resumenItems: string[] = [
      `<p><svg class="w-5 h-5 inline-block text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Presupuesto: $${(preferencias.value.precio_min || 0).toLocaleString()} - $${(preferencias.value.precio_max || 0).toLocaleString()}</p>`,
      `<p><svg class="w-5 h-5 inline-block text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> Dormitorios: ${preferencias.value.dormitorios_min || 'Sin preferencia'}</p>`,
      `<p><svg class="w-5 h-5 inline-block text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> Tipo: ${preferencias.value.tipo_inmueble_preferido || 'Cualquiera'}</p>`,
      `<p><svg class="w-5 h-5 inline-block text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Zona: ${preferencias.value.comunas_preferidas?.join(', ') || 'Sin preferencia'}</p>`,
    ];
    
    if (temasSeleccionados.value.length > 0) {
      resumenItems.push(`<p class="mt-2 pt-2 border-t border-gray-200 font-medium">Preferencias adicionales:</p>`);
      
      if (temasSeleccionados.value.includes('transporte')) {
        const texto = preferencias.value.evitar_metro ? 'Prefiere LEJOS del metro' : `Prioridad: ${preferencias.value.prioridad_transporte}/10`;
        resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> Transporte: ${texto}</p>`);
      }
      if (temasSeleccionados.value.includes('educacion')) {
        const texto = preferencias.value.evitar_colegios ? 'Prefiere LEJOS de colegios' : `Prioridad: ${preferencias.value.prioridad_educacion}/10`;
        resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> Educación: ${texto}</p>`);
      }
      if (temasSeleccionados.value.includes('salud')) {
        const texto = preferencias.value.evitar_hospitales ? 'Prefiere LEJOS de hospitales' : `Prioridad: ${preferencias.value.prioridad_salud}/10`;
        resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Salud: ${texto}</p>`);
      }
      if (temasSeleccionados.value.includes('areas_verdes')) {
        resumenItems.push(`<p> Áreas Verdes: Prioridad ${preferencias.value.prioridad_areas_verdes}/10</p>`);
      }
      if (temasSeleccionados.value.includes('edificio')) {
        resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> Estacionamiento: ${preferencias.value.requiere_estacionamiento ? 'Requerido' : 'No requerido'}</p>`);
      }
      if (temasSeleccionados.value.includes('ambiente')) {
        resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg> Ruido: ${preferencias.value.ruido_ambiente || 'Normal'}</p>`);
      }
    }
    
    addMessage({
      sender: 'bot',
      text: `
        <div class="space-y-3">
          <p class="font-semibold text-green-600"><svg class="w-5 h-5 inline-block text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ¡Perfecto! Ya tengo toda la información</p>
          <div class="mt-3 p-3 bg-blue-50 rounded-lg text-sm space-y-1">
            <p class="font-medium">Resumen de tus preferencias:</p>
            ${resumenItems.join('')}
          </div>
        </div>
      `,
      options: [
        {
          label: '<svg class="w-5 h-5 inline-block text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Buscar Recomendaciones',
          value: 'buscar',
          action: 'buscar',
        },
        {
          label: '<svg class="w-5 h-5 inline-block text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Reiniciar Búsqueda',
          value: 'reiniciar',
          action: 'reiniciar',
        }
      ]
    });
    
    // Convertir preferencias simples a formato ML
    // Calcular pesos raw (sin normalizar)
    const pesosRaw = {
      precio: preferencias.value.prioridad_precio ?? 5,
      ubicacion: preferencias.value.prioridad_ubicacion ?? 5,
      tamano: preferencias.value.prioridad_tamano ?? 5,
      transporte: preferencias.value.prioridad_transporte ?? 0,
      educacion: preferencias.value.prioridad_educacion ?? 0,
      salud: preferencias.value.prioridad_salud ?? 0,
      servicios: 0,
      areas_verdes: preferencias.value.prioridad_areas_verdes ?? 0,
      edificio: preferencias.value.requiere_estacionamiento ? 3 : 0,
    };
    
    // Calcular suma total
    const sumaTotal = Object.values(pesosRaw).reduce((acc, val) => acc + val, 0);
    
    // Normalizar pesos para que sumen 1.0
    const preferenciasML: PreferenciasDetalladasML = {
      // Hard constraints
      precio_min: preferencias.value.precio_min,
      precio_max: preferencias.value.precio_max,
      dormitorios_min: preferencias.value.dormitorios_min,
      banos_min: preferencias.value.banos_min || 1,
      
      // Ubicación
      comunas_preferidas: preferencias.value.comunas_preferidas,
      
      // Pesos globales NORMALIZADOS (suman 1.0)
      peso_precio: sumaTotal > 0 ? pesosRaw.precio / sumaTotal : 0.20,
      peso_ubicacion: sumaTotal > 0 ? pesosRaw.ubicacion / sumaTotal : 0.20,
      peso_tamano: sumaTotal > 0 ? pesosRaw.tamano / sumaTotal : 0.15,
      peso_transporte: sumaTotal > 0 ? pesosRaw.transporte / sumaTotal : 0,
      peso_educacion: sumaTotal > 0 ? pesosRaw.educacion / sumaTotal : 0,
      peso_salud: sumaTotal > 0 ? pesosRaw.salud / sumaTotal : 0,
      peso_servicios: 0,
      peso_areas_verdes: sumaTotal > 0 ? pesosRaw.areas_verdes / sumaTotal : 0,
      peso_edificio: sumaTotal > 0 ? pesosRaw.edificio / sumaTotal : 0.10,
    };
    
    // Agregar detalles de transporte si fue seleccionado
    if (temasSeleccionados.value.includes('transporte') && (preferencias.value.prioridad_transporte ?? 0) > 0) {
      const prioridadTransporte = preferencias.value.prioridad_transporte ?? 0;
      preferenciasML.transporte = {
        importancia_metro: preferencias.value.evitar_metro ? -prioridadTransporte : prioridadTransporte,
        distancia_maxima_metro_m: preferencias.value.evitar_metro ? 9999999 : 1000,
        importancia_buses: 0,
        distancia_maxima_buses_m: 9999999,
      };
    }
    
    // Agregar detalles de educación si fue seleccionado
    if (temasSeleccionados.value.includes('educacion') && (preferencias.value.prioridad_educacion ?? 0) > 0) {
      const prioridadEducacion = preferencias.value.prioridad_educacion ?? 0;
      preferenciasML.educacion = {
        importancia_colegios: preferencias.value.evitar_colegios ? -prioridadEducacion : prioridadEducacion,
        distancia_maxima_colegios_m: preferencias.value.evitar_colegios ? 9999999 : 1000,
        importancia_universidades: 0,
        distancia_maxima_universidades_m: 9999999,
      };
    }
    
    // Agregar detalles de salud si fue seleccionado
    if (temasSeleccionados.value.includes('salud') && (preferencias.value.prioridad_salud ?? 0) > 0) {
      const prioridadSalud = preferencias.value.prioridad_salud ?? 0;
      preferenciasML.salud = {
        importancia_consultorios: 0,
        distancia_maxima_consultorios_m: 9999999,
        importancia_hospitales: preferencias.value.evitar_hospitales ? -prioridadSalud : prioridadSalud,
        distancia_maxima_hospitales_m: preferencias.value.evitar_hospitales ? 9999999 : 2000,
        importancia_farmacias: 0,
        distancia_maxima_farmacias_m: 9999999,
      };
    }
    
    // Agregar detalles de áreas verdes si fue seleccionado
    if (temasSeleccionados.value.includes('areas_verdes') && (preferencias.value.prioridad_areas_verdes ?? 0) > 0) {
      const prioridadAreas = preferencias.value.prioridad_areas_verdes ?? 0;
      preferenciasML.areas_verdes = {
        importancia_parques: prioridadAreas,
        distancia_maxima_parques_m: 1500,
        importancia_plazas: 0,
        distancia_maxima_plazas_m: 9999999,
        importancia_ciclovias: 0,
      };
    }
    
    // Agregar detalles de edificio si fue seleccionado
    if (temasSeleccionados.value.includes('edificio')) {
      preferenciasML.edificio = {
        importancia_gastos_bajos: 0,
        importancia_piso_alto: 0,
        importancia_orientacion: 0,
        necesita_terraza: false,
        importancia_terraza: 0,
        tipo_preferido: preferencias.value.tipo_inmueble_preferido,
        importancia_tipo: preferencias.value.tipo_inmueble_preferido ? 5 : 0,
        importancia_privacidad: 0,
      };
    }
    
    // Emitir preferencias completas en formato ML
    emit('preferenciasCompletas', preferenciasML);
  }, 1000);
};

const ejecutarBusqueda = () => {
  isLoading.value = true;
  
  addMessage({
    sender: 'bot',
    text: '<svg class="w-5 h-5 inline-block text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Buscando las mejores propiedades para ti...',
  });
  
  setTimeout(() => {
    isLoading.value = false;
    
    // Convertir preferencias simples a formato ML (mismo código que en finalizarConversacion)
    // Calcular pesos raw (sin normalizar)
    const pesosRaw = {
      precio: preferencias.value.prioridad_precio ?? 5,
      ubicacion: preferencias.value.prioridad_ubicacion ?? 5,
      tamano: preferencias.value.prioridad_tamano ?? 5,
      transporte: preferencias.value.prioridad_transporte ?? 0,
      educacion: preferencias.value.prioridad_educacion ?? 0,
      salud: preferencias.value.prioridad_salud ?? 0,
      servicios: 0,
      areas_verdes: preferencias.value.prioridad_areas_verdes ?? 0,
      edificio: preferencias.value.requiere_estacionamiento ? 3 : 0,
    };
    
    // Calcular suma total
    const sumaTotal = Object.values(pesosRaw).reduce((acc, val) => acc + val, 0);
    
    // Normalizar pesos para que sumen 1.0
    const preferenciasML: PreferenciasDetalladasML = {
      // Hard constraints
      precio_min: preferencias.value.precio_min,
      precio_max: preferencias.value.precio_max,
      dormitorios_min: preferencias.value.dormitorios_min,
      banos_min: preferencias.value.banos_min || 1,
      
      // Ubicación
      comunas_preferidas: preferencias.value.comunas_preferidas,
      
      // Pesos globales NORMALIZADOS (suman 1.0)
      peso_precio: sumaTotal > 0 ? pesosRaw.precio / sumaTotal : 0.20,
      peso_ubicacion: sumaTotal > 0 ? pesosRaw.ubicacion / sumaTotal : 0.20,
      peso_tamano: sumaTotal > 0 ? pesosRaw.tamano / sumaTotal : 0.15,
      peso_transporte: sumaTotal > 0 ? pesosRaw.transporte / sumaTotal : 0,
      peso_educacion: sumaTotal > 0 ? pesosRaw.educacion / sumaTotal : 0,
      peso_salud: sumaTotal > 0 ? pesosRaw.salud / sumaTotal : 0,
      peso_servicios: 0,
      peso_areas_verdes: sumaTotal > 0 ? pesosRaw.areas_verdes / sumaTotal : 0,
      peso_edificio: sumaTotal > 0 ? pesosRaw.edificio / sumaTotal : 0.10,
    };
    
    // Agregar detalles de transporte si fue seleccionado
    if (temasSeleccionados.value.includes('transporte') && (preferencias.value.prioridad_transporte ?? 0) > 0) {
      const prioridadTransporte = preferencias.value.prioridad_transporte ?? 0;
      preferenciasML.transporte = {
        importancia_metro: preferencias.value.evitar_metro ? -prioridadTransporte : prioridadTransporte,
        distancia_maxima_metro_m: preferencias.value.evitar_metro ? 9999999 : 1000,
        importancia_buses: 0,
        distancia_maxima_buses_m: 9999999,
      };
    }
    
    // Agregar detalles de educación si fue seleccionado
    if (temasSeleccionados.value.includes('educacion') && (preferencias.value.prioridad_educacion ?? 0) > 0) {
      const prioridadEducacion = preferencias.value.prioridad_educacion ?? 0;
      preferenciasML.educacion = {
        importancia_colegios: preferencias.value.evitar_colegios ? -prioridadEducacion : prioridadEducacion,
        distancia_maxima_colegios_m: preferencias.value.evitar_colegios ? 9999999 : 1000,
        importancia_universidades: 0,
        distancia_maxima_universidades_m: 9999999,
      };
    }
    
    // Agregar detalles de salud si fue seleccionado
    if (temasSeleccionados.value.includes('salud') && (preferencias.value.prioridad_salud ?? 0) > 0) {
      const prioridadSalud = preferencias.value.prioridad_salud ?? 0;
      preferenciasML.salud = {
        importancia_consultorios: 0,
        distancia_maxima_consultorios_m: 9999999,
        importancia_hospitales: preferencias.value.evitar_hospitales ? -prioridadSalud : prioridadSalud,
        distancia_maxima_hospitales_m: preferencias.value.evitar_hospitales ? 9999999 : 2000,
        importancia_farmacias: 0,
        distancia_maxima_farmacias_m: 9999999,
      };
    }
    
    // Agregar detalles de áreas verdes si fue seleccionado
    if (temasSeleccionados.value.includes('areas_verdes') && (preferencias.value.prioridad_areas_verdes ?? 0) > 0) {
      const prioridadAreas = preferencias.value.prioridad_areas_verdes ?? 0;
      preferenciasML.areas_verdes = {
        importancia_parques: prioridadAreas,
        distancia_maxima_parques_m: 1500,
        importancia_plazas: 0,
        distancia_maxima_plazas_m: 9999999,
        importancia_ciclovias: 0,
      };
    }
    
    // Agregar detalles de edificio si fue seleccionado
    if (temasSeleccionados.value.includes('edificio')) {
      preferenciasML.edificio = {
        importancia_gastos_bajos: 0,
        importancia_piso_alto: 0,
        importancia_orientacion: 0,
        necesita_terraza: false,
        importancia_terraza: 0,
        tipo_preferido: preferencias.value.tipo_inmueble_preferido,
        importancia_tipo: preferencias.value.tipo_inmueble_preferido ? 5 : 0,
        importancia_privacidad: 0,
      };
    }
    
    // Emitir evento para iniciar búsqueda real
    emit('preferenciasCompletas', preferenciasML);
    
    addMessage({
      sender: 'bot',
      text: '<svg class="w-5 h-5 inline-block text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ¡Búsqueda iniciada! Los resultados aparecerán en la página.',
    });
  }, 1500);
};

const resetChat = () => {
  messages.value = [];
  preferencias.value = {
    prioridad_precio: 5,
    prioridad_ubicacion: 5,
    prioridad_transporte: 0,
    prioridad_educacion: 0,
    prioridad_salud: 0,
    prioridad_areas_verdes: 0,
    prioridad_tamano: 5,
    requiere_estacionamiento: false,
    evitar_colegios: false,
    evitar_hospitales: false,
    evitar_metro: false,
  };
  temasSeleccionados.value = [];
  tempMultiSelectValues.value = [];
  indiceTemaActual = 0;
  iniciarConversacion();
};

const verResumen = () => {
  const resumenItems: string[] = [
    `<p><svg class="w-5 h-5 inline-block text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <strong>Presupuesto:</strong> $${(preferencias.value.precio_min || 0).toLocaleString()} - $${(preferencias.value.precio_max || 0).toLocaleString()}</p>`,
    `<p><svg class="w-5 h-5 inline-block text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> <strong>Dormitorios:</strong> ${preferencias.value.dormitorios_min || 'Sin preferencia'}</p>`,
    `<p><svg class="w-5 h-5 inline-block text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> <strong>Tipo:</strong> ${preferencias.value.tipo_inmueble_preferido || 'Cualquiera'}</p>`,
    `<p><svg class="w-5 h-5 inline-block text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <strong>Comunas:</strong> ${preferencias.value.comunas_preferidas?.join(', ') || 'Sin preferencia'}</p>`,
  ];
  
  if (temasSeleccionados.value.length > 0) {
    resumenItems.push(`<div class="mt-2 pt-2 border-t border-gray-200"><p class="font-medium mb-1">Preferencias adicionales:</p>`);
    
    if (temasSeleccionados.value.includes('transporte')) {
      const texto = preferencias.value.evitar_metro ? 'Prefiere LEJOS del metro' : `${preferencias.value.prioridad_transporte}/10`;
      resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> Transporte: ${texto}</p>`);
    }
    if (temasSeleccionados.value.includes('educacion')) {
      const texto = preferencias.value.evitar_colegios ? 'Prefiere LEJOS de colegios' : `${preferencias.value.prioridad_educacion}/10`;
      resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> Educación: ${texto}</p>`);
    }
    if (temasSeleccionados.value.includes('salud')) {
      const texto = preferencias.value.evitar_hospitales ? 'Prefiere LEJOS de hospitales' : `${preferencias.value.prioridad_salud}/10`;
      resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Salud: ${texto}</p>`);
    }
    if (temasSeleccionados.value.includes('areas_verdes')) {
      resumenItems.push(`<p> Áreas Verdes: ${preferencias.value.prioridad_areas_verdes}/10</p>`);
    }
    if (temasSeleccionados.value.includes('edificio')) {
      resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> Estacionamiento: ${preferencias.value.requiere_estacionamiento ? 'Requerido' : 'No requerido'}</p>`);
    }
    if (temasSeleccionados.value.includes('ambiente')) {
      resumenItems.push(`<p><svg class="w-5 h-5 inline-block text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg> Ruido: ${preferencias.value.ruido_ambiente || 'Normal'}</p>`);
    }
    
    resumenItems.push(`</div>`);
  }
  
  addMessage({
    sender: 'bot',
    text: `
      <div class="space-y-2">
        <p class="font-semibold">📋 Resumen de tus preferencias:</p>
        <div class="mt-2 space-y-1 text-sm">
          ${resumenItems.join('')}
        </div>
      </div>
    `,
  });
};
</script>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
