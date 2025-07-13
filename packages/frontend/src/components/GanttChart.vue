<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const debtStore = useDebtStore();

interface Debt {
  id?: string;
  title: string;
  debt: number;
  periodicity: string;
  payment_term: number;
  nir: number;
  aer: number;
}

const calculateMonths = (paymentTerm: number, periodicity: string): number => {
  switch (periodicity) {
    case 'monthly':
      return paymentTerm;
    case 'weekly':
      return Math.ceil(paymentTerm / 4); // Approx 4 weeks per month
    case 'bi-weekly':
      return Math.ceil(paymentTerm / 2); // Approx 2 bi-weeks per month
    case 'quarterly':
      return paymentTerm * 3;
    case 'annually':
      return paymentTerm * 12;
    default:
      return paymentTerm;
  }
};

const chartData = computed(() => {
  const labels = debtStore.debts.map(debt => debt.title);
  const data = debtStore.debts.map(debt => calculateMonths(debt.payment_term, debt.periodicity));

  return {
    labels: labels,
    datasets: [
      {
        label: 'Repayment Duration (Months)',
        backgroundColor: '#FF9800',
        data: data,
      },
    ],
  };
});

const chartOptions = {
  indexAxis: 'y' as const, // This makes it a horizontal bar chart
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Debt Repayment Timeline',
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Months',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Debt',
      },
    },
  },
};
</script>
