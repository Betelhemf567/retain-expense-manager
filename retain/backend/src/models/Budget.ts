import { Schema, Types, model } from 'mongoose';

export interface IBudget {
  user: Types.ObjectId;
  month: string; // YYYY-MM
  amount: number;
}

const budgetSchema = new Schema<IBudget>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
});
budgetSchema.index({ user: 1, month: 1 }, { unique: true });

export const Budget = model<IBudget>('Budget', budgetSchema);
