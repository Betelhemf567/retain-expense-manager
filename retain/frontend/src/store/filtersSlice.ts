import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaymentMethod } from '../types';

export type SortBy = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

export interface FiltersState {
  search: string;
  category: string; // category id, '' = all
  paymentMethod: PaymentMethod | ''; // '' = all
  from: string; // YYYY-MM-DD, '' = no limit
  to: string;
  minAmount: string;
  maxAmount: string;
  sortBy: SortBy;
  order: SortOrder;
  page: number;
  limit: number;
}

export const initialFilters: FiltersState = {
  search: '',
  category: '',
  paymentMethod: '',
  from: '',
  to: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
  limit: 10,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState: initialFilters,
  reducers: {
    // Any change to a filter sends the user back to page 1.
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload;
      state.page = 1;
    },
    setPaymentMethod(state, action: PayloadAction<PaymentMethod | ''>) {
      state.paymentMethod = action.payload;
      state.page = 1;
    },
    setDateRange(state, action: PayloadAction<{ from: string; to: string }>) {
      state.from = action.payload.from;
      state.to = action.payload.to;
      state.page = 1;
    },
    setAmountRange(state, action: PayloadAction<{ min: string; max: string }>) {
      state.minAmount = action.payload.min;
      state.maxAmount = action.payload.max;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: SortBy; order: SortOrder }>) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters: () => initialFilters,
  },
});

export const { setSearch, setCategory, setPaymentMethod, setDateRange, setAmountRange, setSort, setPage, resetFilters } =
  filtersSlice.actions;
export default filtersSlice.reducer;
