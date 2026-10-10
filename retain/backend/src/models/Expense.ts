import { Schema, Types, model } from 'mongoose';

export const PAYMENT_METHODS = ['cash', 'card', 'mobile_money', 'bank_transfer'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface IExpense {
  user: Types.ObjectId;
  title: string;
  amount: number;
  category: Types.ObjectId;
  date: Date;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    date: { type: Date, required: true, index: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Expense = model<IExpense>('Expense', expenseSchema);
