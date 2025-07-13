<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { useDebtStore } from '../store/debtStore';
import { storeToRefs } from 'pinia';
import { fetchAmortizationSchedule } from '../services/api';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const debtStore = useDebtStore();
const { debts } = storeToRefs(debtStore);

const monthlyPayments = ref<{ [debtId: string]: number }>({});
const isLoadingAmortization = ref(false);

const getMonthlyPaymentFromSchedule = (schedule: any[]): number => {
  if (schedule && schedule.length > 0) {
    return schedule[0].principal + schedule[0].interest;
  }
  return 0;
};

watch(debts, async (newDebts) => {
  isLoadingAmortization.value = true;
  const newMonthlyPayments: { [debtId: string]: number } = {};
  for (const debt of newDebts) {
    if (debt.amortization === 'french' && debt.id) {
      try {
        const schedule = await fetchAmortizationSchedule(debt.id);
        newMonthlyPayments[debt.id] = getMonthlyPaymentFromSchedule(schedule.schedule);
      } catch (error) {
        console.error(`Error fetching amortization for debt ${debt.id}:`, error);
        newMonthlyPayments[debt.id] = 0;
      }
    } else {
      newMonthlyPayments[debt.id!] = 0;
    }
  }
  monthlyPayments.value = newMonthlyPayments;
  isLoadingAmortization.value = false;
}, { immediate: true });

const chartData = computed(() => {
  const labels = debts.value.map(debt => debt.title);
  const burdens = debts.value.map(debt => monthlyPayments.value[debt.id!] || 0);

  return {
    labels: labels,
    datasets: [
      {
        label: 'Monthly Burden',
        backgroundColor: '#42A5F5',
        data: burdens,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Monthly Debt Burden by Debt',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Amount ($)',
      },
    },
  },
};
</script>