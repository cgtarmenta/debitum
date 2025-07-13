import { defineStore } from 'pinia';

interface NotificationState {
  message: string | null;
  type: 'success' | 'error' | null;
  timeoutId: number | null;
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    message: null,
    type: null,
    timeoutId: null,
  }),
  actions: {
    showNotification(message: string, type: 'success' | 'error', duration = 3000) {
      this.message = message;
      this.type = type;

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.timeoutId = setTimeout(() => {
        this.clearNotification();
      }, duration);
    },
    clearNotification() {
      this.message = null;
      this.type = null;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    },
  },
});
