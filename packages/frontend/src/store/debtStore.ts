import { defineStore } from 'pinia';
import { addDebt, fetchDebts, updateDebt, deleteDebt, fetchAmortizationSchedule } from '../services/api';

interface AmortizationEntry {
  month: number;
  interest: number;
  principal: number;
  insurance: number;
  total_payment: number;
  remaining_balance: number;
}

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
  amortizationSchedule?: AmortizationEntry[];
}

interface DebtState {
  debts: Debt[];
}

export const useDebtStore = defineStore('debts', {
  state: (): DebtState => ({
    debts: [],
  }),
  getters: {
    totalMonthlyDebtBurden(): number {
      return this.debts.reduce((sum, debt) => {
        if (debt.amortizationSchedule && debt.amortizationSchedule.length > 0) {
          // Assuming the first entry in the schedule is the current monthly payment
          return sum + debt.amortizationSchedule[0].total_payment;
        }
        return sum;
      }, 0);
    },
  },
  actions: {
    async loadDebts() {
      try {
        const fetchedDebts = await fetchDebts();
        this.debts = await Promise.all(fetchedDebts.map(async (debt: any) => {
          const newDebt: Debt = { ...debt, id: debt._id };
          if (newDebt.amortization === 'french' && newDebt.id) {
            try {
              const schedule = await fetchAmortizationSchedule(newDebt.id);
              newDebt.amortizationSchedule = schedule.schedule;
            } catch (error) {
              console.error(`Error fetching amortization for debt ${newDebt.id}:`, error);
            }
          }
          return newDebt;
        }));
      } catch (error) {
        console.error('Error in loadDebts action:', error);
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
