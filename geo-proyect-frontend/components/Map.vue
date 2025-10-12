<template>
  <div class="w-full h-full">
    <div
      ref="mapEl"
      class="w-full h-full rounded-2xl overflow-hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as L from 'leaflet'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

type Item = {
  id: string | number
  title?: string
  address?: string
  price?: string | number
  lat: number
  lng: number
}

const props = defineProps<{
  items: Item[]
  center?: [number, number]
  zoom?: number
  fitToItems?: boolean
  /** Limitar paneo del mapa: [[southWestLat, southWestLng], [northEastLat, northEastLng]] */
  maxBounds?: [[number, number], [number, number]]
  /** Posición del control de zoom: 'topleft' | 'topright' | 'bottomleft' | 'bottomright' */
  zoomControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright'
  /** (Opcional) GeoJSON para pintar el límite de las comunas permitidas */
  boundaryGeojson?: any
}>()

const emit = defineEmits<{
  (e: 'select', item: Item): void
  (e: 'ready'): void
}>()

const mapEl = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let boundaryLayer: L.GeoJSON<any> | null = null
let searchMarker: L.Marker | null = null

function initMap() {
  if (!mapEl.value) return

  map = L.map(mapEl.value, {
    center: props.center ?? [-33.45, -70.66], // Santiago
    zoom: props.zoom ?? 12,
    zoomControl: false,
    maxBounds: props.maxBounds ? L.latLngBounds(props.maxBounds) : undefined,
    maxBoundsViscosity: props.maxBounds ? 1.0 : undefined,
  })

  // Mover botones de zoom a la esquina solicitada (inferior izquierda)
  L.control.zoom({ position: props.zoomControlPosition ?? 'bottomleft' }).addTo(map)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  // Pintar límites de comunas con sus colores específicos
  if (props.boundaryGeojson) {
    boundaryLayer = L.geoJSON(props.boundaryGeojson, {
      style: (feature) => ({
        color: feature?.properties?.color || '#3B82F6',
        weight: 2,
        opacity: 0.7,
        fillColor: feature?.properties?.color || '#93C5FD',
        fillOpacity: 0.1,
      }),
      onEachFeature: (feature, layer) => {
        // Agregar tooltip con el nombre de la comuna
        if (feature.properties?.name) {
          layer.bindTooltip(feature.properties.name, {
            permanent: false,
            direction: 'center',
            className: 'comuna-label'
          })
        }
      },
      interactive: true,
    }).addTo(map)
  }

  drawMarkers()
  emit('ready')
}

function drawMarkers() {
  if (!map || !markersLayer) return

  markersLayer.clearLayers()
  const bounds = L.latLngBounds([])

  props.items?.forEach((it) => {
    const popupHtml = `
      <div style="min-width:180px">
        <strong>${it.title ?? 'Propiedad'}</strong><br/>
        ${it.address ?? ''}<br/>
        ${it.price ? `<span style="font-weight:600">$${it.price}</span>` : ''}
      </div>
    `
    L.marker([it.lat, it.lng])
      .bindPopup(popupHtml)
      .on('click', () => emit('select', it))
      .addTo(markersLayer!)

    bounds.extend([it.lat, it.lng])
  })

  if (props.fitToItems && props.items?.length) {
    map.fitBounds(bounds.pad(0.15))
  }
}

// Función para mover el mapa a una ubicación y agregar marcador
function goToLocation(lat: number, lng: number, displayName: string) {
  if (!map) return

  // Remover marcador anterior de búsqueda si existe
  if (searchMarker) {
    searchMarker.remove()
  }

  // Crear un icono personalizado para el resultado de búsqueda
  const searchIcon = L.divIcon({
    className: 'custom-search-marker',
    html: `<div style="background-color: #EF4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })

  // Agregar marcador en la ubicación encontrada
  searchMarker = L.marker([lat, lng], { icon: searchIcon })
    .addTo(map)
    .bindPopup(`<strong>${displayName}</strong>`)
    .openPopup()

  // Centrar mapa en la ubicación
  map.setView([lat, lng], 16)
}

// Exponer la función para que pueda ser llamada desde el componente padre
defineExpose({
  goToLocation
})

watch(() => props.items, () => drawMarkers(), { deep: true })

watch(() => props.center, (c) => { if (map && c) map.setView(c, map.getZoom()) })
watch(() => props.zoom, (z) => { if (map && typeof z === 'number') map.setZoom(z) })

onMounted(() => initMap())
onBeforeUnmount(() => { map?.remove(); map = null })
</script>
