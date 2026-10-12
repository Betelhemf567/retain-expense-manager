import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { Budget } from './models/Budget';
import { Category } from './models/Category';
import { Expense, PAYMENT_METHODS } from './models/Expense';
import { User } from './models/User';
import { currentMonth } from './utils/month';

const CATEGORIES = ['Uncategorized', 'Food', 'Transport', 'Accommodation', 'Subscriptions', 'Health', 'Entertainment', 'Education'];
const TITLES: Record<string, string[]> = {
  Food: ['Lunch', 'Groceries', 'Coffee', 'Dinner out'],
  Transport: ['Bus fare', 'Taxi', 'Fuel'],
  Accommodation: ['Rent', 'Electricity bill', 'Water bill'],
  Subscriptions: ['Netflix', 'Spotify', 'Cloud storage'],
  Health: ['Pharmacy', 'Clinic visit'],
  Entertainment: ['Movie night', 'Concert ticket'],
  Education: ['Textbook', 'Online course'],
  Uncategorized: ['Misc purchase'],
};

const rand = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]): T => arr[rand(0, arr.length - 1)];

async function seed(): Promise<void> {
  await connectDB();
  // Dev/demo only: wipes everything first.
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Expense.deleteMany({}), Budget.deleteMany({})]);

  const cats = await Category.insertMany(CATEGORIES.map((name) => ({ name, isDefault: name === 'Uncategorized' })));

  const admin = await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL ?? 'admin@retain.app',
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'Admin1234!', 10),
    role: 'admin',
  });

  const demoHash = await bcrypt.hash('Demo1234!', 10);
  const users = await User.insertMany([
    { name: 'Demo User', email: 'demo@retain.app', passwordHash: demoHash, role: 'user' },
    { name: 'Amina Tesfaye', email: 'amina@retain.app', passwordHash: demoHash, role: 'user' },
    { name: 'Kwame Mensah', email: 'kwame@retain.app', passwordHash: demoHash, role: 'user' },
  ]);

  const now = new Date();
  const docs = users.flatMap((u, i) =>
    Array.from({ length: i === 0 ? 120 : 40 }, () => {
      const cat = pick(cats);
      const date = new Date(now.getTime() - rand(0, 120) * 86400000);
      return {
        user: u._id,
        title: pick(TITLES[cat.name]),
        amount: rand(5, 250),
        category: cat._id,
        date,
        paymentMethod: pick(PAYMENT_METHODS),
        notes: Math.random() > 0.7 ? 'Seeded demo expense' : undefined,
      };
    })
  );
  await Expense.insertMany(docs);
  await Budget.create({ user: users[0]._id, month: currentMonth(), amount: 1500 });

  console.log(`Seeded. Admin: ${admin.email} | Demo user: demo@retain.app / Demo1234!`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
