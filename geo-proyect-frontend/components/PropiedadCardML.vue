<template>
  <div class="propiedad-card-ml bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
    <!-- Header con score -->
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="font-bold text-lg leading-tight">{{ propiedad.direccion }}</h3>
          <p class="text-sm text-blue-100 mt-1">📍 {{ propiedad.comuna }}</p>
        </div>
        
        <div class="text-center ml-4">
          <div
            :class="[
              'text-3xl font-bold',
              getScoreColorText(propiedad.score_total)
            ]"
          >
            {{ propiedad.score_total }}
          </div>
          <div class="text-xs text-blue-100">/ 100</div>
          <div class="text-xs mt-1 bg-white/20 rounded px-2 py-0.5">
            🎯 {{ Math.round(propiedad.score_confianza * 100) }}%
          </div>
        </div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-5">
      <!-- Precio y características -->
      <div class="flex justify-between items-center mb-4 pb-4 border-b">
        <div>
          <div class="text-2xl font-bold text-blue-600">
            {{ formatearPrecio(propiedad.precio) }}
          </div>
        </div>
        <div class="flex gap-3 text-sm text-gray-600">
          <span>🛏️ {{ propiedad.dormitorios }}D</span>
          <span>🚿 {{ propiedad.banos }}B</span>
          <span v-if="propiedad.estacionamientos > 0">🚗 {{ propiedad.estacionamientos }}E</span>
          <span>📏 {{ propiedad.superficie_util }}m²</span>
        </div>
      </div>
      
      <!-- Resumen -->
      <div class="mb-4 p-3 bg-blue-50 rounded-lg">
        <p class="text-sm text-gray-700 italic">
          "{{ propiedad.resumen_explicacion }}"
        </p>
      </div>
      
      <!-- Puntos Fuertes -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-green-700 mb-2 flex items-center">
          <span class="mr-2">✅</span> Puntos Fuertes
        </h4>
        <ul class="space-y-1.5">
          <li
            v-for="(punto, idx) in propiedad.puntos_fuertes"
            :key="idx"
            class="text-sm text-gray-700 pl-4 border-l-2 border-green-400"
          >
            {{ punto }}
          </li>
        </ul>
      </div>
      
      <!-- Puntos Débiles -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-orange-700 mb-2 flex items-center">
          <span class="mr-2">⚠️</span> Puntos a Considerar
        </h4>
        <ul class="space-y-1.5">
          <li
            v-for="(punto, idx) in propiedad.puntos_debiles"
            :key="idx"
            class="text-sm text-gray-600 pl-4 border-l-2 border-orange-400"
          >
            {{ punto }}
          </li>
        </ul>
      </div>
      
      <!-- Distancias -->
      <div class="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 mb-2">📏 Distancias</h4>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="(distancia, key) in propiedad.distancias"
            :key="key"
            class="text-xs"
          >
            <span class="text-gray-600">{{ formatDistanciaKey(key) }}:</span>
            <span class="font-semibold ml-1">{{ Math.round(distancia) }}m</span>
          </div>
        </div>
      </div>
      
      <!-- Scores por categoría (collapsible) -->
      <details class="mb-4">
        <summary class="text-sm font-semibold text-gray-700 cursor-pointer hover:text-blue-600">
          📊 Ver Scores Detallados por Categoría
        </summary>
        <div class="mt-3 space-y-2">
          <div
            v-for="score in propiedad.scores_por_categoria"
            :key="score.categoria"
            class="border-l-4 pl-3 py-2"
            :class="getScoreBorderColor(score.score)"
          >
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium">{{ score.categoria }}</span>
              <span class="text-sm font-bold" :class="getScoreColorText(score.score)">
                {{ score.score.toFixed(1) }}/100
              </span>
            </div>
            <div class="text-xs text-gray-600">
              Peso: {{ (score.peso * 100).toFixed(0) }}% → Contribución: {{ score.contribucion.toFixed(1) }} pts
            </div>
            <p class="text-xs text-gray-500 mt-1 italic">{{ score.explicacion }}</p>
          </div>
        </div>
      </details>
      
      <!-- Acciones -->
      <div class="flex gap-2 pt-4 border-t">
        <button
          @click="$emit('ver-mapa', propiedad)"
          class="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          <span>🗺️</span> Ver en Mapa
        </button>
        <button
          @click="$emit('feedback', { propiedad, tipo: 'me_gusta' })"
          class="px-4 py-2.5 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-lg"
          title="Me gusta"
        >
          👍
        </button>
        <button
          @click="$emit('feedback', { propiedad, tipo: 'no_me_gusta' })"
          class="px-4 py-2.5 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-lg"
          title="No me gusta"
        >
          👎
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropiedadRecomendadaML } from '~/services/recommendationMLService'

defineProps<{
  propiedad: PropiedadRecomendadaML
}>()

defineEmits<{
  'ver-mapa': [propiedad: PropiedadRecomendadaML]
  'feedback': [data: { propiedad: PropiedadRecomendadaML, tipo: string }]
}>()

// Valor de la UF en CLP
const VALOR_UF_CLP = 37500;

const formatearPrecio = (precioUF: number): string => {
  const precioCLP = precioUF * VALOR_UF_CLP;
  const ufFormateado = precioUF.toLocaleString('es-CL', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });
  const clpFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(precioCLP);
  
  return `${ufFormateado} UF ≈ ${clpFormateado}`;
};

const getScoreColorText = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const getScoreBorderColor = (score: number): string => {
  if (score >= 80) return 'border-green-500'
  if (score >= 60) return 'border-blue-500'
  if (score >= 40) return 'border-orange-500'
  return 'border-red-500'
}

const formatDistanciaKey = (key: string): string => {
  const map: Record<string, string> = {
    'metro_m': '🚇 Metro',
    'colegio_m': '🎓 Colegio',
    'salud_m': '🏥 Salud',
    'parque_m': '🌳 Parque',
    'supermercado_m': '🛒 Supermercado',
    'gimnasio_m': '💪 Gimnasio'
  }
  return map[key] || key
}
</script>

<style scoped>
details summary::-webkit-details-marker {
  display: none;
}

details summary::before {
  content: '▶';
  margin-right: 0.5rem;
  transition: transform 0.2s;
}

details[open] summary::before {
  transform: rotate(90deg);
}
</style>
