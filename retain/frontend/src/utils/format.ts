const CURRENCY = 'USD'; // change this one constant to switch currency everywhere

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY });

export const formatMoney = (amount: number): string => money.format(amount);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

/** ISO string -> value for <input type="date"> */
export const toDateInput = (iso: string): string => iso.slice(0, 10);

export const todayInput = (): string => new Date().toISOString().slice(0, 10);
