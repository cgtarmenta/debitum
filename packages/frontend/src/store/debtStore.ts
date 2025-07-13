import { defineStore } from 'pinia';
import { addDebt, fetchDebts, updateDebt, deleteDebt } from '../services/api';

interface Debt {
  id?: number;
  title: string;
  debt: number;
  periodicity: string;
  payment_term: number;
  nir: number;
  aer: number;
  start_date: string;
}

interface DebtState {
  debts: Debt[];
}

export const useDebtStore = defineStore('debts', {
  state: (): DebtState => ({
    debts: [],
  }),
  actions: {
    async loadDebts() {
      try {
        this.debts = await fetchDebts();
      } catch (error) {
        console.error('Failed to load debts:', error);
      }
    },
    async addDebt(debt: Debt) {
      try {
        await addDebt(debt);
        await this.loadDebts(); // Reload debts after adding
        alert('Debt added successfully!');
      } catch (error) {
        console.error('Failed to add debt:', error);
        alert('Failed to add debt.');
      }
    },
    async updateDebt(id: number, debt: Debt) {
      try {
        await updateDebt(id, debt);
        await this.loadDebts(); // Reload debts after updating
        alert('Debt updated successfully!');
      } catch (error) {
        console.error('Failed to update debt:', error);
        alert('Failed to update debt.');
      }
    },
    async deleteDebt(id: number) {
      try {
        await deleteDebt(id);
        await this.loadDebts(); // Reload debts after deleting
        alert('Debt deleted successfully!');
      } catch (error) {
        console.error('Failed to delete debt:', error);
        alert('Failed to delete debt.');
      }
    },
  },
});
