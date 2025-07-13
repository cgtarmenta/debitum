import axios from 'axios';
import { useUiStore } from '../store/uiStore';
import { useNotificationStore } from '@/store/notificationStore';

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

const API_BASE_URL = 'http://localhost:3000'; // Replace with your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    useUiStore().setLoading(true);
    return config;
  },
  (error) => {
    useUiStore().setLoading(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    useUiStore().setLoading(false);
    return response;
  },
  (error) => {
    useUiStore().setLoading(false);
    return Promise.reject(error);
  }
);

export const fetchGlobalInfo = async () => {
  const notificationStore = useNotificationStore();
  try {
    const response = await api.get('/global-info');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching global info:', error);
    notificationStore.showNotification(`Error fetching global info: ${error.message}`, 'error');
    throw error;
  }
};

export const updateGlobalInfo = async (data: any) => {
  const notificationStore = useNotificationStore();
  try {
    const response = await api.put('/global-info', data);
    notificationStore.showNotification('Global information updated successfully!', 'success');
    return response.data;
  } catch (error: any) {
    console.error('Error updating global info:', error);
    notificationStore.showNotification(`Error updating global info: ${error.message}`, 'error');
    throw error;
  }
};

export const fetchDebts = async () => {
  const notificationStore = useNotificationStore();
  try {
    const response = await api.get('/debts');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching debts:', error);
    notificationStore.showNotification(`Error fetching debts: ${error.message}`, 'error');
    throw error;
  }
};

export const addDebt = async (data: Debt) => {
  const notificationStore = useNotificationStore();
  try {
    const response = await api.post('/debts', data);
    notificationStore.showNotification('Debt added successfully!', 'success');
    return response.data;
  } catch (error: any) {
    console.error('Error adding debt:', error);
    notificationStore.showNotification(`Error adding debt: ${error.message}`, 'error');
    throw error;
  }
};

export const updateDebt = async (id: number, data: Partial<Debt>) => {
  const notificationStore = useNotificationStore();
  try {
    const response = await api.put(`/debts/${id}`, data);
    notificationStore.showNotification('Debt updated successfully!', 'success');
    return response.data;
  } catch (error: any) {
    console.error('Error updating debt:', error);
    notificationStore.showNotification(`Error updating debt: ${error.message}`, 'error');
    throw error;
  }
};

export const deleteDebt = async (id: number) => {
  const notificationStore = useNotificationStore();
  try {
    const response = await api.delete(`/debts/${id}`);
    notificationStore.showNotification('Debt deleted successfully!', 'success');
    return response.data;
  } catch (error: any) {
    console.error('Error deleting debt:', error);
    notificationStore.showNotification(`Error deleting debt: ${error.message}`, 'error');
    throw error;
  }
};
