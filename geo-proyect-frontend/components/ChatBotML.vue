<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Chat Messages Area -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
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
            'max-w-[80%] rounded-lg p-3 shadow-sm',
            message.sender === 'bot'
              ? 'bg-white border border-gray-200'
              : 'bg-blue-500 text-white'
          ]"
        >
          <!-- Avatar -->
          <div class="flex items-start gap-3">
            <div
              v-if="message.sender === 'bot'"
              class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
            >
              <i class="pi pi-home"></i>
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
                  :disabled="option.action === 'start' && searchStarted"
                  class="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium text-blue-700"
                >
                  {{ option.label }}
                </button>
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
                  >
                    {{ option.label }}
                  </label>
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
                  Continuar
                </button>
              </div>
            </div>

            <div
              v-if="message.sender === 'user'"
              class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm"
            >
              <i class="pi pi-user"></i>
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
    <div v-if="showQuickActions" class="sticky bottom-0 p-4 bg-white border-t border-gray-200 shadow-md flex justify-end">
      <div class="flex gap-2 flex-wrap">
        <button
          @click="resetChat"
          class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-bold"
        >
          <i class="pi pi-refresh mr-1"></i> 
          Reiniciar
        </button>
        <button
          v-if="preferencias.precio_min"
          @click="verResumen"
          class="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
        >
          <i class="pi pi-list mr-1"></i> Ver Resumen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import type { PreferenciasDetalladasML } from '~/services/recommendationMLService';

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

const searchStarted = ref(false);

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
        <p class="font-semibold text-lg"><i class="pi pi-comments mr-1"></i> ¡Hola! Soy tu asistente inmobiliario</p>
        <p>Te ayudaré a encontrar la propiedad perfecta según tus necesidades.</p>
        <p class="text-gray-600 text-sm">Primero te haré algunas preguntas básicas, y luego <strong>TÚ decides</strong> qué otros aspectos quieres especificar.</p>
      </div>
    `,
    options: [
      { label: 'Comenzar búsqueda', value: 'start', action: 'start' },
    ],
  });
};

const handleOptionClick = (option: { label: string; value: any; action: string }) => {
  addUserMessage(option.label);
  
  switch (option.action) {
    case 'start':
      searchStarted.value = true;
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
    text: '<p class="font-semibold"><i class="pi pi-money-bill mr-1"></i> ¿Cuál es tu presupuesto?</p><p class="text-sm text-gray-600">Pregunta obligatoria (1/4)</p>',
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
    text: '<p class="font-semibold"><i class="pi pi-user mr-1"></i> ¿Cuántos dormitorios necesitas mínimo?</p><p class="text-sm text-gray-600">Pregunta obligatoria (2/4)</p>',
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
    text: '<p class="font-semibold"><i class="pi pi-home mr-1"></i> ¿Qué tipo de inmueble prefieres?</p><p class="text-sm text-gray-600">Pregunta obligatoria (3/4)</p>',
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
    text: '<p class="font-semibold">¿En qué zona te gustaría vivir?</p><p class="text-sm text-gray-600">Pregunta obligatoria (4/4) - Puedes elegir varias o ninguna</p>',
    multiSelect: true,
    multiSelectOptions: [
      { label: 'Santiago', value: 'Santiago' },
      { label: 'Ñuñoa', value: 'Ñuñoa' },
      { label: 'La Reina', value: 'La Reina' },
      { label: 'Estación Central', value: 'Estación Central' },
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
        <p class="font-semibold">¡Perfecto! Ahora tú decides</p>
        <p class="text-sm text-gray-600">Selecciona <strong>SOLO</strong> los temas que te interesa especificar.</p>
        <p class="text-xs text-gray-500">Te haré preguntas solo sobre lo que marques. Si no marcas nada, buscaré propiedades solo con tus preferencias básicas.</p>
      </div>
    `,
    multiSelect: true,
    multiSelectOptions: [
      { label: 'Transporte (cercanía a metro)', value: 'transporte' },
      { label: 'Educación (colegios)', value: 'educacion' },
      { label: 'Salud (hospitales, clínicas)', value: 'salud' },
      { label: 'Áreas Verdes (parques)', value: 'areas_verdes' },
      { label: 'Características del Edificio', value: 'edificio' },
      { label: 'Ambiente/Ruido', value: 'ambiente' },
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
  text: '<p class="font-semibold"><i class="pi pi-train mr-1"></i> Transporte</p><p class="text-sm text-gray-600 mt-1">¿Qué tan importante es estar cerca del metro?</p>',
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
  text: '<p class="font-semibold"><i class="pi pi-book mr-1"></i> Educación</p><p class="text-sm text-gray-600 mt-1">¿Qué tan importante es estar cerca de colegios?</p>',
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
  text: '<p class="font-semibold"><i class="pi pi-hospital mr-1"></i> Salud</p><p class="text-sm text-gray-600 mt-1">¿Qué tan importante es estar cerca de centros de salud?</p>',
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
  text: '<p class="font-semibold"><i class="pi pi-tree mr-1"></i> Áreas Verdes</p><p class="text-sm text-gray-600 mt-1">¿Qué tan importante es estar cerca de parques?</p>',
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
  text: '<p class="font-semibold"><i class="pi pi-building mr-1"></i> Características del Edificio - ¿Necesitas estacionamiento?</p>',
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
  text: '<p class="font-semibold"><i class="pi pi-bell mr-1"></i> Ambiente/Ruido - ¿Qué nivel de ruido prefieres?</p>',
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
      `<p><CurrencyDollarIcon class="inline-block mr-1" /> Presupuesto: $${(preferencias.value.precio_min || 0).toLocaleString()} - $${(preferencias.value.precio_max || 0).toLocaleString()}</p>`,
      `<p><HomeIcon class="inline-block mr-1" /> Dormitorios: ${preferencias.value.dormitorios_min || 'Sin preferencia'}</p>`,
      `<p><HomeIcon class="inline-block mr-1" /> Tipo: ${preferencias.value.tipo_inmueble_preferido || 'Cualquiera'}</p>`,
      `<p><MapPinIcon class="inline-block mr-1" /> Zona: ${preferencias.value.comunas_preferidas?.join(', ') || 'Sin preferencia'}</p>`,
    ];
    
    if (temasSeleccionados.value.length > 0) {
      resumenItems.push(`<p class="mt-2 pt-2 border-t border-gray-200 font-medium">Preferencias adicionales:</p>`);
      
      if (temasSeleccionados.value.includes('transporte')) {
        const texto = preferencias.value.evitar_metro ? 'Prefiere LEJOS del metro' : `Prioridad: ${preferencias.value.prioridad_transporte}/10`;
  resumenItems.push(`<p><TrainIcon class="inline-block mr-1" /> Transporte: ${texto}</p>`);
      }
      if (temasSeleccionados.value.includes('educacion')) {
        const texto = preferencias.value.evitar_colegios ? 'Prefiere LEJOS de colegios' : `Prioridad: ${preferencias.value.prioridad_educacion}/10`;
  resumenItems.push(`<p><BookIcon class="inline-block mr-1" /> Educación: ${texto}</p>`);
      }
      if (temasSeleccionados.value.includes('salud')) {
        const texto = preferencias.value.evitar_hospitales ? 'Prefiere LEJOS de hospitales' : `Prioridad: ${preferencias.value.prioridad_salud}/10`;
  resumenItems.push(`<p><HospitalIcon class="inline-block mr-1" /> Salud: ${texto}</p>`);
      }
      if (temasSeleccionados.value.includes('areas_verdes')) {
  resumenItems.push(`<p><TreeIcon class="inline-block mr-1" /> Áreas Verdes: Prioridad ${preferencias.value.prioridad_areas_verdes}/10</p>`);
      }
      if (temasSeleccionados.value.includes('edificio')) {
  resumenItems.push(`<p><CarIcon class="inline-block mr-1" /> Estacionamiento: ${preferencias.value.requiere_estacionamiento ? 'Requerido' : 'No requerido'}</p>`);
      }
      if (temasSeleccionados.value.includes('ambiente')) {
  resumenItems.push(`<p><BellIcon class="inline-block mr-1" /> Ruido: ${preferencias.value.ruido_ambiente || 'Normal'}</p>`);
      }
    }
    
    addMessage({
      sender: 'bot',
      text: `
        <div class="space-y-3">
          <p class="font-semibold text-green-600"><i class="pi pi-check-circle mr-1"></i> ¡Perfecto! Ya tengo toda la información</p>
          <div class="mt-3 p-3 bg-blue-50 rounded-lg text-sm space-y-1">
            <p class="font-medium">Resumen de tus preferencias:</p>
            ${resumenItems.join('')}
          </div>
        </div>
      `,
      options: [
        {
          label: 'Buscar Recomendaciones',
          value: 'buscar',
          action: 'buscar',
        },
        {
          label: 'Reiniciar Búsqueda',
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
    text: `<i class="pi pi-search mr-1"></i> Buscando las mejores propiedades para ti...`,
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
      text: `<i class="pi pi-check-circle mr-1"></i> ¡Búsqueda iniciada! Los resultados aparecerán en la página.`,
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
  searchStarted.value = false;
  iniciarConversacion();
};

const verResumen = () => {
  const resumenItems: string[] = [
    `<p><i class="pi pi-money-bill mr-1"></i> <strong>Presupuesto:</strong> $${(preferencias.value.precio_min || 0).toLocaleString()} - $${(preferencias.value.precio_max || 0).toLocaleString()}</p>`,
    `<p><strong>Dormitorios:</strong> ${preferencias.value.dormitorios_min || 'Sin preferencia'}</p>`,
    `<p><i class="pi pi-home mr-1"></i> <strong>Tipo:</strong> ${preferencias.value.tipo_inmueble_preferido || 'Cualquiera'}</p>`,
    `<p><i class="pi pi-map-marker mr-1"></i> <strong>Comunas:</strong> ${preferencias.value.comunas_preferidas?.join(', ') || 'Sin preferencia'}</p>`,
  ];
  
  if (temasSeleccionados.value.length > 0) {
    resumenItems.push(`<div class="mt-2 pt-2 border-t border-gray-200"><p class="font-medium mb-1">Preferencias adicionales:</p>`);
    
    if (temasSeleccionados.value.includes('transporte')) {
      const texto = preferencias.value.evitar_metro ? 'Prefiere LEJOS del metro' : `${preferencias.value.prioridad_transporte}/10`;
  resumenItems.push(`<p><i class="pi pi-train mr-1"></i> Transporte: ${texto}</p>`);
    }
    if (temasSeleccionados.value.includes('educacion')) {
      const texto = preferencias.value.evitar_colegios ? 'Prefiere LEJOS de colegios' : `${preferencias.value.prioridad_educacion}/10`;
  resumenItems.push(`<p><i class="pi pi-book mr-1"></i> Educación: ${texto}</p>`);
    }
    if (temasSeleccionados.value.includes('salud')) {
      const texto = preferencias.value.evitar_hospitales ? 'Prefiere LEJOS de hospitales' : `${preferencias.value.prioridad_salud}/10`;
  resumenItems.push(`<p><i class="pi pi-hospital mr-1"></i> Salud: ${texto}</p>`);
    }
    if (temasSeleccionados.value.includes('areas_verdes')) {
  resumenItems.push(`<p><i class="pi pi-tree mr-1"></i> Áreas Verdes: ${preferencias.value.prioridad_areas_verdes}/10</p>`);
    }
    if (temasSeleccionados.value.includes('edificio')) {
  resumenItems.push(`<p><i class="pi pi-car mr-1"></i> Estacionamiento: ${preferencias.value.requiere_estacionamiento ? 'Requerido' : 'No requerido'}</p>`);
    }
    if (temasSeleccionados.value.includes('ambiente')) {
  resumenItems.push(`<p><i class="pi pi-bell mr-1"></i> Ruido: ${preferencias.value.ruido_ambiente || 'Normal'}</p>`);
    }
    
    resumenItems.push(`</div>`);
  }
  
  addMessage({
    sender: 'bot',
    text: `
      <div class="space-y-2">
        <p class="font-semibold"><i class="pi pi-file mr-1"></i> Resumen de tus preferencias:</p>
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
