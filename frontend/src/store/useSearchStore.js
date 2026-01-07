import { create } from 'zustand';

const useSearchStore = create((set) => ({
    query: '',
    setQuery: (query) => set({ query }),
    clearSearch: () => set({ query: '' }),
}));

export default useSearchStore;
