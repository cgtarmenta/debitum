import { defineStore } from 'pinia';
import { fetchGlobalInfo, updateGlobalInfo } from '../services/api';

interface GlobalInfoState {
  monthly_income: number;
  max_debt_percentage: number;
}

export const useGlobalStore = defineStore('global', {
  state: (): GlobalInfoState => ({
    monthly_income: 0,
    max_debt_percentage: 0,
  }),
  actions: {
    async loadGlobalInfo() {
      try {
        const data = await fetchGlobalInfo();
        this.monthly_income = data.monthly_income;
        this.max_debt_percentage = data.max_debt_percentage;
      } catch (error) {
        console.error('Failed to load global info:', error);
      }
    },
    async saveGlobalInfo(payload: { monthly_income: number; max_debt_percentage: number }) {
      try {
        await updateGlobalInfo(payload);
        this.monthly_income = payload.monthly_income;
        this.max_debt_percentage = payload.max_debt_percentage;
        alert('Global information saved successfully!');
      } catch (error) {
        console.error('Failed to save global info:', error);
        alert('Failed to save global information.');
      }
    },
  },
});
