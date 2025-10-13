<template>
  <div class="">
    <!-- Barra de búsqueda y botones de selección -->
    <div>

    </div>

    <!-- Mapa y listado de viviendas -->
    <div>
      <!--  Mapa  -->
      <div>

      </div>
      <!-- Listado de viviendas -->
      <div class="flex flex-col gap-4">
        <PropertyBox
          v-for="(property, idx) in properties"
          :key="idx"
          v-bind="property"
          />
      </div>
    </div>
  </div>
</template>

<script lang="ts">

const properties = [
  {
    propertyImage: 'casa1.jpg',
    propertyTittle: 'Casa Moderna',
    propertyAdress: 'Calle Falsa 123',
    propertyCommune: 'Santiago',
    propertyPrice: '250000',
    propertyDescription: 'Una casa moderna en el centro.'
  },
  {
    propertyImage: 'departamento1.jpg',
    propertyTittle: 'Departamento Acogedor',
    propertyAdress: 'Avenida Siempre Viva 456',
    propertyCommune: 'Ñuñoa',
    propertyPrice: '180000',
    propertyDescription: 'Departamento cerca de la naturaleza.'
  }
]
</script>
