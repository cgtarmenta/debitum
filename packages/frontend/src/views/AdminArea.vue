<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Admin Area</h1>
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Global Financial Information</h2>
      <form @submit.prevent="saveGlobalInfo">
        <div class="mb-4">
          <label for="monthlyIncome" class="block text-gray-700 text-sm font-bold mb-2">Monthly Income:</label>
          <input
            type="number"
            id="monthlyIncome"
            v-model.number="monthly_income"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 3000"
            required
          />
          <p v-if="validationErrors.monthly_income" class="text-red-500 text-xs italic">{{ validationErrors.monthly_income }}</p>
        </div>
        <div class="mb-6">
          <label for="maxDebtPercentage" class="block text-gray-700 text-sm font-bold mb-2">Max % of Income to Spend on Debt:</label>
          <input
            type="number"
            id="maxDebtPercentage"
            v-model.number="max_debt_percentage"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 30 (for 30%)"
            required
          />
          <p v-if="validationErrors.max_debt_percentage" class="text-red-500 text-xs italic">{{ validationErrors.max_debt_percentage }}</p>
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Save Information
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useGlobalStore } from '../store/globalStore';
import { storeToRefs } from 'pinia';

const globalStore = useGlobalStore();
const { monthly_income, max_debt_percentage } = storeToRefs(globalStore);

const validationErrors = ref({
  monthly_income: '',
  max_debt_percentage: '',
});

const validateForm = () => {
  let isValid = true;
  validationErrors.value = { monthly_income: '', max_debt_percentage: '' };

  if (monthly_income.value <= 0) {
    validationErrors.value.monthly_income = 'Monthly income must be a positive number.';
    isValid = false;
  }

  if (max_debt_percentage.value < 0 || max_debt_percentage.value > 100) {
    validationErrors.value.max_debt_percentage = 'Max debt percentage must be between 0 and 100.';
    isValid = false;
  }

  return isValid;
};

const saveGlobalInfo = async () => {
  if (!validateForm()) {
    return;
  }
  await globalStore.saveGlobalInfo({
    monthly_income: monthly_income.value,
    max_debt_percentage: max_debt_percentage.value,
  });
};

onMounted(() => {
  globalStore.loadGlobalInfo();
});
</script>

<style scoped>
/* Add any specific styles if needed, though Tailwind should handle most styling */
</style>
