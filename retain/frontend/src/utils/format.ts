const CURRENCY = 'USD'; // change this one constant to switch currency everywhere

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY });

export const formatMoney = (amount: number): string => money.format(amount);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

/** ISO string -> value for <input type="date"> */
export const toDateInput = (iso: string): string => iso.slice(0, 10);

export const todayInput = (): string => new Date().toISOString().slice(0, 10);

/** Current month as YYYY-MM (UTC, matching the API). */
export const currentMonth = (): string => new Date().toISOString().slice(0, 7);

export const formatMonth = (month: string): string => {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
};
