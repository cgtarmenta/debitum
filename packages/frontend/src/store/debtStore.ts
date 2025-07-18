import { defineStore } from 'pinia';
import { addDebt, fetchDebts, updateDebt, deleteDebt } from '../services/api';

interface Debt {
  id?: string;
  title: string;
  debt: number;
  periodicity: string;
  payment_term: number;
  nir: number;
  aer: number;
  start_date: string;
  insurance_rate?: number;
  contractual_payment: number;
  amortization?: string;
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
        const fetchedDebts = await fetchDebts();
        this.debts = fetchedDebts.map((debt: any) => ({
          ...debt,
          id: debt._id,
        }));
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
    async updateDebt(id: string, debt: Debt) {
      try {
        await updateDebt(id, debt);
        await this.loadDebts(); // Reload debts after updating
        alert('Debt updated successfully!');
      } catch (error) {
        console.error('Failed to update debt:', error);
        alert('Failed to update debt.');
      }
    },
    async deleteDebt(id: string) {
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
