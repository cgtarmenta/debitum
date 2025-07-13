<template>
  <Pie :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js';
import { useDebtStore } from '../store/debtStore';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const debtStore = useDebtStore();

const chartData = computed(() => {
  const labels = debtStore.debts.map(debt => debt.title);
  const data = debtStore.debts.map(debt => debt.debt);
  const backgroundColors = [
    '#42A5F5',
    '#66BB6A',
    '#FFA726',
    '#EF5350',
    '#AB47BC',
    '#7E57C2',
    '#26A69A',
    '#FFCA28',
    '#8D6E63',
    '#BDBDBD',
  ];

  return {
    labels: labels,
    datasets: [
      {
        backgroundColor: backgroundColors.slice(0, data.length),
        data: data,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Debt Distribution by Title',
    },
  },
};
</script>
