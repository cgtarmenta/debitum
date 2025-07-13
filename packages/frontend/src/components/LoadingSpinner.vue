<template>
  <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '../store/uiStore';
import { storeToRefs } from 'pinia';

const uiStore = useUiStore();
const { isLoading } = storeToRefs(uiStore);
</script>

<style scoped>
/* No specific styles needed here as Tailwind handles most of it */
</style>
