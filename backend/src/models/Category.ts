import { Schema, model } from 'mongoose';

export interface ICategory {
  name: string;
  isDefault: boolean;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true },
  isDefault: { type: Boolean, default: false },
});

export const Category = model<ICategory>('Category', categorySchema);
