<template>
  <div class="overflow-x-auto grid grid-rows-[auto_1fr] bg-white p-4">
    <h1>OAIDSKLASDKL</h1>
    <TablePerso :rows="rows" :columns="columns" class="overflow-y-auto" @update-column="handleColumnUpdate"/>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';

const columns = ref([
  { key: "nombre", label: "Nombre", filterable: true, sortable: true, nonEditable: true },
  { key: "edad", label: "Edad", filterable: true, sortable: true, type: "number" , align: "right" },
  { key: "ciudad", label: "Ciudad", filterable: true, sortable: true },
  { key: "profesion", label: "Profesión", filterable: true, sortable: true },
  { key: "pais", label: "País", filterable: true, sortable: true, dropdown: true, options: ["España", "Francia", "Italia", "Alemania", "Portugal"] }
]);

const rows = ref([
  { id: 1, nombre: "Juan", edad: 25, ciudad: "Madrid", profesion: "Ingeniero", pais: "España" },
  { id: 2, nombre: "Ana", edad: 30, ciudad: "Barcelona", profesion: "Doctora", pais: "España" },
  { id: 3, nombre: "Carlos", edad: 22, ciudad: "Valencia", profesion: "Abogado", pais: "España" },
  { id: 4, nombre: "Lucía", edad: 28, ciudad: "Sevilla", profesion: "Arquitecta", pais: "España" },
  { id: 5, nombre: "Pedro", edad: 35, ciudad: "Bilbao", profesion: "Profesor", pais: "España" },
  { id: 6, nombre: "Maria", edad: 40, ciudad: "Granada", profesion: "Médico", pais: "España" },
  { id: 7, nombre: "José", edad: 27, ciudad: "Zaragoza", profesion: "Dentista", pais: "España" },
  { id: 8, nombre: "Elena", edad: 33, ciudad: "Madrid", profesion: "Diseñadora", pais: "España" },
  { id: 9, nombre: "Sergio", edad: 26, ciudad: "Alicante", profesion: "Programador", pais: "España" },
  { id: 10, nombre: "Laura", edad: 29, ciudad: "Murcia", profesion: "Periodista", pais: "España" },
  { id: 11, nombre: "David", edad: 32, ciudad: "Madrid", profesion: "Contador", pais: "España" },
  { id: 12, nombre: "Raquel", edad: 24, ciudad: "Valencia", profesion: "Estilista", pais: "España" },
  { id: 13, nombre: "José Luis", edad: 38, ciudad: "Barcelona", profesion: "Abogado", pais: "España" },
  { id: 14, nombre: "Carmen", edad: 45, ciudad: "Bilbao", profesion: "Psicóloga", pais: "España" },
  { id: 15, nombre: "Antonio", edad: 31, ciudad: "Sevilla", profesion: "Fotógrafo", pais: "España" },
  { id: 16, nombre: "Marta", edad: 26, ciudad: "Granada", profesion: "Cocinera", pais: "España" },
  { id: 17, nombre: "Francisco", edad: 39, ciudad: "Zaragoza", profesion: "Electricista", pais: "España" },
  { id: 18, nombre: "Isabel", edad: 29, ciudad: "Madrid", profesion: "Chef", pais: "España" },
  { id: 19, nombre: "Carlos Alberto", edad: 28, ciudad: "Alicante", profesion: "Carpintero", pais: "España" },
  { id: 20, nombre: "Ana María", edad: 41, ciudad: "Murcia", profesion: "Abogada", pais: "España" }
]);

columns.value.push({ 
  key: "fechaIngreso", 
  label: "Fecha de Ingreso", 
  filterable: true, 
  sortable: true, 
  type: "date" 
});

// Add dates to existing rows
rows.value.forEach(row => {
  row.fechaIngreso = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
});

const handleColumnUpdate = (payload) => {
  const { columnKey, updatedRow } = payload;
  // Maneja la actualización aquí
  console.log('Columna actualizada:', columnKey);
  console.log('Fila actualizada:', updatedRow);
}
</script>
