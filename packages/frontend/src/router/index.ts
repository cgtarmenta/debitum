import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import AdminArea from '../views/AdminArea.vue';
import DebtEntry from '../views/DebtEntry.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/admin',
    name: 'AdminArea',
    component: AdminArea,
  },
  {
    path: '/debt-entry',
    name: 'DebtEntry',
    component: DebtEntry,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
