import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, InputAdornment, MenuItem, Paper, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import {
  resetFilters,
  setAmountRange,
  setCategory,
  setDateRange,
  setPaymentMethod,
  setSearch,
  setSort,
  type SortBy,
  type SortOrder,
} from '../store/filtersSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { PAYMENT_LABELS, PAYMENT_METHODS, type Category, type PaymentMethod } from '../types';

const SORT_OPTIONS: { value: `${SortBy}:${SortOrder}`; label: string }[] = [
  { value: 'date:desc', label: 'Newest first' },
  { value: 'date:asc', label: 'Oldest first' },
  { value: 'amount:desc', label: 'Highest amount' },
  { value: 'amount:asc', label: 'Lowest amount' },
];

export function ExpenseFilters({ categories }: { categories: Category[] }) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);

  // Text inputs keep local state and push to Redux after a short pause.
  const [searchText, setSearchText] = useState(filters.search);
  const [minText, setMinText] = useState(filters.minAmount);
  const [maxText, setMaxText] = useState(filters.maxAmount);
  const debouncedSearch = useDebounce(searchText);
  const debouncedMin = useDebounce(minText);
  const debouncedMax = useDebounce(maxText);

  useEffect(() => {
    if (debouncedSearch.trim() !== filters.search) dispatch(setSearch(debouncedSearch.trim()));
  }, [debouncedSearch, filters.search, dispatch]);

  useEffect(() => {
    if (debouncedMin !== filters.minAmount || debouncedMax !== filters.maxAmount)
      dispatch(setAmountRange({ min: debouncedMin, max: debouncedMax }));
  }, [debouncedMin, debouncedMax, filters.minAmount, filters.maxAmount, dispatch]);

  const handleReset = () => {
    setSearchText('');
    setMinText('');
    setMaxText('');
    dispatch(resetFilters());
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
        <TextField
          label="Search"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Title or notes"
          sx={{ gridColumn: { md: 'span 2' } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField select label="Category" size="small" value={filters.category} onChange={(e) => dispatch(setCategory(e.target.value))}>
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Payment method"
          size="small"
          value={filters.paymentMethod}
          onChange={(e) => dispatch(setPaymentMethod(e.target.value as PaymentMethod | ''))}
        >
          <MenuItem value="">All methods</MenuItem>
          {PAYMENT_METHODS.map((m) => (
            <MenuItem key={m} value={m}>
              {PAYMENT_LABELS[m]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="From"
          type="date"
          size="small"
          value={filters.from}
          onChange={(e) => dispatch(setDateRange({ from: e.target.value, to: filters.to }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={filters.to}
          onChange={(e) => dispatch(setDateRange({ from: filters.from, to: e.target.value }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField label="Min amount" type="number" size="small" value={minText} onChange={(e) => setMinText(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
        <TextField label="Max amount" type="number" size="small" value={maxText} onChange={(e) => setMaxText(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
        <TextField
          select
          label="Sort by"
          size="small"
          value={`${filters.sortBy}:${filters.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split(':') as [SortBy, SortOrder];
            dispatch(setSort({ sortBy, order }));
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Button startIcon={<ClearIcon />} onClick={handleReset} sx={{ justifySelf: 'start' }}>
          Reset filters
        </Button>
      </Box>
    </Paper>
  );
}
