<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { useDebtStore } from '../store/debtStore';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
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

const calculateMonthlyPayment = (debtAmount: number, nir: number, paymentTerm: number, periodicity: string): number => {
  let monthlyRate = nir / 100 / 12; // Convert annual NIR to monthly rate
  let numberOfPayments = paymentTerm; // Assuming paymentTerm is already in months or equivalent periods

  if (periodicity === 'annually') {
    monthlyRate = nir / 100 / 12; 
    numberOfPayments = paymentTerm * 12; 
  } else if (periodicity === 'quarterly') {
    monthlyRate = nir / 100 / 4; 
    numberOfPayments = paymentTerm * 4; 
  } else if (periodicity === 'weekly') {
    monthlyRate = nir / 100 / 52; 
    numberOfPayments = paymentTerm * 52; 
  } else if (periodicity === 'bi-weekly') {
    monthlyRate = nir / 100 / 26; 
    numberOfPayments = paymentTerm * 26; 
  }

  if (monthlyRate === 0) {
    return debtAmount / numberOfPayments; 
  } else {
    return (debtAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
  }
};

const calculateFutureProjections = (debts: Debt[]) => {
  const projectionMonths = 60; // Project for 5 years (60 months)
  let currentTotalDebt = debts.reduce((sum, debt) => sum + debt.debt, 0);
  const monthlyPayments = debts.map(debt => calculateMonthlyPayment(debt.debt, debt.nir, debt.payment_term, debt.periodicity));
  const totalMonthlyPayment = monthlyPayments.reduce((sum, payment) => sum + payment, 0);

  const labels: string[] = [];
  const data: number[] = [];

  for (let i = 0; i <= projectionMonths; i++) {
    labels.push(`Month ${i}`);
    data.push(currentTotalDebt);

    if (currentTotalDebt <= 0) {
      currentTotalDebt = 0; // Debt fully paid off
    } else {
      // Simple projection: subtract total monthly payment from total debt
      // This does not account for interest accrual or individual debt repayment schedules accurately
      currentTotalDebt -= totalMonthlyPayment;
    }
  }

  return { labels, data };
};

const chartData = computed(() => {
  const { labels, data } = calculateFutureProjections(debtStore.debts);

  return {
    labels: labels,
    datasets: [
      {
        label: 'Total Debt Over Time',
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        data: data,
        fill: false,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Future Debt Projections',
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Months',
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Total Debt ($)',
      },
    },
  },
};
</script>
