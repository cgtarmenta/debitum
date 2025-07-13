<template>
  <div
    v-if="message"
    :class="{
      'bg-green-500': type === 'success',
      'bg-red-500': type === 'error',
    }"
    class="fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out transform"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '../store/notificationStore';
import { storeToRefs } from 'pinia';

const notificationStore = useNotificationStore();
const { message, type } = storeToRefs(notificationStore);
</script>

<style scoped>
/* No specific styles needed here as Tailwind handles most of it */
</style>
