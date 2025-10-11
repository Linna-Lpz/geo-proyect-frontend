<template>
  <div class="flex flex-col items-center min-h-screen max-h-screen bg-white">
    <h1 class="pt-4">THE TITLE</h1>

    <ListOptions :myOptions="myOptions" />
  </div>
</template>

<script lang="ts" setup>
const myOptions = ref(menuOptions.find(option => option.title === 'Mantención'));
</script>