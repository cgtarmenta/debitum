<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Debt Entry</h1>
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">{{ debt && debt.id ? 'Edit Debt' : 'Add New Debt' }}</h2>
      <form v-if="debt" @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="title" class="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            v-model="debt.title"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p v-if="validationErrors.title" class="text-red-500 text-xs italic">{{ validationErrors.title }}</p>
        </div>
        <div class="mb-4">
          <label for="debtAmount" class="block text-gray-700 text-sm font-bold mb-2">Debt Amount:</label>
          <input
            type="number"
            id="debtAmount"
            v-model.number="debt.debt"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p v-if="validationErrors.debt" class="text-red-500 text-xs italic">{{ validationErrors.debt }}</p>
        </div>
        <div class="mb-4">
          <label for="periodicity" class="block text-gray-700 text-sm font-bold mb-2">Periodicity:</label>
          <select
            id="periodicity"
            v-model="debt.periodicity"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Periodicity</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
          <p v-if="validationErrors.periodicity" class="text-red-500 text-xs italic">{{ validationErrors.periodicity }}</p>
        </div>
        <div class="mb-4">
          <label for="paymentTerm" class="block text-gray-700 text-sm font-bold mb-2">Payment Term (in periods):</label>
          <input
            type="number"
            id="paymentTerm"
            v-model.number="debt.payment_term"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p v-if="validationErrors.payment_term" class="text-red-500 text-xs italic">{{ validationErrors.payment_term }}</p>
        </div>
        <div class="mb-4">
          <label for="nir" class="block text-gray-700 text-sm font-bold mb-2">Nominal Interest Rate (%):</label>
          <input
            type="number"
            id="nir"
            v-model.number="debt.nir"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            step="0.01"
            required
          />
          <p v-if="validationErrors.nir" class="text-red-500 text-xs italic">{{ validationErrors.nir }}</p>
        </div>
        <div class="mb-4">
          <label for="aer" class="block text-gray-700 text-sm font-bold mb-2">Annual Equivalent Rate (%):</label>
          <input
            type="number"
            id="aer"
            v-model.number="debt.aer"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            step="0.01"
            required
          />
          <p v-if="validationErrors.aer" class="text-red-500 text-xs italic">{{ validationErrors.aer }}</p>
        </div>
        <div class="mb-4">
          <label for="insuranceRate" class="block text-gray-700 text-sm font-bold mb-2">Insurance Rate (% of pending capital):</label>
          <input
            type="number"
            id="insuranceRate"
            v-model.number="debt.insurance_rate"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            step="0.01"
          />
          <p v-if="validationErrors.insurance_rate" class="text-red-500 text-xs italic">{{ validationErrors.insurance_rate }}</p>
        </div>
        <div class="mb-6">
          <label for="startDate" class="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
          <input
            type="date"
            id="startDate"
            v-model="debt.start_date"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p v-if="validationErrors.start_date" class="text-red-500 text-xs italic">{{ validationErrors.start_date }}</p>
        </div>
        <div class="mb-6">
          <label for="amortization" class="block text-gray-700 text-sm font-bold mb-2">Amortization Type:</label>
          <select
            id="amortization"
            v-model="debt.amortization"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="french">French Amortization</option>
          </select>
          <p v-if="validationErrors.amortization" class="text-red-500 text-xs italic">{{ validationErrors.amortization }}</p>
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {{ debt.id ? 'Update Debt' : 'Add Debt' }}
          </button>
        </div>
      </form>
      <div v-else class="text-center text-gray-500">
        Loading debt details...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDebtStore } from '../store/debtStore';

interface DebtForm {
  id?: string;
  title: string;
  debt: number;
  periodicity: string;
  payment_term: number;
  nir: number;
  aer: number;
  start_date: string;
  insurance_rate?: number;
  amortization?: string;
}

const debt = ref<DebtForm | null>(null); // Initialize as null

const debtStore = useDebtStore();
const route = useRoute();
const router = useRouter();

const validationErrors = ref({
  title: '',
  debt: '',
  periodicity: '',
  payment_term: '',
  nir: '',
  aer: '',
  start_date: '',
  amortization: '',
  insurance_rate: '',
});

const validateForm = () => {
  let isValid = true;
  // Reset validation errors
  validationErrors.value = { title: '', debt: '', periodicity: '', payment_term: '', nir: '', aer: '', start_date: '', amortization: '', insurance_rate: '' };

  if (!debt.value!.title) {
    validationErrors.value.title = 'Title is required.';
    isValid = false;
  }
  if (debt.value!.debt <= 0) {
    validationErrors.value.debt = 'Debt amount must be a positive number.';
    isValid = false;
  }
  if (!debt.value!.periodicity) {
    validationErrors.value.periodicity = 'Periodicity is required.';
    isValid = false;
  }
  if (debt.value!.payment_term <= 0) {
    validationErrors.value.payment_term = 'Payment term must be a positive number.';
    isValid = false;
  }
  if (debt.value!.nir < 0) {
    validationErrors.value.nir = 'NIR cannot be negative.';
    isValid = false;
  }
  if (debt.value!.aer < 0) {
    validationErrors.value.aer = 'AER cannot be negative.';
    isValid = false;
  }
  if (debt.value!.insurance_rate && debt.value!.insurance_rate < 0) {
    validationErrors.value.insurance_rate = 'Insurance rate cannot be negative.';
    isValid = false;
  }
  if (!debt.value!.start_date) {
    validationErrors.value.start_date = 'Start date is required.';
    isValid = false;
  }
  if (!debt.value!.amortization) {
    validationErrors.value.amortization = 'Amortization type is required.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  const payload: Partial<DebtForm> = {};
  const allowedFields: Array<keyof DebtForm> = [
    'title',
    'debt',
    'periodicity',
    'payment_term',
    'nir',
    'aer',
    'start_date',
    'insurance_rate',
    'amortization',
  ];

  for (const field of allowedFields) {
    if (debt.value![field] !== undefined) {
      payload[field] = debt.value![field];
    }
  }

  // Convert start_date to ISO string for backend
  if (payload.start_date) {
    payload.start_date = new Date(payload.start_date).toISOString();
  }

  if (debt.value!.id) {
    await debtStore.updateDebt(debt.value!.id, payload);
  } else {
    await debtStore.addDebt(payload as DebtForm);
  }

  // Navigate back to dashboard after successful submission
  router.push('/');
};

onMounted(async () => {
  if (route.query.id) {
    const debtId = route.query.id as string;
    await debtStore.loadDebts(); // Ensure debts are loaded
    console.log('Debts in store after load:', debtStore.debts);
    const existingDebt = debtStore.debts.find(d => d.id === debtId);
    if (existingDebt) {
      debt.value = { ...existingDebt, start_date: existingDebt.start_date.split('T')[0] };
    } else {
      console.error('Debt not found for editing.');
      router.push('/debt-entry'); // Redirect to add new debt if not found
    }
  } else {
    // Initialize for new debt entry
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    debt.value = {
      title: '',
      debt: 0,
      periodicity: '',
      payment_term: 0,
      nir: 0,
      aer: 0,
      start_date: formattedDate,
      amortization: 'french' as string | undefined,
      insurance_rate: 0,
    };
  }
});
</script>

<style scoped>
/* Add any specific styles if needed, though Tailwind should handle most styling */
</style>
