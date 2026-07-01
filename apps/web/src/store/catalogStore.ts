import { create } from 'zustand';

interface CatalogFilters {
  categoryId: number | undefined;
  search: string;
  page: number;
}

interface CatalogStore extends CatalogFilters {
  setCategory: (categoryId: number | undefined) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  reset: () => void;
}

const initialFilters: CatalogFilters = {
  categoryId: undefined,
  search: '',
  page: 1,
};

export const useCatalogStore = create<CatalogStore>((set) => ({
  ...initialFilters,
  setCategory: (categoryId) => set({ categoryId, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  reset: () => set(initialFilters),
}));
