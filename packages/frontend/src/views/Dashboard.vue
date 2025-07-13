<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- Monthly Burden Card -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Monthly Debt Burden</h2>
        <div class="mt-4 h-64">
          <MonthlyBurdenChart v-if="debts.length > 0" />
          <p v-else class="text-gray-500">No debt data to display.</p>
        </div>
      </div>

      <!-- Debt Distribution Card -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Debt Distribution</h2>
        <div class="mt-4 h-64">
          <DebtDistributionChart v-if="debts.length > 0" />
          <p v-else class="text-gray-500">No debt data to display.</p>
        </div>
      </div>

      <!-- Future Projections Card -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Future Projections</h2>
        <div class="mt-4 h-64">
          <FutureProjectionsChart v-if="debts.length > 0" />
          <p v-else class="text-gray-500">No debt data to display.</p>
        </div>
      </div>
    </div>

    <!-- Gantt Chart Section -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Debt Repayment Timeline (Gantt Chart)</h2>
      <div class="mt-4 h-96">
        <GanttChart v-if="debts.length > 0" />
        <p v-else class="text-gray-500">No debt data to display.</p>
      </div>
    </div>

    <DebtList />
  </div>
</template>

<script setup lang="ts">
import MonthlyBurdenChart from '../components/MonthlyBurdenChart.vue';
import DebtDistributionChart from '../components/DebtDistributionChart.vue';
import FutureProjectionsChart from '../components/FutureProjectionsChart.vue';
import GanttChart from '../components/GanttChart.vue';
import DebtList from '../components/DebtList.vue';
import { onMounted } from 'vue';
import { useDebtStore } from '../store/debtStore';
import { useGlobalStore } from '../store/globalStore';
import { storeToRefs } from 'pinia';

const debtStore = useDebtStore();
const globalStore = useGlobalStore();

const { debts } = storeToRefs(debtStore);
const { monthly_income, max_debt_percentage } = storeToRefs(globalStore);

onMounted(() => {
  debtStore.loadDebts();
  globalStore.loadGlobalInfo();
});
</script>

<style scoped>
/* Styles for Dashboard */
</style>
