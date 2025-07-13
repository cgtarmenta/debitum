<template>
  <div class="mt-8">
    <h2 class="text-2xl font-semibold mb-4">Your Debts</h2>
    <div v-if="debts.length === 0" class="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
      No debts recorded yet. Add a new debt to get started!
    </div>
    <div v-else class="bg-white p-6 rounded-lg shadow-md">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodicity</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Term</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIR</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AER</th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="debtItem in debts" :key="debtItem.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ debtItem.title }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ debtItem.debt }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ debtItem.periodicity }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ debtItem.payment_term }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ debtItem.nir }}%</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ debtItem.aer }}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <router-link :to="`/debt-entry?id=${debtItem.id}`" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</router-link>
              <button @click="confirmDelete(debtItem.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDebtStore } from '../store/debtStore';
import { storeToRefs } from 'pinia';

const debtStore = useDebtStore();
const { debts } = storeToRefs(debtStore);

onMounted(() => {
  debtStore.loadDebts();
});

const confirmDelete = async (id: number) => {
  if (confirm('Are you sure you want to delete this debt?')) {
    await debtStore.deleteDebt(id);
  }
};
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
