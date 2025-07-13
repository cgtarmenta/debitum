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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const debtStore = useDebtStore();

const calculateMonthlyPayment = (debtAmount: number, nir: number, paymentTerm: number, periodicity: string): number => {
  // Simple approximation for monthly payment. A real application would use a more precise amortization formula.
  // For now, let's assume NIR is annual and convert it to monthly if periodicity is monthly.
  // This is a simplified calculation and might need adjustment based on actual financial formulas.

  let monthlyRate = nir / 100 / 12; // Convert annual NIR to monthly rate
  let numberOfPayments = paymentTerm; // Assuming paymentTerm is already in months or equivalent periods

  if (periodicity === 'annually') {
    monthlyRate = nir / 100 / 12; // Still convert to monthly rate
    numberOfPayments = paymentTerm * 12; // Convert years to months
  } else if (periodicity === 'quarterly') {
    monthlyRate = nir / 100 / 4; // Convert annual NIR to quarterly rate
    numberOfPayments = paymentTerm * 4; // Convert quarters to months
  } else if (periodicity === 'weekly') {
    monthlyRate = nir / 100 / 52; // Convert annual NIR to weekly rate
    numberOfPayments = paymentTerm * 52; // Convert weeks to months
  } else if (periodicity === 'bi-weekly') {
    monthlyRate = nir / 100 / 26; // Convert annual NIR to bi-weekly rate
    numberOfPayments = paymentTerm * 26; // Convert bi-weeks to months
  }

  if (monthlyRate === 0) {
    return debtAmount / numberOfPayments; // Simple division if no interest
  } else {
    // Amortization formula for fixed payments
    return (debtAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
  }
};

const chartData = computed(() => {
  const labels = debtStore.debts.map(debt => debt.title);
  const monthlyBurdens = debtStore.debts.map(debt =>
    calculateMonthlyPayment(debt.debt, debt.nir, debt.payment_term, debt.periodicity)
  );

  return {
    labels: labels,
    datasets: [
      {
        label: 'Monthly Burden',
        backgroundColor: '#42A5F5',
        data: monthlyBurdens,
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
