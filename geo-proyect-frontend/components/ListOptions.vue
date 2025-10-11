<script setup>
import { ref } from 'vue';
const props = defineProps({
  myOptions: {
    type: Object,
    required: true
  }
});

</script>
<template>
    <div class="w-full max-w-md rounded-lg p-6">
      <ul class="flex flex-col items-center gap-4">
        <li v-for="option in myOptions?.submenu" :key="option.title"
          class="w-full bg-primary text-white rounded-lg  text-center border border-transparent hover:bg-white hover:text-primary hover:border-slate-100 transition  shadow-lg">
          <nuxt-link :to="option.link" class="block w-full h-full py-4 px-6 text-lg font-semibold">
            {{ option.title }}
          </nuxt-link>
        </li>
      </ul>
    </div>
</template>
