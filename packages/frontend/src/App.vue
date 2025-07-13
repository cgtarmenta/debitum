<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="{'w-64': isSidebarOpen, 'w-20': !isSidebarOpen}"
      class="bg-gray-800 text-white transition-all duration-300 ease-in-out flex-shrink-0"
    >
      <div class="p-4 flex items-center justify-between">
        <h1 v-if="isSidebarOpen" class="text-2xl font-semibold">Debitum</h1>
        <button @click="toggleSidebar" class="text-white focus:outline-none">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              v-if="isSidebarOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
      <nav class="mt-5">
        <ul>
          <li>
            <router-link
              to="/"
              class="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span class="mr-3">📊</span>
              <span v-if="isSidebarOpen">Dashboard</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/debt-entry"
              class="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span class="mr-3">💸</span>
              <span v-if="isSidebarOpen">Debt Entry</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin"
              class="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span class="mr-3">⚙️</span>
              <span v-if="isSidebarOpen">Admin Area</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
      <router-view />
    </main>
    <LoadingSpinner />
    <NotificationDisplay />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoadingSpinner from './components/LoadingSpinner.vue';
import NotificationDisplay from './components/NotificationDisplay.vue';

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<style scoped>
/* No specific styles needed here as Tailwind handles most of it */
</style>
