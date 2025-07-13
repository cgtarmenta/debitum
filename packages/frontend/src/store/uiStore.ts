import { defineStore } from 'pinia';

interface UiState {
  isLoading: boolean;
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    isLoading: false,
  }),
  actions: {
    setLoading(status: boolean) {
      this.isLoading = status;
    },
  },
});
